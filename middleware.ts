import { auth } from "@/auth";

export default function middleware(request: any) {
  if (request.nextUrl.pathname.startsWith('/studio')) {
    return;
  }
  return auth(request as any);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
