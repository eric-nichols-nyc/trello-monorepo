import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPrefixes = ['/workspace', '/profile'] as const;
  if (!protectedPrefixes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const sessionToken = getSessionCookie(request);
  if (!sessionToken) {
    const signIn = new URL('/sign-in', request.url);
    signIn.searchParams.set('next', pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workspace', '/workspace/:path*', '/profile', '/profile/:path*'],
};