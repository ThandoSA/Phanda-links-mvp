"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { BriefcaseBusiness, UserRoundCog } from "lucide-react"
import { ensureAuthProfile } from "@/lib/authProfiles"
import type { AccountRole } from "@/lib/authRedirect"

function isAccountRole(role: unknown): role is AccountRole {
  return role === "client" || role === "worker"
}

export default function DashboardRouter() {
  const router = useRouter()
  const [roleUnknown, setRoleUnknown] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [assigningRole, setAssigningRole] = useState<AccountRole | null>(null)

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      const user = userData.user

      if (authError || !user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Could not load the account role.", error)
        setSetupError("We couldn't check your account role. Please refresh and try again.")
        return
      }

      if (data?.role) {
        if (!isAccountRole(data.role)) {
          setSetupError("Your account has an unsupported role. Please contact support.")
          return
        }
        router.replace(`/dashboard/${data.role}`)
        return
      }

      const metadataRole = user.user_metadata?.role
      if (isAccountRole(metadataRole)) {
        try {
          const { role } = await ensureAuthProfile(supabase, user, metadataRole)
          router.replace(`/dashboard/${role}`)
          return
        } catch (profileError) {
          console.error("Could not restore the account profile.", profileError)
          setSetupError(
            profileError instanceof Error
              ? profileError.message
              : "We couldn't restore your account profile. Please try again.",
          )
          return
        }
      }

      if (!data || data.role == null) {
        setRoleUnknown(true)
      }
    }

    void checkUserRole()
  }, [router])

  const handleRoleSelection = async (selectedRole: AccountRole) => {
    if (assigningRole) return
    setAssigningRole(selectedRole)
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError || !userData.user) {
        throw new Error("Your session has expired. Please sign in again.")
      }

      const { role } = await ensureAuthProfile(supabase, userData.user, selectedRole)
      toast.success("Welcome! Redirecting...")
      router.replace(`/dashboard/${role}`)
    } catch (error) {
      console.error("Could not assign the initial account role.", error)
      toast.error(error instanceof Error ? error.message : "Failed to save your role.")
    } finally {
      setAssigningRole(null)
    }
  }

  if (setupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
        <div role="alert" className="max-w-lg rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm font-medium text-red-100">
          {setupError}
        </div>
      </div>
    )
  }

  if (roleUnknown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_30%),linear-gradient(135deg,#050505_0%,#0c0c0c_35%,#050505_100%)]" />

        <div className="relative z-10 max-w-lg w-full rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/80 p-8 md:p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]">
            <UserRoundCog className="h-8 w-8" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
            Complete your <span className="text-[#D4AF37]">profile</span>
          </h1>
          <p className="mt-4 text-base text-gray-300 font-medium leading-7">
            We couldn&apos;t determine your role yet. Select how you want to use Phanda Links so we can tailor your dashboard.
          </p>

          <div className="mt-8 grid gap-4 text-left">
            <button
              disabled={assigningRole !== null}
              onClick={() => handleRoleSelection("client")}
              className="group flex items-center justify-between rounded-[1.5rem] border border-[#D4AF37]/20 bg-[#111111] px-5 py-4 text-left transition-all hover:border-[#D4AF37]/50 hover:bg-[#161616] disabled:cursor-wait disabled:opacity-50"
            >
              <div>
                <p className="text-lg font-black text-white">I’m a client</p>
                <p className="text-sm text-gray-400">{assigningRole === "client" ? "Saving your choice..." : "Hire vetted professionals for my work"}</p>
              </div>
              <BriefcaseBusiness className="h-6 w-6 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
            </button>

            <button
              disabled={assigningRole !== null}
              onClick={() => handleRoleSelection("worker")}
              className="group flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-[#111111]/80 px-5 py-4 text-left transition-all hover:border-[#D4AF37]/50 hover:bg-[#161616] disabled:cursor-wait disabled:opacity-50"
            >
              <div>
                <p className="text-lg font-black text-white">I’m a worker</p>
                <p className="text-sm text-gray-400">{assigningRole === "worker" ? "Saving your choice..." : "Find jobs and grow my profile"}</p>
              </div>
              <UserRoundCog className="h-6 w-6 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_30%),linear-gradient(135deg,#050505_0%,#0c0c0c_35%,#050505_100%)]" />
      <div className="relative z-10 w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}