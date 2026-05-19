"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

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

  const isActive = (href: string) => pathname === href

  // 🔹 Dynamic Navigation Links
  const publicLinks = [
    { href: "/#home", label: "Home" },
    { href: "/who-we-are", label: "Who We Are" },
    { href: "/what-we-do", label: "What We Do" },
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
    ? (role === "worker" ? workerLinks : clientLinks) 
    : publicLinks

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-5"
        }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8">

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-white/10 group-hover:border-[#D4AF37]/50 transition-all duration-500">
              <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <span className="font-bold text-lg tracking-tighter text-white">
              Phanda <span className="text-[#D4AF37]">Links</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative transition-all duration-300 pb-1 group ${isActive(href) ? "text-[#D4AF37]" : "text-gray-400 hover:text-white"}`}
              >
                {label}
                <span className={`absolute -bottom-0.5 left-0 w-full h-0.5 rounded-full bg-[#D4AF37] transition-all duration-300 ${isActive(href) ? "opacity-100" : "opacity-0 scale-x-0 group-hover:scale-x-100 group-hover:opacity-30"}`} />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-white hover:text-[#D4AF37] transition-colors mr-2">
                  Login
                </Link>
                <Link href="/signup" className="btn-luxury bg-[#D4AF37] text-black px-7 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_8px_20px_rgba(212,175,55,0.25)]">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-white p-2 flex flex-col gap-1.5"
            aria-label="Open menu"
          >
            <span className="w-6 h-0.5 bg-white block" />
            <span className="w-6 h-0.5 bg-[#D4AF37] block" />
            <span className="w-4 h-0.5 bg-white block ml-auto" />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/97 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-black transition-all text-lg font-bold"
        >
          ✕
        </button>

        <div className={`flex flex-col gap-8 text-center transition-all duration-500 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-3xl font-black transition-all ${isActive(href) ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"}`}
            >
              {label}
            </Link>
          ))}
          <div className="h-px w-20 bg-[#D4AF37]/30 mx-auto my-2" />
          {user ? (
            <button onClick={() => { setMenuOpen(false); handleLogout() }} className="text-xl font-bold text-red-400 hover:text-red-300">
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-xl font-bold text-gray-400 hover:text-white">Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="bg-[#D4AF37] text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
