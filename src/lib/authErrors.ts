export function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "")
  const normalized = message.toLowerCase()

  if (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("user exists")
  ) {
    return "An account with this email already exists. Sign in or reset your password instead."
  }

  if (normalized.includes("email not confirmed") || normalized.includes("email_not_confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox or resend the confirmation email."
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials")
  ) {
    return "The email or password is incorrect. Please try again."
  }

  if (
    normalized.includes("expired") ||
    normalized.includes("otp_expired") ||
    normalized.includes("flow_state_not_found") ||
    normalized.includes("invalid token")
  ) {
    return "This confirmation link has expired or was already used. Request a new confirmation email and try again."
  }

  if (normalized.includes("access_denied") || normalized.includes("cancel")) {
    return "Google sign-in was cancelled. You can try again whenever you're ready."
  }

  if (normalized.includes("profile")) {
    return message
  }

  return "We couldn't complete authentication. Please try again."
}

export function getAuthQueryErrorMessage(code: string | null) {
  switch (code) {
    case "oauth_cancelled":
      return "Google sign-in was cancelled. You can try again whenever you're ready."
    case "confirmation_expired":
      return "This confirmation link has expired or was already used. Request a new confirmation email and try again."
    case "profile_setup_failed":
      return "Your account was authenticated, but we couldn't finish setting up your profile. Please sign in again or contact support."
    case "auth_callback_failed":
      return "We couldn't verify this sign-in link. It may have expired; please sign in again or request a new confirmation email."
    default:
      return null
  }
}
