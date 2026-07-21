import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/** Read the Auth.js JWT in middleware — must match secure cookie names on HTTPS. */
export async function getMiddlewareAuthToken(request: NextRequest) {
  return getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: request.nextUrl.protocol === 'https:',
  });
}
