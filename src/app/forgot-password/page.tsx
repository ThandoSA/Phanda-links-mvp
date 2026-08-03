"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { KeyRound, ArrowRight, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setSubmitted(true)
        toast.success("Password reset email sent!")
      }
    } catch (err: any) {
      toast.error("Failed to process request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-white min-h-screen flex flex-col justify-between">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-20 md:py-32 w-full my-auto">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {submitted ? (
          <div className="glass-card p-10 bg-white border border-gray-100 rounded-3xl shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight">Check Your Inbox</h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              We sent a password reset link to <span className="font-bold text-black">{email}</span>. Click the link in your email to set a new password.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-[#D4AF37] hover:underline"
            >
              Didn&apos;t receive it? Try again
            </button>
          </div>
        ) : (
          <div className="glass-card p-8 md:p-10 bg-white border border-gray-100 rounded-3xl shadow-xl space-y-6">
            <div>
              <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-black tracking-tighter mb-2">Reset Password</h1>
              <p className="text-gray-500 text-xs font-medium">Enter your account email to receive a password recovery link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative pt-2">
                <input
                  type="email"
                  required
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 pl-8 text-black focus:outline-none focus:border-[#D4AF37] transition-colors text-sm font-medium"
                />
                <Mail className="absolute left-0 top-5 w-5 h-5 text-gray-400 peer-focus:text-[#D4AF37] transition-colors" />
                <label className="absolute left-8 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:left-0 peer-valid:-top-1.5 peer-valid:text-xs peer-valid:left-0 font-medium">
                  Email Address
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury btn-luxury-primary w-full py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Sending..." : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
