import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only: the proxy runs before every protected navigation, so
// it must not query the database. The API routes still verify the JWT before
// returning or changing data.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/log-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/editEvent/:path*",
    "/events/create",
    "/joinedEvents",
    "/manageEvents",
  ],
};
