"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRole = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      setRole(profile?.role?.toLowerCase() || "worker")
    }

    fetchRole()
  }, [router])

  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8">Phanda Links</h2>

        <nav className="flex flex-col gap-4 flex-1">
          {role === "worker" && (
            <>
              <Link href="/dashboard/worker" className="opacity-80 hover:opacity-100">Worker Dashboard</Link>
              <Link href="/dashboard/worker/earnings" className="opacity-80 hover:opacity-100">Earnings</Link>
              <Link href="/dashboard/worker/jobs" className="opacity-80 hover:opacity-100">Find Jobs</Link>
              <Link href="/dashboard/worker/profile" className="opacity-80 hover:opacity-100">My Profile</Link>
            </>
          )}

          {role === "client" && (
            <>
              <Link href="/dashboard/client" className="opacity-80 hover:opacity-100">Client Dashboard</Link>
              <Link href="/dashboard/client/bookings" className="opacity-80 hover:opacity-100">My Bookings</Link>
              <Link href="/dashboard/client/saved" className="opacity-80 hover:opacity-100">Saved Workers</Link>
              <Link href="/workers" className="opacity-80 hover:opacity-100">Browse Workers</Link>
            </>
          )}

          {!role && (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          )}
        </nav>

        {/* LOGOUT BUTTON */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className="mt-auto text-left text-red-400 hover:text-red-300 opacity-80 hover:opacity-100 transition"
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}