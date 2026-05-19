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
        <div className="hidden lg:flex lg:w-2/5 relative flex-col items-center justify-center p-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#D4AF37]/8 blur-[150px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="relative z-10 text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#D4AF37]/20 shadow-[0_0_60px_rgba(212,175,55,0.15)]">
                <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-4">
                Join <span className="text-[#D4AF37]">Phanda Links</span>
              </h1>
              <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
                Connect with premium clients and elite service providers across South Africa.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl text-left space-y-3 max-w-xs mx-auto">
              <p className="text-[10px] text-[#D4AF37] uppercase font-black tracking-widest">Why join?</p>
              {["Access top-tier jobs instantly", "Build your verified reputation", "Get paid securely & on time"].map((item, i) => (
                <p key={i} className="text-sm text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="w-full max-w-lg relative z-10 space-y-8">
            <div className="flex lg:hidden justify-center">
              <Image src="/images/logo-icon.jpeg" alt="Phanda Links" width={56} height={56} style={{ width: "auto", height: "auto" }} className="rounded-2xl shadow-lg" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">
                Create <span className="text-[#D4AF37]">Account</span>
              </h2>
              <p className="text-gray-500 text-sm">Join the community of elite professionals</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Full Name</label>
                  <input type="text" required placeholder="John Doe" className="input-luxury" onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Email Address</label>
                  <input type="email" required placeholder="john@example.com" className="input-luxury" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Password</label>
                  <input type="password" required placeholder="••••••••" className="input-luxury" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Location</label>
                  <input type="text" required placeholder="e.g. Soweto, Johannesburg" className="input-luxury" onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>

              {/* Role Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">I am a...</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-white/3 border border-white/8 rounded-2xl">
                  {[
                    { val: "worker", label: "Worker / Hustler", icon: <Hammer className="w-4 h-4" /> },
                    { val: "client", label: "Client", icon: <Briefcase className="w-4 h-4" /> },
                  ].map(({ val, label, icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRole(val)}
                      className={`py-3.5 px-4 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${
                        role === val
                          ? "bg-[#D4AF37]/12 border-[#D4AF37]/50 text-[#D4AF37] scale-[1.02] shadow-[0_4px_15px_rgba(212,175,55,0.1)]"
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
                className="btn-luxury w-full bg-[#D4AF37] text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creating Account...</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#D4AF37] font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}