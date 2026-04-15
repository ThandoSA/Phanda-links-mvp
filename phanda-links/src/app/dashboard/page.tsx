"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const checkUser = async () => {
      // 1. Get logged-in user
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        router.push("/login")
        return
      }

      const user = userData.user

      // 2. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        console.error(profileError)
        setErrorMsg("Failed to load your profile. Please try logging in again.")
        return
      }

      // 3. Redirect based on role
      if (profile.role === "worker") {
        router.push("/dashboard/worker")
      } else if (profile.role === "client") {
        router.push("/dashboard/client")
      }
    }

    checkUser()
  }, [router])

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-red-500">{errorMsg}</p>
        <button 
          onClick={() => router.push("/login")}
          className="bg-black text-white px-4 py-2 rounded border"
        >
          Return to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Loading dashboard...</p>
    </div>
  )
}