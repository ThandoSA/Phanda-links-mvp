import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  let copyAuthCookies = (target: NextResponse) => target

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          copyAuthCookies = (target) => {
            cookiesToSet.forEach(({ name, value, options }) => target.cookies.set(name, value, options))
            return target
          }
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return copyAuthCookies(NextResponse.redirect(url))
    }

    const isClientRoute = pathname.startsWith('/dashboard/client/')
      || pathname === '/dashboard/client'
      || pathname === '/dashboard/workers'
    const isWorkerRoute = pathname.startsWith('/dashboard/worker/')
      || pathname === '/dashboard/worker'

    if (isClientRoute || isWorkerRoute) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/error'
        url.search = ''
        return copyAuthCookies(NextResponse.redirect(url))
      }

      const role = profile?.role?.toLowerCase()
      if (role !== 'client' && role !== 'worker') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        url.search = ''
        return copyAuthCookies(NextResponse.redirect(url))
      }

      if (isClientRoute && role !== 'client') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/worker'
        return copyAuthCookies(NextResponse.redirect(url))
      }

      if (isWorkerRoute && role !== 'worker') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/client'
        return copyAuthCookies(NextResponse.redirect(url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
