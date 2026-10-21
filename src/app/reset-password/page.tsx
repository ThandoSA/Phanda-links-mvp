"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"
import Logo from "@/components/ui/Logo"
import { ArrowLeft, KeyRound } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!active) return

      if (error || !data.user) {
        setHasRecoverySession(false)
      } else {
        setHasRecoverySession(true)
      }
      setCheckingSession(false)
    }

    void checkSession()
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password.length < 8) {
      toast.error("Your password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("The passwords do not match.")
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      toast.success("Your password has been updated.")
      router.replace("/dashboard")
    } catch (error) {
      console.error("Password reset failed.", error)
      toast.error(error instanceof Error ? error.message : "Could not update your password.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_30%),linear-gradient(135deg,#050505_0%,#0d0d0d_46%,#050505_100%)]" />
      <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/85 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-10">
        <div className="mb-6 flex justify-center"><Logo size={40} href={null} /></div>
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]">
          <KeyRound className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Set a new password</h1>
        {checkingSession ? (
          <p className="mt-4 text-sm text-gray-400">Checking your recovery link...</p>
        ) : !hasRecoverySession ? (
          <div className="mt-5 space-y-4">
            <p role="alert" className="text-sm leading-6 text-red-200">This password reset link is invalid or has expired. Request a new one to continue.</p>
            <Link href="/forgot-password" className="inline-flex min-h-11 items-center gap-2 font-bold text-[#D4AF37] hover:text-[#F3E5AB]">
              <ArrowLeft className="h-4 w-4" /> Request another link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-bold text-gray-300">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              />
            </label>
            <label className="block space-y-2 text-sm font-bold text-gray-300">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full border border-[#D4AF37] bg-[#D4AF37] py-3 font-black text-black transition-colors hover:bg-[#F3E5AB] disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
