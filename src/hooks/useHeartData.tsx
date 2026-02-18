"use client";

import { useCallback, useEffect, useState } from "react";

type HeartResponse = { ok: boolean; data?: unknown; error?: string } | unknown;

export function useHeartData() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/get-heart-game-data");
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? `HTTP ${res.status}`);
        setData(json?.data ?? null);
      } else {
        const payload = (json as HeartResponse) ?? null;
        // If the proxy returned { ok, data }
        if (payload && typeof payload === "object" && (payload as any).ok !== undefined) {
          setData((payload as any).data ?? null);
          setError((payload as any).error ?? null);
        } else {
          setData(payload);
        }
      }
    } catch (err) {
      setError((err as Error).message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refresh: fetchData } as const;
}
