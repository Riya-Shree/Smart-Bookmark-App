import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth Callback Handler
 * Supabase redirects here after Google login.
 * Exchanges the one-time `code` for a user session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` allows redirecting to a specific page after login
  const next = searchParams.get("next") ?? "/bookmarks";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use the request origin so it works on both localhost and Vercel
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with error param
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
}
