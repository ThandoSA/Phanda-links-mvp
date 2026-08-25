"use client"

import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AlertTriangle, ArrowLeft, RefreshCw, Mail } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_30%),linear-gradient(135deg,#050505_0%,#0d0d0d_46%,#050505_100%)]" />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-20 md:py-32 text-center my-auto w-full">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
          Authentication <span className="text-[#D4AF37]">notice</span>
        </h1>

        <p className="text-gray-300 text-base md:text-lg font-medium leading-7 mb-8">
          The confirmation link may have expired, or your session needs to be refreshed. Please try logging in again or request a new confirmation email.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/login"
            className="btn-luxury bg-[#D4AF37] text-black hover:bg-[#F3E5AB] hover:text-black border border-[#D4AF37] py-4 px-8 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Go to Login
          </Link>
          <Link
            href="/contact"
            className="btn-luxury border border-[#D4AF37]/30 bg-black/30 text-white hover:bg-[#111111] py-4 px-8 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </Link>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#D4AF37] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
        </Link>
      </div>
    </main>
  )
}
