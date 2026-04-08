"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Check your email to confirm signup")
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white text-black p-8 rounded-xl w-80">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-black text-white py-2 rounded"
        >
          Create Account
        </button>
      </div>
    </div>
  )
}