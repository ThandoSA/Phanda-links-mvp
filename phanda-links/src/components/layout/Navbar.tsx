"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { Menu, X } from "lucide-react"
import Logo from "@/components/ui/Logo"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const pathname = usePathname()

  // All hooks must be called unconditionally before any early returns
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        setRole(prof?.role?.toLowerCase() || null)
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) fetchUser()
      else setRole(null)
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  // Never render the marketing navbar inside dashboard routes (after all hooks)
  if (pathname.startsWith("/dashboard")) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Successfully logged out")
    window.location.href = "/"
  }

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/"
    return pathname === href
  }

  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/who-we-are", label: "Who We Are" },
    { href: "/why-phanda-links", label: "Why Phanda Links" },
  ]

  const workerLinks = [
    { href: "/dashboard/worker", label: "Dashboard" },
    { href: "/dashboard/workers", label: "Find Workers" },
    { href: "/dashboard/worker/jobs", label: "Browse Jobs" },
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/dashboard/worker/profile", label: "Profile" },
  ]

  const clientLinks = [
    { href: "/dashboard/client", label: "Dashboard" },
    { href: "/dashboard/workers", label: "Find Workers" },
    { href: "/dashboard/client/post-job", label: "Post Job" },
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/dashboard/client/profile", label: "Profile" },
  ]

  const navLinks = user
    ? (role === "worker"
      ? workerLinks
      : role === "client"
        ? clientLinks
        : publicLinks)
    : publicLinks

  return (
    <>
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-500 rounded-full ${
        scrolled ? "glass-nav py-3 shadow-lg" : "glass-nav py-4"
      }`}>
        <div className="flex justify-between items-center px-5 md:px-8">
          <Logo size={28} />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[10px] lg:text-[11px] font-sans font-bold uppercase tracking-wider">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative transition-colors duration-200 pb-1 group ${
                  isActive(href) ? "text-gold" : "text-gray-600 hover:text-black"
                }`}
              >
                {label}
                <span className={`absolute -bottom-0.5 left-0 w-full h-0.5 bg-gold transition-all duration-200 ${
                  isActive(href) ? "opacity-100" : "opacity-0 scale-x-0 group-hover:scale-x-100 group-hover:opacity-100"
                }`} />
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={role === "worker" ? "/dashboard/worker" : "/dashboard/client"}
                  className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-700 hover:text-black transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-sans font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-700 hover:text-black transition-colors mr-1">
                  Login
                </Link>
                <Link href="/signup" className="btn-luxury btn-luxury-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-gray-700 hover:text-black p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Full-screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col overflow-y-auto"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <Logo size={28} />
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ delay: 0.05 }}
              className="flex flex-col px-6 pt-6 pb-4 gap-1"
            >
              {navLinks.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.04 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center py-4 text-lg font-black uppercase tracking-wide border-b border-gray-100 transition-colors ${
                      isActive(href) ? "text-gold" : "text-gray-800 hover:text-black"
                    }`}
                  >
                    {label}
                    {isActive(href) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile Auth Buttons */}
            <div className="mt-auto px-6 pb-10 pt-6 flex flex-col gap-3 border-t border-gray-100">
              {user ? (
                <>
                  <Link
                    href={role === "worker" ? "/dashboard/worker" : "/dashboard/client"}
                    onClick={() => setMenuOpen(false)}
                    className="btn-luxury btn-luxury-primary w-full py-4 text-sm"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    className="btn-luxury w-full py-4 text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-luxury btn-luxury-primary w-full py-4 text-sm">
                    Get Started — It&apos;s Free
                  </Link>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-luxury btn-luxury-outline w-full py-4 text-sm">
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
