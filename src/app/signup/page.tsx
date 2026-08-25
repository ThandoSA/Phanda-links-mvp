"use client"

import { Suspense, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import Image from "next/image"
import { Hammer, Briefcase, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Logo from "@/components/ui/Logo"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || "/dashboard"
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("worker")
  const [location, setLocation] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
        }
      })
      if (error) {
        toast.error(error.message)
      }
    } catch (err) {
      console.error("Google signup error:", err)
      toast.error("An error occurred during Google sign-up.")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } }
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    const user = data.user
    if (!user) { setLoading(false); return }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id, full_name: fullName, role, location,
    })

    if (profileError) {
      toast.error(profileError.message || "Profile error")
      setLoading(false)
      return
    }

    if (role === "worker") {
      await supabase.from("worker_profiles").upsert({ user_id: user.id, skills: [], bio: "" })
    }

    if (!data.session) {
      toast.success("Account created! Check your email to confirm.")
      setLoading(false)
      router.push("/auth/confirm")
      return
    }
    // If Supabase returned a session, post tokens to server to set cookies
    if (data.session) {
      try {
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        })
      } catch (err) {
        console.error('Failed to set server session cookie:', err)
      }
    }

    toast.success("Account created successfully!")
    router.push(nextPath || `/dashboard/${role}`)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_32%),linear-gradient(135deg,#050505_0%,#0d0d0d_45%,#050505_100%)]" />

      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/Jozi.png.jpg" 
            alt="Johannesburg Skyline" 
            fill 
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/10" />
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-8 mt-auto mb-12">
          <Logo size={48} href={null} className="mb-2" />
          <div>
            <p className="text-white/90 text-lg font-medium leading-relaxed mt-6">
              Join a community built for South African hustle culture. Whether you&apos;re finding work or hiring talent, your story starts here.
            </p>
          </div>

          <div className="flex flex-col gap-5 border-t border-white/10 pt-8">
            {["Create your professional profile", "Connect with real opportunities", "Build trust through visibility"].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-white/85">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-lg absolute top-8 left-8 md:left-auto md:max-w-none">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="w-full max-w-lg space-y-8 mt-12 md:mt-0">
          <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/85 p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="space-y-2 mb-10 text-center sm:text-left">
              <h2 className="text-4xl font-black tracking-tighter text-white">
                Create <span className="text-[#D4AF37]">Account</span>
              </h2>
              <p className="text-gray-400 text-sm font-medium">Join South Africa&apos;s opportunity marketplace</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-3 mb-8">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">I want to...</label>
                <div className="flex gap-4 p-1.5 bg-white/5 rounded-full border border-white/10 shadow-inner">
                  {[
                    { val: "worker", label: "Find Work", icon: <Hammer className="w-4 h-4" /> },
                    { val: "client", label: "Hire Talent", icon: <Briefcase className="w-4 h-4" /> },
                  ].map(({ val, label, icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRole(val)}
                      className={`flex-1 py-3 px-4 rounded-full transition-all text-sm font-bold flex items-center justify-center gap-2 ${
                        role === val
                          ? "bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-[#D4AF37]"
                          : "bg-transparent text-gray-400 hover:text-white border border-transparent"
                      }`}
                    >
                      <span className={role === val ? "text-black" : "text-gray-400"}>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative pt-2">
                  <input type="text" id="fullName" required placeholder=" " className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  <label htmlFor="fullName" className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium">Full Name</label>
                </div>
                <div className="relative pt-2">
                  <input type="email" id="email" required placeholder=" " className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <label htmlFor="email" className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium">Email Address</label>
                </div>
                <div className="relative pt-2">
                  <input type={showPassword ? "text" : "password"} id="password" required placeholder=" " className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <label htmlFor="password" className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-5 text-gray-400 hover:text-[#D4AF37] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative pt-2">
                  <input type="text" id="location" required placeholder=" " className="peer w-full bg-transparent border-b-2 border-white/10 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <label htmlFor="location" className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium">Location</label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury bg-[#D4AF37] text-black hover:bg-[#F3E5AB] hover:text-black border border-[#D4AF37] w-full py-4 text-sm mt-8 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creating Account...</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4 text-black" /></>
                )}
              </button>
            </form>

            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs font-bold uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="btn-luxury border border-[#D4AF37]/40 bg-black/40 text-white hover:bg-[#111111] w-full py-4 text-sm flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <p className="text-center text-gray-400 text-sm font-medium mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-[#D4AF37] font-bold hover:text-[#F3E5AB] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  )
}