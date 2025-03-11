// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

// Custom middleware function
export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req });
  const isAuthenticated = !!token?.idToken;
  const isLoginPage = req.nextUrl.pathname === "/login";

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is authenticated and trying to access login page
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // For all other cases, just continue to the page
  return NextResponse.next();
}

// Add withAuth as a separate export if you need its functionality
export const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protect all routes except /login and public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /login
     * - /api/auth (NextAuth.js API routes)
     * - /_next (Next.js internals)
     * - /images, /fonts, etc. (public assets)
     */
    "/((?!login|api/auth|_next|images|fonts).*)"
  ],
};