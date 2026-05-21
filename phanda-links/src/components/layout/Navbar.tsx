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
            <div className="relative w-9 h-9 overflow-hidden rounded-sm border border-white/10 group-hover:border-[#C5A059] transition-all duration-75">
              <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover transition-transform duration-75" />
            </div>
            <span className="font-extrabold text-lg tracking-tighter text-white">
              Phanda <span className="text-[#C5A059]">Links</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono font-bold uppercase tracking-[0.25em]">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative transition-all duration-75 pb-1 group ${isActive(href) ? "text-[#C5A059]" : "text-gray-400 hover:text-white"}`}
              >
                {label}
                <span className={`absolute -bottom-0.5 left-0 w-full h-0.5 bg-[#C5A059] transition-all duration-75 ${isActive(href) ? "opacity-100" : "opacity-0 scale-x-0 group-hover:scale-x-100 group-hover:opacity-100"}`} />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-[11px] font-mono font-bold uppercase tracking-widest text-white hover:text-[#C5A059] transition-colors mr-2">
                  Login
                </Link>
                <Link href="/signup" className="btn-luxury btn-luxury-primary px-6 py-2.5 font-extrabold text-[11px] uppercase tracking-widest">
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
            <span className="w-6 h-0.5 bg-[#C5A059] block" />
            <span className="w-4 h-0.5 bg-white block ml-auto" />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center transition-all duration-75 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-8 right-8 w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#C5A059] hover:text-black transition-all text-sm font-bold"
        >
          ✕
        </button>

        <div className={`flex flex-col gap-8 text-center transition-all duration-75 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-2xl font-black uppercase tracking-widest transition-all ${isActive(href) ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}
            >
              {label}
            </Link>
          ))}
          <div className="h-px w-12 bg-[#C5A059]/30 mx-auto my-2" />
          {user ? (
            <button onClick={() => { setMenuOpen(false); handleLogout() }} className="text-lg font-bold text-red-500 hover:text-red-400">
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-gray-400 hover:text-white uppercase tracking-wider font-mono">Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-luxury btn-luxury-primary px-10 py-4 font-black text-sm uppercase tracking-widest">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
