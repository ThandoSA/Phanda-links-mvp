"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/layout/Footer"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) {
        toast.error(error.message)
      }
    } catch (err) {
      console.error("Google login error:", err)
      toast.error("An error occurred during Google sign-in.")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("Login error details:", error)
        
        // Handle specific Supabase error for unconfirmed email
        if (error.message.toLowerCase().includes("email not confirmed")) {
          toast.error("Please confirm your email address before logging in. Check your inbox!")
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      if (data?.user) {
        const { data: prof, error: profError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
        
        if (profError) {
          console.error("Profile fetch error:", profError)
        }

        toast.success("Welcome back!")
        const role = prof?.role?.toLowerCase() || "worker"
        router.push(`/dashboard/${role}`)
      }
    } catch (err) {
      console.error("Unexpected login error:", err)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="flex min-h-screen bg-black text-white overflow-hidden">
        {/* Left — Brand Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/8 blur-[160px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

          <div className="relative z-10 text-center space-y-8">
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#D4AF37]/20 shadow-[0_0_60px_rgba(212,175,55,0.15)]">
                <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter mb-4">
                Phanda <span className="text-[#D4AF37]">Links</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-sm mx-auto">
                The premium marketplace connecting elite professionals with discerning clients.
              </p>
            </div>
            <div className="flex flex-col gap-4 text-left max-w-xs mx-auto">
              {["Verified elite professionals", "Real-time job matching", "Secure payments & chat"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="w-full max-w-md relative z-10 space-y-8">
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center">
              <Image src="/images/logo-icon.jpeg" alt="Phanda Links" width={56} height={56} style={{ width: "auto", height: "auto" }} className="rounded-2xl shadow-lg" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white">
                Welcome <span className="text-[#D4AF37]">Back</span>
              </h2>
              <p className="text-gray-500 text-sm">Sign in to your premium account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="input-luxury"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
                    Password
                  </label>
                  <Link href="#" className="text-[10px] text-gray-500 hover:text-[#D4AF37] transition-colors font-bold uppercase tracking-wider">
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-luxury"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury w-full bg-[#D4AF37] text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Signing in...</>
                ) : "Sign In"}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-black uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-transparent border border-white/10 hover:border-gold/30 hover:bg-white/3 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Sign In with Google
            </button>

            <p className="text-center text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#D4AF37] font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}