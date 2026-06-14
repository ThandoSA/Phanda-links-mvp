"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { AnimatePresence } from "framer-motion"
import PageTransition from "@/components/ui/PageTransition"
import Skeleton from "@/components/ui/Skeleton"
import Logo from "@/components/ui/Logo"
import { Menu, X, LogOut } from "lucide-react"
import OnboardingWizard from "@/components/dashboard/OnboardingWizard"

// SVG icon components
const Icons = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  earnings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  jobs: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  profile: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  messages: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  bookings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  browse: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  saved: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  signout: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
}

type NavItemProps = {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  isActive: boolean
  onClick?: () => void
}

const NavItem = ({ href, icon, children, isActive, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`relative flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300 font-bold text-xs uppercase tracking-wider group ${
      isActive
        ? "bg-black text-white font-extrabold shadow-md"
        : "text-gray-500 hover:text-black hover:bg-black/5"
    }`}
  >
    <span className={`transition-colors duration-200 ${isActive ? "text-gold" : "text-gray-400 group-hover:text-gray-700"}`}>
      {icon}
    </span>
    {children}
  </Link>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let isMounted = true
    const fetchRole = async () => {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser()
        if (!isMounted) return

        if (authError || !userData.user) {
          router.push("/login")
          return
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("role, full_name, avatar_url")
          .eq("id", userData.user.id)
          .single()

        if (!isMounted) return

        const userRole = prof?.role || userData.user.user_metadata?.role || "worker"
        setRole(userRole.toLowerCase())
        setProfile(prof || null)
        setUserId(userData.user.id)
      } catch (err) {
        console.error("Auth fetch error:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchRole()
    return () => { isMounted = false }
  }, [router])

  const isActive = (path: string) => pathname === path
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen bg-surface text-black relative overflow-hidden selection:bg-gold selection:text-black">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full glass-nav border-b border-black/5 p-4 flex justify-between items-center z-50">
        <Logo size={28} />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } fixed md:static top-0 left-0 w-72 h-full flex flex-col z-40 transition-transform duration-300 ease-out border-r border-black/5 glass`}
      >
        <div className="hidden md:flex p-6 border-b border-black/5">
          <Logo size={32} />
        </div>
        <div className="md:hidden h-[72px] border-b border-black/5" />

        {/* User Mini Profile */}
        {!loading && profile && (
          <div className="px-5 py-5 border-b border-black/5 bg-black/[0.01]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-black/5 flex-shrink-0">
                <Image
                  src={profile.avatar_url || "/images/default-avatar.svg"}
                  alt="You"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-black text-xs font-bold uppercase truncate">{profile.full_name || "User"}</p>
                <p className="text-[9px] text-gold uppercase tracking-widest font-black">{role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <nav className="flex flex-col gap-1.5">
            {loading ? (
              <div className="animate-pulse flex flex-col gap-3 px-2 py-2">
                {[1,2,3,4,5].map(i => <div key={i} className="h-11 bg-black/5 rounded-xl w-full" />)}
              </div>
            ) : role === "worker" ? (
              <>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/worker" icon={Icons.dashboard} isActive={isActive("/dashboard/worker")}>Dashboard</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/workers" icon={Icons.browse} isActive={isActive("/workers")}>Find Workers</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/worker/jobs" icon={Icons.jobs} isActive={isActive("/dashboard/worker/jobs")}>Browse Jobs</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/messages" icon={Icons.messages} isActive={isActive("/dashboard/messages")}>Messages</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/worker/profile" icon={Icons.profile} isActive={isActive("/dashboard/worker/profile")}>Profile</NavItem></div>
              </>
            ) : (
              <>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/client" icon={Icons.dashboard} isActive={isActive("/dashboard/client")}>Dashboard</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/workers" icon={Icons.browse} isActive={isActive("/workers")}>Find Workers</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/client/post-job" icon={Icons.jobs} isActive={isActive("/dashboard/client/post-job")}>Post Job</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/messages" icon={Icons.messages} isActive={isActive("/dashboard/messages")}>Messages</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/client/profile" icon={Icons.profile} isActive={isActive("/dashboard/client/profile")}>Profile</NavItem></div>
              </>
            )}
          </nav>
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-black/5 bg-black/[0.01]">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-full text-[10px] uppercase tracking-wider font-extrabold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay dimmer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden" onClick={closeMobileMenu} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 pt-[72px] md:pt-0">
        <div className="min-h-full flex flex-col justify-between">
          <div className="p-4 md:p-8">
            <AnimatePresence mode="wait">
              <PageTransition key={pathname}>
                {loading ? (
                  <div className="max-w-7xl mx-auto space-y-8">
                    <Skeleton height="12rem" className="rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => <Skeleton key={i} height="8rem" className="rounded-2xl" />)}
                    </div>
                    <div className="grid gap-6">
                      {[1, 2].map(i => <Skeleton key={i} height="15rem" className="rounded-2xl" />)}
                    </div>
                  </div>
                ) : children}
              </PageTransition>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Onboarding Wizard Modal */}
      {!loading && role && userId && (
        <OnboardingWizard role={role} userId={userId} />
      )}
    </div>
  )
}