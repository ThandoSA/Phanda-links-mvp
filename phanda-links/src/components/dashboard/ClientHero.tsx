"use client"

import Image from "next/image"
import Link from "next/link"
import { Job } from "@/types"

interface ClientHeroProps {
    job: Job | null
}

export default function ClientHero({ job }: ClientHeroProps) {
    if (!job) {
        return (
            <div className="glass-panel p-6 rounded-md relative overflow-hidden border-t border-white/20 mb-6" style={{ background: 'var(--surface)' }}>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">No upcoming bookings</h2>
                    <p className="text-gray-400 mb-6 max-w-md">Find elite professionals for your home or business needs today.</p>
                    <Link href="/workers" className="inline-block bg-gold text-black px-6 py-3 rounded-sm font-bold hard-offset-hover">
                        Browse Workers
                    </Link>
                </div>
            </div>
        )
    }

    const statusSteps = ['pending', 'accepted', 'en_route', 'in_progress', 'completed']
    const currentStepIndex = statusSteps.indexOf(job.status)

    return (
        <div className="glass-panel p-6 rounded-md relative overflow-hidden border-t border-white/20 mb-6 animate-fade-in" style={{ background: 'var(--surface)' }}>
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start relative z-10">
                {/* Left: Worker Info */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                    <div className="relative w-24 h-24 rounded-sm overflow-hidden border-2 border-gold/50">
                        <Image
                            src={job.worker?.avatar_url || "/images/default-avatar.svg"}
                            alt={job.worker?.full_name || "Worker"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <h3 className="text-xl font-bold text-white">{job.worker?.full_name || "Premium Worker"}</h3>
                            {job.worker?.is_verified && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider border border-emerald-500/30">Verified</span>
                            )}
                        </div>
                        <p className="text-gold text-xs font-semibold uppercase tracking-widest mt-1">Next Appointment</p>
                    </div>
                </div>

                {/* Center: Job Details & Tracking */}
                <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
                            <p className="text-gray-400 text-sm">{job.location}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold text-lg">R {job.price}</p>
                            <p className="text-gray-500 text-xs">Fixed Price</p>
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                        <div className="relative pt-2 pb-6">
                        <div className="flex justify-between relative z-10">
                            {statusSteps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full border ${
                                                    idx <= currentStepIndex 
                                                        ? 'bg-gold border-gold' 
                                                        : 'bg-white/10 border-white/20'
                                                } transition-all duration-75`} />
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                                        idx <= currentStepIndex ? 'text-gold' : 'text-gray-600'
                                    }`}>
                                        {step.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Progress Line */}
                        <div className="absolute top-[21px] left-4 right-4 h-0.5 bg-white/5" />
                        <div className="absolute top-[21px] left-4 h-0.5 bg-gold transition-all duration-75 linear" style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 94}%` }} />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/messages/${job.id}`} className="flex-1 bg-white/5 border border-gold/30 text-gold hover:bg-gold hover:text-black py-3 rounded-sm text-center font-bold">
                            Message Worker
                        </Link>
                        <button className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-sm font-bold">
                            Reschedule
                        </button>
                    </div>
                </div>

                {/* Right: Map/Map Placeholder */}
                <div className="w-full lg:w-64 h-48 rounded-md bg-black/40 border border-white/10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-end p-4">
                        <p className="text-xs text-gold font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Live Tracking Available
                        </p>
                    </div>
                    {/* Simulated map grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                        backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl transition-transform duration-75">📍</div>
                </div>
            </div>

            {/* decorative background removed */}
        </div>
    )
}
