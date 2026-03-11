import { RealtimeContext } from "@/providers/RealtimeProvider";
import { useContext } from "react";

export function useRealtime() {
    const ctx = useContext(RealtimeContext);
    if (!ctx) throw new Error("useRealtime must be used inside <RealtimeProvider>");
    return ctx;
}