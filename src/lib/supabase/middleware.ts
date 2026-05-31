import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = request.nextUrl.clone();
  const isAuthRoute = url.pathname.startsWith("/login") || url.pathname.startsWith("/registrace");
  const isAppRoute = url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/cesta") ||
    url.pathname.startsWith("/klinika") ||
    url.pathname.startsWith("/poslech") ||
    url.pathname.startsWith("/nastroje");

  // V open-access módu přeskočíme Supabase úplně — žádný auth check
  const devSkip = process.env.OPEN_ACCESS === "1" ||
    (process.env.NODE_ENV === "development" &&
    request.cookies.get("dev_skip_auth")?.value === "1");

  if (devSkip) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase nedostupná — pokračuj bez uživatele
  }

  if (!user && isAppRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
