import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "@/shared/config/env";
import {
  isMissingRefreshTokenError,
  isSupabaseAuthCookie,
} from "./auth-cookie";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnvironment();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.getClaims();

  if (isMissingRefreshTokenError(error)) {
    const staleCookies = request.cookies
      .getAll()
      .filter(({ name }) => isSupabaseAuthCookie(name));

    staleCookies.forEach(({ name }) => request.cookies.delete(name));
    response = NextResponse.next({ request });
    staleCookies.forEach(({ name }) =>
      response.cookies.set(name, "", { maxAge: 0, path: "/" }),
    );
  }

  return response;
}
