"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageSquare, MapPin } from "lucide-react"

interface ClientHeroJob {
    id: string
    status: string
    created_at: string
    title?: string
    price?: number
    location?: string
    worker?: { full_name: string; avatar_url?: string | null } | null
}

interface ClientHeroProps {
    job: ClientHeroJob | null
}

export default function ClientHero({ job }: ClientHeroProps) {
    if (!job) {
        return (
            <div className="glass-card p-8 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-2xl font-black text-black tracking-tight">No Active Appointments</h2>
                    <p className="text-gray-500 text-sm font-medium">Find vetted professionals for your home or business needs today.</p>
                </div>
                <Link href="/workers" className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm font-bold whitespace-nowrap">
                    Browse Workers
                </Link>
            </div>
        )
    }

    const statusSteps = ['pending', 'accepted', 'en_route', 'in_progress', 'completed']
    const currentStepIndex = statusSteps.indexOf(job.status)

    return (
        <div className="glass-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start relative z-10">
                {/* Left: Worker Info */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm flex-shrink-0">
                        <Image
                            src={job.worker?.avatar_url || "/images/default-avatar.svg"}
                            alt={job.worker?.full_name || "Worker"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <h3 className="text-lg font-bold text-black tracking-tight">{job.worker?.full_name || "Premium Worker"}</h3>
                        </div>
                        <p className="text-[#D4AF37] text-xs font-bold mt-1">Next Appointment</p>
                    </div>
                </div>

                {/* Center: Job Details & Tracking */}
                <div className="flex-1 w-full space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-black tracking-tight">{job.title}</h2>
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mt-1">
                                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                {job.location || "On-site"}
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-sm text-gray-500 font-medium">Fixed Price</p>
                            <p className="text-2xl font-black text-black mt-0.5">{job.price ? `R ${job.price.toLocaleString()}` : "Pending"}</p>
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="relative pt-2 pb-6 px-2">
                        <div className="flex justify-between relative z-10">
                            {statusSteps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center gap-2 relative">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                        idx <= currentStepIndex 
                                            ? 'bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]' 
                                            : 'bg-white border-gray-300'
                                    } transition-all duration-300 z-10`} />
                                    <span className={`text-[10px] uppercase font-bold tracking-wider absolute top-6 ${
                                        idx <= currentStepIndex ? 'text-black' : 'text-gray-400'
                                    }`}>
                                        {step.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Progress Line */}
                        <div className="absolute top-[15px] left-4 right-4 h-1 bg-gray-200 rounded-full" />
                        <div className="absolute top-[15px] left-4 h-1 bg-[#D4AF37] transition-all duration-500 rounded-full" style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 95)}%` }} />
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <Link 
                            href={`/dashboard/messages/${job.id}`} 
                            className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm font-bold flex items-center gap-2 justify-center flex-1"
                        >
                            <MessageSquare className="w-4 h-4 text-white" /> Message Worker
                        </Link>
                        <button className="btn-luxury btn-luxury-outline px-8 py-3.5 text-sm font-bold flex-1 bg-white">
                            Reschedule
                        </button>
                    </div>
                </div>

                {/* Right: Map/Map Placeholder */}
                <div className="w-full lg:w-64 h-48 rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden relative shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent z-10 flex items-end p-4">
                        <p className="text-xs text-[#D4AF37] font-bold flex items-center gap-2 drop-shadow-sm">
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                            Live Dispatch GPS
                        </p>
                    </div>
                    {/* Simulated map grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                        backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl transition-transform duration-300 hover:scale-110 drop-shadow-md cursor-pointer">📍</div>
                </div>
            </div>
        </div>
    )
}
