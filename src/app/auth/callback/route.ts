import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/features/auth";
import { createClient } from "@/shared/api/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto =
        request.headers.get("x-forwarded-proto") ?? "https";
      const origin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : requestUrl.origin;

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=oauth_callback", requestUrl.origin),
  );
}
