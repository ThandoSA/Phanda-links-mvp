import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { AccountRole } from "@/lib/authRedirect"

function isAccountRole(role: unknown): role is AccountRole {
  return role === "client" || role === "worker"
}

function metadataString(metadata: User["user_metadata"], ...keys: string[]) {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return undefined
}

export async function ensureAuthProfile(
  supabase: SupabaseClient,
  user: User,
  roleHint?: string | null,
) {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id, full_name, role, location, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  if (readError) {
    console.error("Could not read the authenticated user's profile.", readError)
    throw new Error("Your account is signed in, but we couldn't check your profile. Please try again.")
  }

  const metadata = user.user_metadata
  const role = isAccountRole(existing?.role)
    ? existing.role
    : isAccountRole(roleHint)
      ? roleHint
      : isAccountRole(metadata.role)
        ? metadata.role
        : undefined
  const fullName =
    existing?.full_name ||
    metadataString(metadata, "full_name", "name") ||
    user.email?.split("@")[0] ||
    ""
  const location = existing?.location || metadataString(metadata, "location") || ""
  const avatarUrl =
    existing?.avatar_url || metadataString(metadata, "avatar_url", "picture")

  const profile: Record<string, string | null> = {
    id: user.id,
    full_name: fullName,
    location,
  }

  if (role) profile.role = role
  if (avatarUrl) profile.avatar_url = avatarUrl

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id", defaultToNull: false })

  if (profileError) {
    const minimalProfile: Record<string, string> = { id: user.id }
    if (role) minimalProfile.role = role

    const { error: retryError } = await supabase
      .from("profiles")
      .upsert(minimalProfile, { onConflict: "id", defaultToNull: false })

    if (retryError) {
      console.error("Could not create the authenticated user's profile.", {
        profileError,
        retryError,
      })
      throw new Error(
        "Your account is signed in, but we couldn't save your profile. Please try again or contact support.",
      )
    }
  }

  if (role === "worker") {
    const { error: workerProfileError } = await supabase
      .from("worker_profiles")
      .upsert(
        { user_id: user.id, skills: [], bio: "" },
        { onConflict: "user_id", ignoreDuplicates: true },
      )

    if (workerProfileError) {
      console.error("Could not create the authenticated worker's profile.", workerProfileError)
      throw new Error(
        "Your account is signed in, but we couldn't finish setting up your worker profile. Please try again or contact support.",
      )
    }
  }

  return { role }
}
