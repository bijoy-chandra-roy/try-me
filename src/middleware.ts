import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { canAccessDashboardPath } from '@/shared/auth/permissions';
import { getDashboardPath, isUserRole } from '@/shared/auth/roles';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.role || !isUserRole(String(token.role))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (!canAccessDashboardPath(role, pathname)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
