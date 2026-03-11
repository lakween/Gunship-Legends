// app/auth/confirm/page.tsx
"use client";
import { Suspense } from "react";

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmClient />
    </Suspense>
  );
}


// app/auth/confirm/ConfirmClient.tsx
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmEmailAction } from "./actions";

export function ConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next");

    // Read directly from URL — no prop chain, nothing can be lost ✅
    confirmEmailAction({ code, token_hash, type, next }).then(result => {
      if (result.success) {
        router.replace(result.redirectTo!);
      } else {
        setErrorMsg(result.error ?? "Confirmation failed");
        setStatus("error");
      }
    });
  }, []);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 font-mono">
        <p className="text-red-400 text-sm">❌ {errorMsg}</p>
        <a href="/auth/sign-up" className="text-blue-400 underline text-sm">
          Back to sign up
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 font-mono">
      <div className="w-10 h-10 rounded-full border-2 border-blue-400/20 border-t-blue-400 animate-spin" />
      <p className="text-white/60 text-sm tracking-widest uppercase">
        Confirming your identity...
      </p>
      <p className="text-white/20 text-xs">Please wait</p>
    </div>
  );
}