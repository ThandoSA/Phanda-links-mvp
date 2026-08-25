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
    <main className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_30%),linear-gradient(135deg,#050505_0%,#0d0d0d_46%,#050505_100%)]" />
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="max-w-md mx-auto px-6 py-20 md:py-32 w-full my-auto">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-[#D4AF37] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>

          {submitted ? (
            <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/85 p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] space-y-6 backdrop-blur-xl">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Check your inbox</h2>
              <p className="text-gray-300 text-base font-medium leading-7">
                We sent a password reset link to <span className="font-bold text-[#D4AF37]">{email}</span>. Click the link in your email to set a new password.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm font-bold text-[#D4AF37] hover:text-[#F3E5AB] transition-colors"
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/85 p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.55)] space-y-6 backdrop-blur-xl">
              <div>
                <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center mb-4 border border-[#D4AF37]/20">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Reset Password</h1>
                <p className="text-gray-300 text-sm font-medium leading-6">Enter your account email and we’ll send you a secure reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative pt-2">
                  <input
                    type="email"
                    required
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 text-base text-white placeholder:text-transparent focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                  <Mail className="absolute left-0 top-5 w-5 h-5 text-gray-400 peer-focus:text-[#D4AF37] transition-colors" />
                  <label className="absolute left-8 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:left-0 peer-valid:-top-1.5 peer-valid:text-xs peer-valid:left-0 font-medium">
                    Email Address
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-luxury bg-[#D4AF37] text-black hover:bg-[#F3E5AB] hover:text-black border border-[#D4AF37] w-full py-4 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
