"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

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
      setLoading(false)
    }

    fetchRole()
  }, [router])

  const isActive = (path: string) => pathname === path

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href} 
      className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
        isActive(href) 
          ? "bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
          : "text-gray-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  )

  return (
    <div className="flex h-screen bg-black text-white relative overflow-hidden selection:bg-gold selection:text-black">
      
      {/* Background glow for the whole dashboard */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* SIDEBAR */}
      <aside className="w-72 glass-luxury border-r border-white/10 flex flex-col relative z-10">
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
            <Image
                src="/images/logo-icon.jpeg"
                alt="Phanda Links"
                width={32}
                height={32}
                style={{ width: "auto", height: "auto" }}
                className="rounded-md"
            />
            <h2 className="text-2xl font-bold tracking-wide">
                Phanda <span className="text-gold">Links</span>
            </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
            <nav className="flex flex-col gap-2">
            {role === "worker" && (
                <>
                <NavLink href="/dashboard/worker">Dashboard</NavLink>
                <NavLink href="/dashboard/worker/earnings">Earnings</NavLink>
                <NavLink href="/dashboard/worker/jobs">Find Jobs</NavLink>
                <NavLink href="/dashboard/worker/profile">My Profile</NavLink>
                </>
            )}

            {role === "client" && (
                <>
                <NavLink href="/dashboard/client">Dashboard</NavLink>
                <NavLink href="/dashboard/client/bookings">My Bookings</NavLink>
                <NavLink href="/dashboard/client/saved">Saved Workers</NavLink>
                <NavLink href="/workers">Browse Workers</NavLink>
                </>
            )}

            {loading && (
                <div className="animate-pulse flex flex-col gap-4 px-4 py-2">
                    <div className="h-10 bg-white/5 rounded-xl w-full"></div>
                    <div className="h-10 bg-white/5 rounded-xl w-full"></div>
                    <div className="h-10 bg-white/5 rounded-xl w-3/4"></div>
                </div>
            )}
            </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="p-6 border-t border-white/10">
            <button
                onClick={async () => {
                    await supabase.auth.signOut()
                    router.push("/login")
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
            >
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10 bg-black/40 backdrop-blur-3xl">
        <div className="min-h-full">
            {children}
        </div>
      </main>

    </div>
  )
}