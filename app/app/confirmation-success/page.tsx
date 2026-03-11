"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmSuccessPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    // Effect 1 — tick the countdown
    useEffect(() => {
        const timer = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Effect 2 — redirect when countdown reaches 0
    useEffect(() => {
        if (countdown <= 0) router.push("/app");
    }, [countdown, router]);

    const progress = ((5 - countdown) / 5) * 100;

    return (
        <div className="my-auto h-full flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center shadow-2xl">

                {/* Icon */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-8">
                    <svg className="w-9 h-9 text-emerald-400" viewBox="0 0 36 36" fill="none">
                        <path d="M8 19L15 26L28 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Text */}
                <h1 className="text-2xl font-semibold text-white mb-3">Email Confirmed</h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Your email address has been successfully verified.
                    <br />
                    Your account is now active and ready to use.
                </p>

                {/* Countdown bar */}
                <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2">
                        Redirecting in {Math.max(0, countdown)}s…
                    </p>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={() => router.push("/app")}
                    className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    Go to Dashboard
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

            </div>
        </div>
    );
}