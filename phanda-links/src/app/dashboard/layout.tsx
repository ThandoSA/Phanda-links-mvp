"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"

type NavLinkProps = {
  href: string
  children: React.ReactNode
  isActive: boolean
}

const NavLink = ({ href, children, isActive }: NavLinkProps) => (
  <Link
    href={href}
    className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
      isActive
        ? "bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
        : "text-gray-400 hover:text-white hover:bg-white/10"
    }`}
  >
    {children}
  </Link>
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

      const userRole = profile?.role || userData.user.user_metadata?.role || "worker"
      setRole(userRole.toLowerCase())
      setLoading(false)
    }

    fetchRole()
  }, [router])

  const isActive = (path: string) => pathname === path

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen bg-black text-white relative overflow-hidden selection:bg-gold selection:text-black">
      
      {/* Background glow for the whole dashboard */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Mobile Header & Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full glass-luxury border-b border-white/10 p-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
              <Image src="/images/logo-icon.jpeg" alt="Phanda Links" width={24} height={24} className="rounded-md" />
              <h2 className="text-lg font-bold tracking-wide">
                  Phanda <span className="text-gold">Links</span>
              </h2>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
              <div className="w-6 h-0.5 bg-white mb-1.5" />
              <div className="w-6 h-0.5 bg-gold mb-1.5" />
              <div className="w-4 h-0.5 bg-white ml-auto" />
          </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } fixed md:static top-0 left-0 w-72 h-full glass-luxury border-r border-white/10 flex flex-col z-40 transition-transform duration-300`}>
        <div className="hidden md:flex p-8 border-b border-white/10 items-center gap-3">
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
        <div className="md:hidden h-16 border-b border-white/10" /> {/* Spacer for mobile header */}

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
            <nav className="flex flex-col gap-2">
            {role === "worker" && (
                <>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/worker" isActive={isActive("/dashboard/worker")}>Dashboard</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/worker/earnings" isActive={isActive("/dashboard/worker/earnings")}>Earnings</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/worker/jobs" isActive={isActive("/dashboard/worker/jobs")}>Find Jobs</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/worker/profile" isActive={isActive("/dashboard/worker/profile")}>My Profile</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/messages" isActive={isActive("/dashboard/messages")}>Messages</NavLink></div>
                </>
            )}

            {role === "client" && (
                <>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/client" isActive={isActive("/dashboard/client")}>Dashboard</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/client/bookings" isActive={isActive("/dashboard/client/bookings")}>My Bookings</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/client/saved" isActive={isActive("/dashboard/client/saved")}>Saved Workers</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/workers" isActive={isActive("/workers")}>Browse Workers</NavLink></div>
                <div onClick={closeMobileMenu}><NavLink href="/dashboard/messages" isActive={isActive("/dashboard/messages")}>Messages</NavLink></div>
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

      {/* Mobile overlay */}
      {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={closeMobileMenu}
          />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10 bg-black/40 backdrop-blur-3xl pt-16 md:pt-0">
        <div className="min-h-full">
            {loading ? (
                <div className="flex h-full items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                children
            )}
        </div>
      </main>

    </div>
  )
}