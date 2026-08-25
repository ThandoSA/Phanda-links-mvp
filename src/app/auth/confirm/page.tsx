import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import Logo from "@/components/ui/Logo"

export default function ConfirmEmailPage() {
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
          We’ve sent you a confirmation link. Please click it to activate your account and start using Phanda Links.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-400 leading-6">
            Didn’t receive it? Check your spam folder or wait a few minutes before retrying.
          </p>
          
          <Link 
            href="/login"
            className="btn-luxury bg-[#D4AF37] text-black hover:bg-[#F3E5AB] hover:text-black border border-[#D4AF37] w-full py-4 text-sm flex items-center justify-center gap-2"
          >
            Back to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
