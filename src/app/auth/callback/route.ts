import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getSafeNextPath } from '@/lib/safeNextPath'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && authData.user) {
      // Determine the user's role to redirect correctly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (profileError) {
        return NextResponse.redirect(new URL('/auth/error', origin))
      }
      
      const role = profile?.role?.toLowerCase()
      
      if (role === 'client') {
        return NextResponse.redirect(new URL('/dashboard/client', origin))
      } else if (role === 'worker') {
        const { error: workerProfileError } = await supabase
          .from('worker_profiles')
          .upsert({ user_id: authData.user.id, skills: [], bio: '' }, { onConflict: 'user_id' })

        if (workerProfileError) {
          return NextResponse.redirect(new URL('/auth/error', origin))
        }

        return NextResponse.redirect(new URL('/dashboard/worker', origin))
      }
      
      // Fallback if role is unknown or not set
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/error', origin))
}
