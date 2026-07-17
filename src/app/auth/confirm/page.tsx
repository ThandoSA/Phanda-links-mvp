import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import Logo from "@/components/ui/Logo"

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md glass-card p-10 text-center">
        <div className="flex justify-center mb-6">
          <Logo size={40} href={null} />
        </div>
        
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-gold" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-black mb-4">
          Check Your <span className="text-gold">Inbox</span>
        </h1>
        
        <p className="text-gray-500 font-medium mb-8">
          We've sent you an email with a confirmation link. Please click the link to activate your account and start using Phanda Links.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Didn't receive it? Check your spam folder or wait a few minutes.
          </p>
          
          <Link 
            href="/login"
            className="btn-luxury btn-luxury-primary w-full py-4 text-sm flex items-center justify-center gap-2"
          >
            Back to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
