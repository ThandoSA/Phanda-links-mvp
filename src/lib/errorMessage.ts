function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error.trim()) return error

  if (isRecord(error)) {
    for (const key of ["message", "details", "hint"] as const) {
      if (typeof error[key] === "string" && error[key].trim()) {
        return error[key]
      }
    }
  }

  return fallback
}
