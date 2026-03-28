// ============================================================
//  middleware.ts — Supabase session refresh on every request
// ============================================================
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()  { return request.cookies.getAll() },
        setAll(cookiesToSet: {name: string; value: string; options?: any}[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (required — do not remove)
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect logged out users from / to /landing
  const isCallback = request.nextUrl.searchParams.has('code') || request.nextUrl.searchParams.has('access_token')
  if (request.nextUrl.pathname === '/' && !user && !request.nextUrl.searchParams.get('guest') && !isCallback) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }

  // Protect profile route
  if (request.nextUrl.pathname.startsWith('/profile') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
