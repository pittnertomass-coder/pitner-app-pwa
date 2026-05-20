import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/dashboard", origin));
  res.cookies.set("dev_skip_auth", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
