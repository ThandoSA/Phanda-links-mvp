"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import Image from "next/image"

export default function Signup() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("worker")
  const [location, setLocation] = useState("")

  if (!mounted) return null

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const user = data.user
    if (!user) {
        setLoading(false)
        return
    }

    // 2. Check if session exists (if not, email confirmation is likely required)
    if (!data.session) {
      toast.success("Account created! Please check your email to confirm your account.")
      setLoading(false)
      router.push("/login")
      return
    }

    // 3. Update profile (using upsert to ensure record exists)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        role: role,
        location: location,
      })

    if (profileError) {
      console.error("Profile creation error:", {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint
      })
      
      if (profileError.code === "42501") {
        toast.error("Permission denied (RLS). Your profile couldn't be initialized.")
      } else {
        toast.error(`Profile Error: ${profileError.message || "Unknown error"}`)
      }
      setLoading(false)
      return
    }

    // 4. Initialize worker_profile if role is worker
    if (role === "worker") {
      const { error: workerError } = await supabase
        .from("worker_profiles")
        .upsert({
          user_id: user.id,
          skills: [],
          bio: "",
        })
      
      if (workerError) {
        console.error("Worker profile creation error:", workerError)
      }
    }

    toast.success("Account created successfully!")
    router.push("/dashboard")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center animate-luxury-bg p-4 overflow-hidden">
      <div className="w-full max-w-2xl glass-luxury p-10 rounded-3xl space-y-8 relative overflow-hidden">
        {/* Decorative Gold Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold opacity-10 blur-3xl rounded-full"></div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logo-icon.jpeg"
              alt="Phanda Links Logo"
              width={70}
              height={70}
              style={{ width: "auto", height: "auto" }}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create <span className="text-gold">Account</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Join the community of elite service providers and clients
          </p>
        </div>

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Location
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Soweto, Johannesburg"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("worker")}
                className={`py-3 rounded-xl border transition-all ${
                  role === "worker"
                    ? "bg-gold/10 border-gold text-gold shadow-lg shadow-gold/10"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                Worker / Hustler
              </button>
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`py-3 rounded-xl border transition-all ${
                  role === "client"
                    ? "bg-gold/10 border-gold text-gold shadow-lg shadow-gold/10"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                Client
              </button>
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:opacity-90 text-black font-bold py-4 rounded-xl shadow-lg shadow-gold/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="text-center pt-4">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-gold font-semibold hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}