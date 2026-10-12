const SAFE_ORIGIN = "https://phanda-links.invalid"

export function getSafeNextPath(candidate: string | null | undefined): string {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return "/dashboard"
  }

  try {
    const target = new URL(candidate, SAFE_ORIGIN)
    if (target.origin !== SAFE_ORIGIN) return "/dashboard"
    if (
      target.pathname === "/auth/callback" ||
      target.pathname === "/auth/confirm" ||
      target.pathname === "/auth/error" ||
      target.pathname === "/login" ||
      target.pathname === "/signup"
    ) {
      return "/dashboard"
    }

    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return "/dashboard"
  }
}