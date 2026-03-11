"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────────
type Listener = (payload: any) => void;

interface RealtimeContextValue {
  subscribe: (event: string, callback: Listener) => () => void;
  live: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────
export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

// ── Provider — one single channel shared by all children ─────────────────────
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [live, setLive] = useState(false);
  const listenersRef = useRef<Map<string, Set<Listener>>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    channelRef.current = supabase
      .channel("app-realtime")                     // ← single shared channel
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          // Dispatch to all registered listeners
          listenersRef.current.forEach((callbacks) => {
            callbacks.forEach(cb => cb(payload));
          });
        }
      )
      .subscribe(status => setLive(status === "SUBSCRIBED"));

    return () => { supabase.removeChannel(channelRef.current!); };
  }, []);

  // ── Subscribe — returns unsubscribe fn ───────────────────────────────────
  const subscribe = (key: string, callback: Listener): (() => void) => {
    if (!listenersRef.current.has(key)) {
      listenersRef.current.set(key, new Set());
    }
    listenersRef.current.get(key)!.add(callback);

    return () => {
      listenersRef.current.get(key)?.delete(callback);
    };
  };

  return (
    <RealtimeContext.Provider value={{ subscribe, live }}>
      {children}
    </RealtimeContext.Provider>
  );
}

