"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    const getUserRole = async () => {
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) return

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.user.id)
        .single()

      if (data?.role === "worker") {
        router.push("/dashboard/worker")
      } else {
        router.push("/dashboard/client")
      }
    }

    getUserRole()
  }, [])

  return <p>Loading dashboard...</p>
}