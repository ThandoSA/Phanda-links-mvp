"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { Menu, X } from "lucide-react"

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
    if (href.startsWith("/#")) {
      return pathname === "/"
    }
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
    ? (role === "worker" ? workerLinks : clientLinks) 
    : publicLinks

  return (
    <>
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-300 rounded-full border ${
        scrolled
          ? "bg-white/80 border-black/5 shadow-lg shadow-black/3 py-3 backdrop-blur-md"
          : "bg-white/40 border-black/5 py-4 backdrop-blur-sm"
      }`}>
        <div className="flex justify-between items-center px-6 md:px-8">

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-black/5 group-hover:border-[#D4AF37] transition-all">
              <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover no-grayscale" />
            </div>
            <span className="font-extrabold text-base tracking-tighter text-black">
              Phanda <span className="text-[#D4AF37]">Links</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-sans font-bold uppercase tracking-wider">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative transition-colors duration-200 pb-1 group ${
                  isActive(href) ? "text-[#D4AF37]" : "text-gray-600 hover:text-black"
                }`}
              >
                {label}
                <span className={`absolute -bottom-0.5 left-0 w-full h-0.5 bg-[#D4AF37] transition-all duration-200 ${
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
                <Link href="/signup" className="btn-luxury btn-luxury-primary px-5 py-2 text-[11px] font-bold uppercase tracking-wider">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-gray-700 hover:text-black p-2"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 bg-white/95 backdrop-blur-lg z-[100] flex flex-col items-center justify-center transition-all duration-300 ${
        menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black hover:bg-[#D4AF37] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`flex flex-col gap-6 text-center transition-all duration-300 ${
          menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-xl font-black uppercase tracking-wide transition-all ${
                isActive(href) ? "text-[#D4AF37]" : "text-gray-800 hover:text-black"
              }`}
            >
              {label}
            </Link>
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
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-luxury btn-luxury-primary px-8 py-3 text-xs uppercase tracking-wider">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
