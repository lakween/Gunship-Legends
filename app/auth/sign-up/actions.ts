"use server";

import { createClient } from "@/lib/supabase/server";


export async function signUpAction(formData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  const supabase = await createClient();
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/app/confirmation-success`

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: redirectUrl,
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