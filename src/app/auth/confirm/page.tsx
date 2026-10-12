"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Mail } from "lucide-react"
import toast from "react-hot-toast"
import Logo from "@/components/ui/Logo"
import { supabase } from "@/lib/supabaseClient"
import { getAuthRedirectUrl } from "@/lib/authRedirect"
import { getAuthErrorMessage } from "@/lib/authErrors"
import { getSafeNextPath } from "@/lib/safeNextPath"

function ConfirmEmailForm() {
  const searchParams = useSearchParams()
  const nextPath = getSafeNextPath(searchParams.get("next"))
  const role = searchParams.get("role")
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResending(true)
    setResent(false)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: getAuthRedirectUrl({ next: nextPath, role }),
        },
      })

      if (error) throw error
      setResent(true)
      toast.success("A new confirmation email has been sent.")
    } catch (error) {
      const message =
        error instanceof Error && /rate limit|too many requests/i.test(error.message)
          ? "Please wait a little before requesting another confirmation email."
          : getAuthErrorMessage(error)
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_30%),linear-gradient(135deg,#050505_0%,#0d0d0d_46%,#050505_100%)]" />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/85 p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex justify-center mb-6">
          <Logo size={40} href={null} />
        </div>

        <div className="w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
          <Mail className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black tracking-tighter text-white mb-4">
          Check your <span className="text-[#D4AF37]">inbox</span>
        </h1>

        <p className="text-gray-300 text-base leading-7 font-medium mb-8">
          Check your email for a confirmation link. Once you confirm, you&apos;ll be returned to Phanda Links to finish signing in.
        </p>

        <form onSubmit={handleResend} className="space-y-4 text-left">
          <label htmlFor="resend-email" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
            Resend confirmation email
          </label>
          <input
            id="resend-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            disabled={resending}
            className="w-full rounded-full border border-[#D4AF37]/40 bg-black/40 py-3 text-sm font-bold text-white transition-colors hover:bg-[#111111] disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend confirmation email"}
          </button>
          {resent && (
            <p role="status" className="text-sm text-[#D4AF37]">
              If an unconfirmed account exists for that address, a new link is on its way.
            </p>
          )}
        </form>

        <p className="mt-6 text-sm text-gray-400 leading-6">
          Didn&apos;t receive it? Check your spam folder and wait a few minutes before retrying.
        </p>

        <Link
          href="/login"
          className="btn-luxury bg-[#D4AF37] text-black hover:bg-[#F3E5AB] hover:text-black border border-[#D4AF37] w-full py-4 mt-8 text-sm flex items-center justify-center gap-2"
        >
          Back to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050505]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" /></div>}>
      <ConfirmEmailForm />
    </Suspense>
  )
}
