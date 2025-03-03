import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('user_role')?.value;
  const pathname = request.nextUrl.pathname;

  const accessRules = {
    admin: ['/admin-dashboard'],
    therapist: ['/therapist-dashboard'],
    patient: ['/'],
  };

  const isAllowed = Object.entries(accessRules).some(([allowedRole, paths]) => {
    return role === allowedRole && paths.some(path => pathname.startsWith(path));
  });

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/admin-dashboard/:path*', '/therapist-dashboard/:path*'],
};
