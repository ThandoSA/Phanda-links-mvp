"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Scroll listener
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    
    // Auth listener
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
        window.removeEventListener("scroll", handleScroll)
        subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
      await supabase.auth.signOut()
      toast.success("Successfully logged out")
      window.location.href = "/"
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-5"
        }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8">

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-white/10 group-hover:border-gold/50 transition-all duration-500">
                <Image
                    src="/images/logo-icon.jpeg"
                    alt="Phanda Links"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
            </div>
            <span className="font-bold text-lg tracking-tighter text-white">
              Phanda <span className="text-gold">Links</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            <Link href="/workers" className="hover:text-gold transition-all hover:scale-105">Find Workers</Link>
            <Link href="/dashboard" className="hover:text-gold transition-all hover:scale-105">Dashboard</Link>
            <Link href="/dashboard/messages" className="hover:text-gold transition-all hover:scale-105">Messages</Link>
            <Link href="/about" className="hover:text-gold transition-all hover:scale-105">About</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
                <button 
                    onClick={handleLogout}
                    className="text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors mr-4"
                >
                    Logout
                </button>
            ) : (
                <>
                    <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-white hover:text-gold transition-colors mr-4">
                        Login
                    </Link>
                    <Link href="/signup" className="bg-gold text-black px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
                        Get Started
                    </Link>
                </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(true)} className="md:hidden text-2xl text-white p-2">
            <span className="sr-only">Open menu</span>
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-gold mb-1.5" />
            <div className="w-4 h-0.5 bg-white ml-auto" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] animate-fade-in flex flex-col items-center justify-center">
            <button 
                onClick={() => setMenuOpen(false)} 
                className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-gold hover:text-black transition-all"
            >
                ✕
            </button>

            <div className="flex flex-col gap-8 text-center">
                <Link href="/workers" onClick={() => setMenuOpen(false)} className="text-3xl font-black text-white hover:text-gold transition-all">Find Workers</Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-3xl font-black text-white hover:text-gold transition-all">Dashboard</Link>
                <Link href="/dashboard/messages" onClick={() => setMenuOpen(false)} className="text-3xl font-black text-white hover:text-gold transition-all">Messages</Link>
                <Link href="/about" onClick={() => setMenuOpen(false)} className="text-3xl font-black text-white hover:text-gold transition-all">About</Link>
                
                <div className="h-px w-20 bg-gold/30 mx-auto my-4" />

                {user ? (
                    <button 
                        onClick={() => { setMenuOpen(false); handleLogout(); }} 
                        className="text-xl font-bold text-red-400 hover:text-red-300"
                    >
                        Logout
                    </button>
                ) : (
                    <>
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="text-xl font-bold text-gray-400 hover:text-white">Login</Link>
                        <Link href="/signup" onClick={() => setMenuOpen(false)} className="bg-gold text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </div>
      )}
    </>
  )
}
