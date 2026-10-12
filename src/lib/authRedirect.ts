import { getSafeNextPath } from "@/lib/safeNextPath"

export type AccountRole = "client" | "worker"

function isAccountRole(role: string | null | undefined): role is AccountRole {
  return role === "client" || role === "worker"
}

function getSiteOrigin(fallbackOrigin?: string) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const browserOrigin = typeof window !== "undefined" ? window.location.origin : undefined
  const siteUrl = configuredSiteUrl || browserOrigin || fallbackOrigin || "http://localhost:3000"
  const parsedUrl = new URL(siteUrl)

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.")
  }

  return parsedUrl.origin
}

export function getAuthRedirectUrl(
  options: { next?: string | null; role?: string | null } = {},
  fallbackOrigin?: string,
) {
  const redirectUrl = new URL("/auth/callback", getSiteOrigin(fallbackOrigin))
  redirectUrl.searchParams.set("next", getSafeNextPath(options.next))

  if (isAccountRole(options.role)) {
    redirectUrl.searchParams.set("role", options.role)
  }

  return redirectUrl.toString()
}

export function getAuthSiteOrigin(fallbackOrigin?: string) {
  return getSiteOrigin(fallbackOrigin)
}
