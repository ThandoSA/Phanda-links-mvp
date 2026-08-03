"use client"

import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AlertTriangle, ArrowLeft, RefreshCw, Mail } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="bg-white min-h-screen flex flex-col justify-between">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-20 md:py-32 text-center my-auto w-full">
        <div className="w-20 h-20 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 shadow-sm">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-4">
          Authentication <span className="text-[#D4AF37]">Notice</span>
        </h1>

        <p className="text-gray-600 text-sm md:text-base font-medium leading-relaxed mb-8">
          The authentication link may have expired, or your session needs to be refreshed. Please try logging in again or requesting a new confirmation link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/login"
            className="btn-luxury btn-luxury-primary py-4 px-8 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Go to Login
          </Link>
          <Link
            href="/contact"
            className="btn-luxury py-4 px-8 text-xs font-bold uppercase tracking-wider border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </Link>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
        </Link>
      </div>

      <Footer />
    </main>
  )
}
