"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function Signup() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("worker")
  const [location, setLocation] = useState("")

  if (!mounted) return null

  const handleSignup = async () => {
    // 1. Create user and pass metadata for trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    const user = data.user

    if (!user) return

    // 2. Update profile (created by trigger)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role: role,
        location: location,
      })
      .eq("id", user.id)

    if (profileError) {
      toast.error(profileError.message)
      return
    }

    toast.success("Signup successful!")

    // 3. Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white text-black p-8 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location (e.g. Soweto)"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="worker">Worker</option>
          <option value="client">Client</option>
        </select>

        <button
          onClick={handleSignup}
          className="w-full bg-black text-white py-2 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}