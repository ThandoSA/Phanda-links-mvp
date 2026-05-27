"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import Image from "next/image"
import { Hammer, Briefcase, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react"
import Footer from "@/components/layout/Footer"

export default function Signup() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("worker")
  const [location, setLocation] = useState("")

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const handleGoogleSignup = async () => {
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

    // Create the profile immediately, even if session is not yet active (email confirmation pending)
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

    // Now handle the session/confirmation state
    if (!data.session) {
      toast.success("Account created! Check your email to confirm.")
      setLoading(false)
      router.push("/login")
      return
    }

    toast.success("Account created successfully!")
    router.push(`/dashboard/${role}`)
    setLoading(false)
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="min-h-screen flex bg-black text-white overflow-hidden">
        {/* Left — Brand Panel */}
        <div className="hidden lg:flex lg:w-2/5 relative flex-col items-center justify-center p-16 overflow-hidden border-r border-white/10">
          <div className="absolute inset-0 bg-[#0B0B0C]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="relative z-10 text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-[2px] overflow-hidden border border-gold/30">
                <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover no-grayscale" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">
                Join <span className="text-gold">Phanda Links</span>
              </h1>
              <p className="text-gray-400 text-sm font-medium tracking-wide leading-relaxed max-w-xs mx-auto uppercase">
                Connect with premium clients and elite service providers across South Africa.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-sm border border-white/10 text-left space-y-3 max-w-xs mx-auto">
              <p className="text-[10px] text-gold uppercase font-black tracking-widest">Why join?</p>
              {["Access top-tier jobs instantly", "Build your verified reputation", "Get paid securely & on time"].map((item, i) => (
                <p key={i} className="text-xs font-semibold text-gray-300 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" /> {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
          <div className="absolute inset-0 bg-[#000000]" />
          <div className="w-full max-w-lg relative z-10 space-y-8">
            <div className="flex lg:hidden justify-center">
              <Image src="/images/logo-icon.jpeg" alt="Phanda Links" width={56} height={56} style={{ width: "auto", height: "auto" }} className="rounded-[2px] border border-white/10 no-grayscale" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight uppercase">
                Create <span className="text-gold">Account</span>
              </h2>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Join the community of elite professionals</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Full Name</label>
                  <input type="text" required placeholder="John Doe" className="input-luxury" onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Email Address</label>
                  <input type="email" required placeholder="john@example.com" className="input-luxury" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Password</label>
                  <input type="password" required placeholder="••••••••" className="input-luxury" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Location</label>
                  <input type="text" required placeholder="e.g. Soweto, Johannesburg" className="input-luxury" onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>

              {/* Role Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">I am a...</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-white/3 border border-white/8 rounded-[4px]">
                  {[
                    { val: "worker", label: "Worker / Hustler", icon: <Hammer className="w-4 h-4" /> },
                    { val: "client", label: "Client", icon: <Briefcase className="w-4 h-4" /> },
                  ].map(({ val, label, icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRole(val)}
                      className={`py-3 px-4 rounded-[2px] border transition-all text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 ${
                        role === val
                          ? "bg-gold/12 border-gold text-gold"
                          : "bg-transparent border-white/8 text-gray-500 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury btn-luxury-primary w-full py-4 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><div className="w-4 h-4 border border-black border-t-transparent rounded-[1px] animate-spin" /> Creating Account...</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-black uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="btn-luxury w-full bg-transparent border border-white/10 hover:border-gold/30 hover:bg-white/3 text-white font-black py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Sign Up with Google
            </button>

            <p className="text-center text-gray-500 text-xs uppercase tracking-wider">
              Already have an account?{" "}
              <Link href="/login" className="text-gold font-extrabold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}