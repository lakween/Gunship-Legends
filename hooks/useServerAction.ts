"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useServerAction<T>(
  action: () => Promise<ActionResult<T>>,
  runOnMount = true
) {
  const [data, setData]   = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const execute = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.success) {
        setData(result.data ?? null);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }, [action]);

  useEffect(() => {
    if (runOnMount) execute();
  }, []);

  return { data, error, loading: isPending, refresh: execute } as const;
}