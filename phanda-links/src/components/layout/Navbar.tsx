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
    { href: "/#why-we-created", label: "Why Phanda Links" },
  ]

  const workerLinks = [
    { href: "/dashboard/worker", label: "Dashboard" },
    { href: "/workers", label: "Find Workers" },
    { href: "/dashboard/worker/jobs", label: "Browse Jobs" },
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/dashboard/worker/profile", label: "Profile" },
  ]

  const clientLinks = [
    { href: "/dashboard/client", label: "Dashboard" },
    { href: "/workers", label: "Find Workers" },
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
        <div className="flex justify-between items-center px-6 md:px-8">
          <Logo size={32} />

          <div className="hidden md:flex items-center gap-8 text-[11px] font-sans font-bold uppercase tracking-wider">
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

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-700 hover:text-black transition-colors mr-2">
                  Login
                </Link>
                <Link href="/signup" className="btn-luxury btn-luxury-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-gray-700 hover:text-black p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full glass flex items-center justify-center text-black hover:border-gold transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="flex flex-col gap-6 text-center"
            >
              {navLinks.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`text-xl font-black uppercase tracking-wide transition-all ${
                      isActive(href) ? "text-gold" : "text-gray-800 hover:text-black"
                    }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              <div className="h-px w-12 bg-gray-200 mx-auto my-2" />
              {user ? (
                <button onClick={() => { setMenuOpen(false); handleLogout() }} className="text-lg font-bold text-red-500 hover:text-red-600 cursor-pointer">
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-gray-700 hover:text-black uppercase tracking-wider">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-luxury btn-luxury-primary px-8 py-3.5 text-xs uppercase tracking-wider">
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
