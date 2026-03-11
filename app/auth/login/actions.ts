"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                first_name: formData.first_name,
                last_name: formData.last_name,
            },
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function loginAction(formData: {
    email: string;
    password: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}