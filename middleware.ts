import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const userType = request.cookies.get('userType')?.value;

    // Only protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session || userType !== 'Farmer') {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*']
} 