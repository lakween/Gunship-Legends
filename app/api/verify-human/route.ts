import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.updateUser({
            data: { is_human_verified: true }
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        const response = NextResponse.json(
            { message: "Verification successful" },
            { status: 200 }
        );

        response.cookies.set("is_human_verified", "true", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return response;
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}