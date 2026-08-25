"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { BriefcaseBusiness, UserRoundCog } from "lucide-react"

export default function DashboardRouter() {
  const router = useRouter()
  const [roleUnknown, setRoleUnknown] = useState(false)

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      let profile = data

      if (error || !profile) {
        console.log("Profile not found, checking metadata...")
        const metadata = user.user_metadata
        if (metadata?.role) {
          // Auto-create profile from metadata
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              full_name: metadata.full_name || "",
              role: metadata.role,
            })
            .select()
            .single()
          
          if (!createError) {
            profile = newProfile
          }
        }
      }

      if (!profile || !profile.role) {
        setRoleUnknown(true)
        return
      }

      const role = profile.role.toLowerCase()
      if (role === "client") {
        router.replace("/dashboard/client")
      } else if (role === "worker") {
        router.replace("/dashboard/worker")
      } else {
        // If role exists but is invalid, force them to re-select
        setRoleUnknown(true)
      }
    }

    checkUserRole()
  }, [router])

  const handleRoleSelection = async (selectedRole: string) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userData.user.id,
        full_name: userData.user.user_metadata?.full_name || "",
        role: selectedRole,
      })

    if (error) {
      toast.error("Failed to save role: " + error.message)
    } else {
      if (selectedRole === "worker") {
        await supabase.from("worker_profiles").upsert({
          user_id: userData.user.id,
          skills: [],
          bio: "",
        })
      }
      toast.success("Welcome! Redirecting...")
      router.replace(selectedRole === "client" ? "/dashboard/client" : "/dashboard/worker")
    }
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
              onClick={() => handleRoleSelection("client")}
              className="group flex items-center justify-between rounded-[1.5rem] border border-[#D4AF37]/20 bg-[#111111] px-5 py-4 text-left transition-all hover:border-[#D4AF37]/50 hover:bg-[#161616]"
            >
              <div>
                <p className="text-lg font-black text-white">I’m a client</p>
                <p className="text-sm text-gray-400">Hire vetted professionals for my work</p>
              </div>
              <BriefcaseBusiness className="h-6 w-6 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => handleRoleSelection("worker")}
              className="group flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-[#111111]/80 px-5 py-4 text-left transition-all hover:border-[#D4AF37]/50 hover:bg-[#161616]"
            >
              <div>
                <p className="text-lg font-black text-white">I’m a worker</p>
                <p className="text-sm text-gray-400">Find jobs and grow my profile</p>
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