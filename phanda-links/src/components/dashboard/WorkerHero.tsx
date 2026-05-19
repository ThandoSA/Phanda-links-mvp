"use client"

import Image from "next/image"
import Link from "next/link"
import { Profile } from "@/types"

interface WorkerHeroProps {
  profile: Profile | null
  earnings: number
}

export default function WorkerHero({ profile, earnings }: WorkerHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 mb-8 animate-fade-in"
      style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.4) 60%, rgba(212,175,55,0.04) 100%)" }}
    >
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/5 blur-[60px] rounded-full -ml-10 -mb-10 pointer-events-none" />

      <div className="relative z-10 p-7 md:p-10">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
              <Image
                src={profile?.avatar_url || "/images/default-avatar.svg"}
                alt="Profile"
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-lg">
              <span className="text-[9px] text-white font-black">✓</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                  {profile?.full_name || "Premium Hustler"}
                </h2>
                <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">
                  {profile?.location || "Available for Hire"}
                </p>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 flex-wrap justify-center lg:justify-end">
                <div className="glass-panel px-5 py-3 rounded-2xl text-center min-w-[110px]">
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Earned</p>
                  <p className="text-xl font-black text-white">R {earnings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 w-full lg:w-auto flex-shrink-0">
            <Link
              href="/dashboard/worker/profile"
              className="flex-1 lg:flex-none bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] text-white px-5 py-3 rounded-xl font-bold transition-all text-center text-sm"
            >
              Edit Profile
            </Link>
            <Link
              href="/dashboard/worker/earnings"
              className="btn-luxury flex-1 lg:flex-none bg-[#D4AF37] text-black px-5 py-3 rounded-xl font-black text-center text-sm shadow-[0_8px_20px_rgba(212,175,55,0.2)]"
            >
              Earnings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
