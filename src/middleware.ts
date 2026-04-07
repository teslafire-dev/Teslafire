import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If trying to access admin and not logged in
  if (req.nextUrl.pathname.startsWith("/admin") && !session && !req.nextUrl.pathname.includes("/admin/login")) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // If logged in and trying to access login
  if (req.nextUrl.pathname.includes("/admin/login") && session) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
