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
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-gold/15 via-transparent to-transparent border-t border-white/20 mb-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                {/* Profile Section */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        <Image
                            src={profile?.avatar_url || "/images/default-avatar.svg"}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] text-white">
                        ✓
                    </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{profile?.full_name || "Premium Hustler"}</h2>
                            <p className="text-gold text-xs font-bold uppercase tracking-[0.2em]">{profile?.location || "Available for Hire"}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[160px]">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Total Earnings</p>
                            <p className="text-2xl font-bold text-white">R {earnings.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <Link href="/dashboard/worker/profile" className="flex-1 lg:flex-none bg-white/5 border border-white/10 hover:border-gold hover:text-gold text-white px-6 py-3 rounded-xl font-bold transition-all text-center">
                        Edit Profile
                    </Link>
                    <Link href="/dashboard/worker/earnings" className="flex-1 lg:flex-none bg-gold text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all text-center">
                        Withdraw
                    </Link>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 blur-[50px] rounded-full -ml-10 -mb-10" />
        </div>
    )
}
