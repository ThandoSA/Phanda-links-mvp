"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, ArrowRight, Globe, Share2, Shield } from "lucide-react"

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const sections = [
        {
            title: "Platform",
            links: [
                { label: "Home", href: "/" },
                { label: "Find Workers", href: "/workers" },
                { label: "Post a Job", href: "/dashboard/client/post-job" },
                { label: "Marketplace", href: "/dashboard/worker/jobs" },
            ]
        },
        {
            title: "Company",
            links: [
                { label: "Who We Are", href: "/who-we-are" },
                { label: "What We Do", href: "/what-we-do" },
                { label: "Community Impact", href: "/policies#community-impact" },
                { label: "Safety & Trust", href: "/policies#safety-trust" },
            ]
        },
        {
            title: "Support",
            links: [
                { label: "Help Center", href: "/help" },
                { label: "Contact Us", href: "/contact" },
                { label: "Dispute Resolution", href: "/policies#dispute-resolution" },
                { label: "Rewards Program", href: "/policies#credits-rewards" },
            ]
        },
        {
            title: "Legal",
            links: [
                { label: "Terms of Service", href: "/policies#terms-of-service" },
                { label: "Privacy Policy", href: "/policies#privacy-policy" },
                { label: "User Conduct", href: "/policies#user-conduct" },
                { label: "Worker Policy", href: "/policies#worker-policy" },
                { label: "Client Policy", href: "/policies#client-policy" },
                { label: "Payments & Fees", href: "/policies#payments-fees" },
                { label: "Cancellation Policy", href: "/policies#cancellation-policy" },
            ]
        }
    ]

    return (
        <footer className="bg-white border-t border-black/5 pt-20 pb-12 relative overflow-hidden">
            {/* Ambient light glow */}
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/3 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-black/5 group-hover:border-[#D4AF37] transition-all">
                                <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover no-grayscale" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tighter text-black">
                                Phanda <span className="text-[#D4AF37]">Links.</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs">
                            Connecting premium hustle to real opportunity. We build digital legacies for South Africa's elite talent.
                        </p>
                        <div className="flex items-center gap-2">
                            {[Globe, Share2, Shield].map((Icon, i) => (
                                <Link key={i} href="#" className="w-9 h-9 rounded-full bg-black/3 border border-black/5 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-black/5 transition-all">
                                    <Icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Sections */}
                    {sections.map((section, i) => (
                        <div key={i} className="space-y-4">
                            <h4 className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider mb-4">{section.title}</h4>
                            <ul className="space-y-2.5">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link href={link.href} className="text-gray-500 hover:text-black text-xs font-medium transition-colors flex items-center group gap-2">
                                            {link.label}
                                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#D4AF37]" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-black/5 mb-8">
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-black/3 flex items-center justify-center border border-black/5 group-hover:border-[#D4AF37]/40 transition-all">
                            <Mail className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Email Us</p>
                            <p className="text-gray-800 text-sm font-bold">support@phanda-links.co.za</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-black/3 flex items-center justify-center border border-black/5 group-hover:border-[#D4AF37]/40 transition-all">
                            <Phone className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Call Us</p>
                            <p className="text-gray-800 text-sm font-bold">+27 11 000 0000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-black/3 flex items-center justify-center border border-black/5 group-hover:border-[#D4AF37]/40 transition-all">
                            <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Visit Us</p>
                            <p className="text-gray-800 text-sm font-bold">Sandton, Johannesburg, RSA</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">
                        © {currentYear} Phanda Links. Built for South African Hustle Culture.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/policies#privacy-policy" className="text-gray-400 hover:text-black text-[9px] font-mono uppercase tracking-wider transition-colors">Privacy</Link>
                        <Link href="/policies#terms-of-service" className="text-gray-400 hover:text-black text-[9px] font-mono uppercase tracking-wider transition-colors">Terms</Link>
                        <Link href="/contact" className="text-gray-400 hover:text-black text-[9px] font-mono uppercase tracking-wider transition-colors">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
