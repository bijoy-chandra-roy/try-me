import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccessDashboardPath } from '@/shared/auth/permissions';
import { getDashboardPath, isUserRole } from '@/shared/auth/roles';
import { getMiddlewareAuthToken } from '@/shared/lib/middleware-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getMiddlewareAuthToken(request);

  if (!token?.role || !isUserRole(String(token.role))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token.status === 'inactive') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'AccountInactive');
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  if (pathname === '/settings/store' || pathname === '/dashboard/settings/store') {
    return NextResponse.redirect(new URL('/dashboard/merchant#store', request.url));
  }

  if (pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')) {
    const suffix = pathname.slice('/dashboard/settings'.length);
    return NextResponse.redirect(new URL(`/settings${suffix || '/profile'}`, request.url));
  }

  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/dashboard') && !canAccessDashboardPath(role, pathname)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/settings',
    '/settings/:path*',
    '/cart',
    '/checkout',
    '/orders/:path*',
  ],
};
