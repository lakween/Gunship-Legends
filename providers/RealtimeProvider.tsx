"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

type Listener = (payload: any) => void;

interface RealtimeContextValue {
  subscribe: (event: string, callback: Listener) => () => void;
  live: boolean;
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [live, setLive] = useState(false);
  const listenersRef = useRef<Map<string, Set<Listener>>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    channelRef.current = supabase
      .channel("app-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          listenersRef.current.forEach((callbacks) => {
            callbacks.forEach(cb => cb(payload));
          });
        }
      )
      .subscribe(status => {
        setLive(status === "SUBSCRIBED")
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setTimeout(() => {
            channelRef.current?.subscribe();
          }, 2000);
        }
      });

    return () => { supabase.removeChannel(channelRef.current!); };
  }, []);

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

