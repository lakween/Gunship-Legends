"use server";

import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function confirmEmailAction({
    code,
    token_hash,
    type,
    next,
}: {
    code?: string | null;
    token_hash?: string | null;
    type?: string | null;
    next?: string | null;
}) {
    const supabase = await createClient();
    const redirectTo = next ? decodeURIComponent(next) : "/app/confirmation-success";

    // PKCE flow
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return { success: false, error: error.message };
        return { success: true, redirectTo };
    }

    // OTP / magic link flow
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type: type as EmailOtpType,
            token_hash,
        });
        if (error) return { success: false, error: error.message };
        return { success: true, redirectTo };
    }

    return { success: false, error: "Invalid confirmation link" };
}