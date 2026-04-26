import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const email = process.env.CRON_SUPABASE_EMAIL;
  const password = process.env.CRON_SUPABASE_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!email || !password || !supabaseUrl || !supabaseKey) {
    return Response.json(
      { success: false, error: "Missing cron or Supabase environment variables" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return Response.json({
    success: true,
    user_id: data.user?.id ?? null,
    email: data.user?.email ?? null,
    refreshed: Boolean(data.session),
  });
}
