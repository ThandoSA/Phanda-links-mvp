"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

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
    <div className="flex min-h-screen bg-white text-black overflow-hidden relative">
      {/* Left — Brand Storytelling Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/download (2).jpg" 
            alt="Phanda Links Hustle Story" 
            fill 
            sizes="50vw"
            className="object-cover img-premium"
          />
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-8 mt-auto mb-12">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-lg border border-white">
            <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4 text-black">
              Phanda <span className="text-[#D4AF37]">Links</span>
            </h1>
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              The premium marketplace connecting elite professionals with discerning clients. Elevate your hustle.
            </p>
          </div>
          
          <div className="flex flex-col gap-5 border-t border-gray-200 pt-8">
            {["Verified elite professionals", "Real-time job matching", "Secure payments & chat"].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 bg-[#F9FAFB]">
        <div className="w-full max-w-md absolute top-8 left-8 md:left-auto md:max-w-none">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="glass-card p-8 md:p-12">
            <div className="space-y-2 mb-10 text-center sm:text-left">
              <h2 className="text-4xl font-black tracking-tighter text-black">
                Welcome <span className="text-[#D4AF37]">Back</span>
              </h2>
              <p className="text-gray-500 text-sm font-medium">Sign in to your premium account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 text-black focus:outline-none focus:border-[#D4AF37] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label 
                  htmlFor="email"
                  className="absolute left-0 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-3.5 peer-valid:text-xs font-medium"
                >
                  Email Address
                </label>
              </div>

              <div className="relative pt-2">
                <input
                  type="password"
                  id="password"
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 text-black focus:outline-none focus:border-[#D4AF37] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label 
                  htmlFor="password"
                  className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
                >
                  Password
                </label>
                <Link href="#" className="absolute right-0 top-5 text-xs text-gray-400 hover:text-black font-bold transition-colors">
                  Forgot?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury btn-luxury-primary w-full py-4 text-sm mt-8 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                ) : "Sign In"}
              </button>
            </form>

            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-luxury btn-luxury-outline w-full py-4 text-sm flex items-center justify-center gap-3 bg-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <p className="text-center text-gray-500 text-sm font-medium mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-black font-bold hover:text-[#D4AF37] transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}