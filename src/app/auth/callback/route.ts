import { NextResponse } from "next/server"
import { ensureAuthProfile } from "@/lib/authProfiles"
import { getAuthSiteOrigin } from "@/lib/authRedirect"
import { getSafeNextPath } from "@/lib/safeNextPath"
import { createClient } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const origin = getAuthSiteOrigin(requestUrl.origin)
  const next = getSafeNextPath(searchParams.get("next"))
  const roleHint = searchParams.get("role")
  const callbackError = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")?.toLowerCase() || ""

  const redirectToLogin = (error: string) => {
    const loginUrl = new URL("/login", origin)
    loginUrl.searchParams.set("error", error)
    if (next !== "/dashboard") loginUrl.searchParams.set("next", next)
    return NextResponse.redirect(loginUrl)
  }

  if (callbackError) {
    const authError = `${callbackError} ${errorDescription}`
    if (/access_denied|cancel/.test(authError)) return redirectToLogin("oauth_cancelled")
    if (/expired|otp_expired|invalid.*token/.test(authError)) {
      return redirectToLogin("confirmation_expired")
    }
    return redirectToLogin("auth_callback_failed")
  }

  const supabase = await createClient()
  let user = null
  let authError: { message: string } | null = null
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const otpType = searchParams.get("type")

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    user = data.user
    authError = error
  } else if (tokenHash && (otpType === "signup" || otpType === "email" || otpType === "recovery")) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    })
    user = data.user
    authError = error
  } else {
    const { data, error } = await supabase.auth.getUser()
    user = data.user
    authError = error
  }

  if (authError) {
    const { data, error } = await supabase.auth.getUser()
    if (!error && data.user) {
      user = data.user
      authError = null
    }
  }

  if (authError || !user) {
    const message = authError?.message.toLowerCase() || ""
    return redirectToLogin(
      /expired|otp_expired|invalid.*token|flow_state_not_found/.test(message)
        ? "confirmation_expired"
        : "auth_callback_failed",
    )
  }

  try {
    let destination = next
    if (next !== "/reset-password") {
      try {
        const { role } = await ensureAuthProfile(supabase, user, roleHint)
        if (next === "/dashboard") destination = `/dashboard/${role}`
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("missing a client or worker role")
        ) {
          destination = "/dashboard"
        } else {
          throw error
        }
      }
    }

    return NextResponse.redirect(new URL(destination, origin))
  } catch (error) {
    console.error("Authentication callback profile setup failed.", error)
    return redirectToLogin("profile_setup_failed")
  }
}
