"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtime } from "./useRealtime";

interface Options<T> {
    key: string;
    fetcher: () => Promise<T | null>;
    onUpdate?: (payload: any) => Partial<T> | null;
}

export function useRealtimeQuery<T>({ key, fetcher, onUpdate }: Options<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [flash, setFlash] = useState(false);
    const { subscribe, live } = useRealtime();
    const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onUpdateRef = useRef(onUpdate);
    const fetcherRef = useRef(fetcher);
    useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
    useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

    const fetch = useCallback(async () => {
        const result = await fetcherRef.current();
        setData(result);
        setLoading(false);
    }, [key]);

    useEffect(() => { fetch(); }, [key]);

    useEffect(() => {
        return subscribe(key, async (payload: any) => {
            if (onUpdateRef.current) {
                const patch = onUpdateRef.current(payload);
                if (patch) setData(prev => prev ? { ...prev, ...patch } : null);
            } else {
                await fetcherRef.current().then(result => {
                    if (result) setData(result);
                });
            }

            if (flashTimer.current) clearTimeout(flashTimer.current);
            setFlash(true);
            flashTimer.current = setTimeout(() => setFlash(false), 800);
        });
    }, [subscribe, key]);

    useEffect(() => {
        return () => { if (flashTimer.current) clearTimeout(flashTimer.current); };
    }, []);

    return { data, loading, live, flash, refresh: fetch };
}