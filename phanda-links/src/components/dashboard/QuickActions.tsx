"use client"

import Link from "next/link"

export default function QuickActions() {
    const actions = [
        {
            title: "Book Service",
            desc: "Hire a verified professional now",
            icon: "✨",
            href: "/workers",
            color: "border-gold/20 hover:border-gold/50 shadow-gold/5 hover:shadow-gold/10"
        },
        {
            title: "Post a Job",
            desc: "Let professionals apply to you",
            icon: "📋",
            href: "/dashboard/client/post-job",
            color: "border-white/10 hover:border-white/30 shadow-white/5"
        },
        {
            title: "Help Center",
            desc: "Learn how Phanda Links works",
            icon: "🛡️",
            href: "/support",
            color: "border-white/10 hover:border-white/30 shadow-white/5"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {actions.map((action, i) => (
                <Link key={i} href={action.href} className="group">
                    <div className={`glass-panel p-6 rounded-2xl h-full transition-all duration-300 transform group-hover:-translate-y-1 border ${action.color} shadow-xl relative overflow-hidden`}>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="text-3xl bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl border border-white/5">
                                {action.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">{action.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
                            </div>
                        </div>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
