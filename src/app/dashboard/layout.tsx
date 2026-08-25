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
import { CHAT_UNREAD_CHANGED_EVENT, countUnreadMessages } from "@/lib/chatUnread"

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
  showUnreadDot?: boolean
}

const NavItem = ({ href, icon, children, isActive, onClick, showUnreadDot = false }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`relative flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300 font-bold text-xs uppercase tracking-wider group border ${
      isActive
        ? "bg-[#111111] text-white font-extrabold shadow-[0_12px_30px_rgba(0,0,0,0.35)] border-[#D4AF37]/25"
        : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent"
    }`}
  >
    <span className={`relative transition-colors duration-200 ${isActive ? "text-[#D4AF37]" : "text-gray-400 group-hover:text-[#D4AF37]"}`}>
      {icon}
      {showUnreadDot && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.9)]" aria-label="Unread messages" />
      )}
    </span>
    {children}
  </Link>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
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

        const userRole = (prof?.role || userData.user.user_metadata?.role || "worker").toLowerCase()
        setRole(userRole)
        setProfile(prof || null)
        setUserId(userData.user.id)

        const isClientRoute = pathname.startsWith("/dashboard/client/") || pathname === "/dashboard/client"
        const isWorkerRoute = pathname.startsWith("/dashboard/worker/") || pathname === "/dashboard/worker"

        if (isClientRoute && userRole !== "client") {
          router.replace("/dashboard/worker")
        } else if (isWorkerRoute && userRole !== "worker") {
          router.replace("/dashboard/client")
        }
      } catch (err) {
        console.error("Auth fetch error:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchRole()
    return () => { isMounted = false }
  }, [router, pathname])

  useEffect(() => {
    if (!userId) return

    let isMounted = true

    const refreshUnreadCount = async () => {
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id")
        .or(`client_id.eq.${userId},worker_id.eq.${userId}`)

      if (!isMounted) return

      const jobIds = jobsData?.map((job) => job.id) || []

      if (jobIds.length === 0) {
        setUnreadCount(0)
        return
      }

      const { data: messagesData } = await supabase
        .from("messages")
        .select("job_id, sender_id, created_at")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false })

      if (!isMounted) return
      setUnreadCount(countUnreadMessages(messagesData || [], userId))
    }

    refreshUnreadCount()

    const channel = supabase.channel(`dashboard-unread-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, refreshUnreadCount)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, refreshUnreadCount)
      .subscribe()

    const handleReadStateChange = () => refreshUnreadCount()
    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, handleReadStateChange)

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
      window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, handleReadStateChange)
    }
  }, [userId])

  const isActive = (path: string) => {
    if (path === "/dashboard/client" || path === "/dashboard/worker") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen bg-[#050505] text-white relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.12),_transparent_28%),linear-gradient(135deg,#050505_0%,#090909_28%,#050505_100%)]" />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-4 flex justify-between items-center z-50">
        <Logo size={28} />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-200 p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } fixed md:static top-0 left-0 w-72 h-full flex flex-col z-40 transition-transform duration-300 ease-out border-r border-white/10 bg-[#0b0b0b]/85 backdrop-blur-xl`}
      >
        <div className="hidden md:flex p-6 border-b border-white/10">
          <Logo size={32} />
        </div>
        <div className="md:hidden h-[72px] border-b border-white/10" />

        {/* User Mini Profile */}
        {!loading && profile && (
          <div className="px-5 py-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/20 flex-shrink-0">
                <Image
                  src={profile.avatar_url || "/images/default-avatar.svg"}
                  alt="You"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold uppercase truncate">{profile.full_name || "User"}</p>
                <p className="text-[9px] text-[#D4AF37] uppercase tracking-widest font-black">{role}</p>
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
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/worker/jobs" icon={Icons.jobs} isActive={isActive("/dashboard/worker/jobs")}>Browse Jobs</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/worker/active-jobs" icon={Icons.bookings} isActive={isActive("/dashboard/worker/active-jobs")}>My Active Jobs</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/messages" icon={Icons.messages} isActive={isActive("/dashboard/messages")} showUnreadDot={unreadCount > 0}>Messages</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/worker/profile" icon={Icons.profile} isActive={isActive("/dashboard/worker/profile")}>Profile</NavItem></div>
              </>
            ) : (
              <>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/client" icon={Icons.dashboard} isActive={isActive("/dashboard/client")}>Dashboard</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/client/saved" icon={Icons.saved} isActive={isActive("/dashboard/client/saved")}>Saved</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/workers" icon={Icons.browse} isActive={isActive("/dashboard/workers")}>Browse Workers</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/client/post-job" icon={Icons.jobs} isActive={isActive("/dashboard/client/post-job")}>Post Job</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/messages" icon={Icons.messages} isActive={isActive("/dashboard/messages")} showUnreadDot={unreadCount > 0}>Messages</NavItem></div>
                <div onClick={closeMobileMenu}><NavItem href="/dashboard/client/profile" icon={Icons.profile} isActive={isActive("/dashboard/client/profile")}>Profile</NavItem></div>
              </>
            )}
          </nav>
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-full text-[10px] uppercase tracking-wider font-extrabold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 group cursor-pointer border border-red-500/10"
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
        <div className="min-h-full flex flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.08),_transparent_25%)]">
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