"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
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
        <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/3 blur-[160px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 group-hover:border-gold/50 transition-all duration-500">
                                <Image src="/images/logo-icon.jpeg" alt="Phanda Links" fill className="object-cover" />
                            </div>
                            <span className="font-black text-2xl tracking-tighter text-white">
                                Phanda <span className="text-gold">Links.</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs">
                            Connecting premium hustle to real opportunity. We build digital legacies for South Africa's elite talent.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Globe, Share2, Shield].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all">
                                    <Icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Sections */}
                    {sections.map((section, i) => (
                        <div key={i} className="space-y-6">
                            <h4 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-4">{section.title}</h4>
                            <ul className="space-y-3">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link href={link.href} className="text-gray-500 hover:text-white text-xs font-bold transition-colors flex items-center group gap-2">
                                            {link.label}
                                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gold" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter / Contact Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-white/5 mb-10">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all">
                            <Mail className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Email Us</p>
                            <p className="text-white text-sm font-bold">support@phanda-links.co.za</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all">
                            <Phone className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Call Us</p>
                            <p className="text-white text-sm font-bold">+27 11 000 0000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all">
                            <MapPin className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Visit Us</p>
                            <p className="text-white text-sm font-bold">Sandton, Johannesburg, RSA</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        © {currentYear} Phanda Links. Built for South African Hustle Culture.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/policies#privacy-policy" className="text-gray-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Privacy</Link>
                        <Link href="/policies#terms-of-service" className="text-gray-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Terms</Link>
                        <Link href="/contact" className="text-gray-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
