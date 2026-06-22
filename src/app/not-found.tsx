"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Search } from "lucide-react"
import Logo from "@/components/ui/Logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-24 text-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-50/80 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-2"
        >
          <Logo size={36} />
        </motion.div>

        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-[11rem] leading-none font-black tracking-tighter bg-gradient-to-br from-[#D4AF37] via-amber-400 to-[#B8860B] bg-clip-text text-transparent select-none">
            404
          </p>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
            Page not found
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
            This hustle trail went cold. The page you&apos;re looking for doesn&apos;t exist — but there&apos;s plenty more to explore.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Link
            href="/"
            className="btn-luxury btn-luxury-primary px-8 py-4 text-sm font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/workers"
            className="btn-luxury btn-luxury-outline px-8 py-4 text-sm font-bold flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Browse Workers
          </Link>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="pt-6 border-t border-gray-100"
        >
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Or try one of these</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/login", label: "Login" },
              { href: "/signup", label: "Sign Up" },
              { href: "/who-we-are", label: "Who We Are" },
              { href: "/why-phanda-links", label: "Why Phanda Links" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold text-gray-600 hover:text-[#D4AF37] transition-colors underline underline-offset-2"
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
