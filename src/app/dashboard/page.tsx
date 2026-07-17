"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

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

      let { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

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
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full glass-card p-10 text-center space-y-6">
          <h1 className="text-2xl font-black text-black tracking-tighter">Complete Your <span className="text-gold">Profile</span></h1>
          <p className="text-gray-500 font-medium text-sm">We couldn&apos;t determine your role. Please select how you want to use Phanda Links:</p>
          
          <div className="grid grid-cols-1 gap-4 pt-4">
            <button 
              onClick={() => handleRoleSelection("client")}
              className="btn-luxury btn-luxury-primary py-4 text-sm w-full"
            >
              I am a Client (Hiring)
            </button>
            <button 
              onClick={() => handleRoleSelection("worker")}
              className="btn-luxury btn-luxury-outline py-4 text-sm w-full bg-white"
            >
              I am a Worker (Hustling)
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}