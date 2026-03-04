import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// app/api/sign-up/route.ts
export async function POST(request: Request) {
  try {
    const { email, password, first_name, last_name } = await request.json();
    const supabase = await createClient();
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/app/confirmation-success`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: first_name,
          last_name: last_name,
        },
      },
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }


    return NextResponse.json({
      message: data.session ? "Logged in" : "Check email",
      user: data.user
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}