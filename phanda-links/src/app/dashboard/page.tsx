"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

export default function DashboardRouter() {
  const router = useRouter()

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (error || !profile) {
        console.error("Error fetching profile:", error)
        toast.error("Profile not found or missing role.")
        // Fallback route to avoid infinite login loop
        router.replace("/dashboard/worker")
        return
      }

      const role = profile?.role?.toLowerCase()

      if (role === "client") {
        router.replace("/dashboard/client")
      } else {
        // If worker, null, undefined, or generic, default them to worker safely.
        if (!role || role !== "worker") {
          toast.success("Role defaulted to Worker. Please update your profile.")
        }
        router.replace("/dashboard/worker")
      }
    }

    checkUserRole()
  }, [router])

  return (
    <div className="flex items-center justify-center p-6 h-full">
      <p>Loading your dashboard...</p>
    </div>
  )
}