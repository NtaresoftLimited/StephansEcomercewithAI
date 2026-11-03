import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const redirectUrl = new URL("/login", url.origin);
  
  if (error && error !== "Configuration") {
    redirectUrl.searchParams.set("error", error);
  }

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
