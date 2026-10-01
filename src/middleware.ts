import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

function addSecurityHeaders(response: NextResponse, contentSecurityPolicy: string): void {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("X-XSS-Protection", "0");
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  addSecurityHeaders(response, contentSecurityPolicy);

  const pathname = request.nextUrl.pathname;
  const isPublic =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/auth" ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpe?g|gif|webp|ico|woff2?)$/u.test(pathname);

  if (!isPublic) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      if (pathname.startsWith("/api/")) {
        const unauthorized = NextResponse.json({ error: "No autorizado" }, { status: 401 });
        addSecurityHeaders(unauthorized, contentSecurityPolicy);
        return unauthorized;
      }
      const loginUrl = new URL("/login", request.url);
      const redirect = NextResponse.redirect(loginUrl);
      addSecurityHeaders(redirect, contentSecurityPolicy);
      return redirect;
    }
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
