import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Protect the admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // If no user is logged in, kick them out
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/getAccessToAdminScreen'
      return NextResponse.redirect(url)
    }

 // 3. If logged in, check if their role is 'admin'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    // If they aren't an admin, kick them out
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/getAccessToAdminScreen'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}