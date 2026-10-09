const SAFE_ORIGIN = "https://phanda-links.invalid"

export function getSafeNextPath(candidate: string | null | undefined): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return "/dashboard"
  }

  try {
    const target = new URL(candidate, SAFE_ORIGIN)
    return target.origin === SAFE_ORIGIN
      ? `${target.pathname}${target.search}${target.hash}`
      : "/dashboard"
  } catch {
    return "/dashboard"
  }
}