import { NextRequest, NextResponse } from "next/server";
export { default } from 'next-auth/middleware';
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest)
{
    const token = await getToken({ req: request });
    const url = request.nextUrl;
    if (token)
    {
        if (url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname === '/' ||
            url.pathname.startsWith('/verify')
        )
        {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }
    if (!token &&
        (url.pathname.startsWith('/dashboard')))
    {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }
}

export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*',
    ],
}
