// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuthenticated = !!token;
    const isLoginPage = req.nextUrl.pathname === "/login";

    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && !isLoginPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // If user is authenticated and trying to access login page
    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // For all other cases, continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => {
        // Let the main middleware function handle all the authorization logic
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// More specific matcher - exclude NextAuth internal routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /login (login page)
     * - /api/auth (NextAuth API routes)
     * - /api (other API routes)
     * - /_next (Next.js internals)
     * - /images, /fonts, etc. (public assets)
     * - . files (dotfiles)
     */
    '/((?!login/|api/|_next/|images/|fonts/|favicon.ico).*)',
  ],
};