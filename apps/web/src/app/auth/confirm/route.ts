import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app";

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  let response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const { url, publishableKey } = getSupabaseConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.redirect(new URL(next, requestUrl.origin));

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const failureUrl = new URL("/login", requestUrl.origin);
    failureUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(failureUrl);
  }

  return response;
}
