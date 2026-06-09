"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Briefcase, Users, Search, Star, CreditCard, Clock, ShieldCheck, MapPin, CalendarCheck, MessageSquare, ArrowRight } from "lucide-react"

export default function WhatWeDoPage() {
    const workerBenefits = [
        {
            title: "Find Consistent Work",
            desc: "Connect with local clients in your area looking for your exact trade skills.",
            icon: <MapPin className="w-5 h-5" />
        },
        {
            title: "Build Your Reputation",
            desc: "Earn ratings, collect reviews, and command premium rates.",
            icon: <Star className="w-5 h-5" />
        },
        {
            title: "Secure Payments",
            desc: "Get paid safely and on time for every completed milestone.",
            icon: <CreditCard className="w-5 h-5" />
        },
        {
            title: "Flexible Schedule",
            desc: "Work on your own terms, when and where it suits your lifestyle.",
            icon: <Clock className="w-5 h-5" />
        }
    ]

    const clientBenefits = [
        {
            title: "Find Trusted Workers Fast",
            desc: "Browse by location, verified skills, and availability instantly.",
            icon: <Search className="w-5 h-5" />
        },
        {
            title: "Verified Profiles",
            desc: "Every professional undergoes identity checks for community safety.",
            icon: <ShieldCheck className="w-5 h-5" />
        },
        {
            title: "Read Authentic Reviews",
            desc: "View feedback from other clients before booking your provider.",
            icon: <MessageSquare className="w-5 h-5" />
        },
        {
            title: "Support Local Hustle",
            desc: "Keep investments inside your community by hiring local talent.",
            icon: <Users className="w-5 h-5" />
        }
    ]

    const steps = [
        {
            num: "01",
            title: "Search",
            desc: "Browse workers by service categories and locations.",
            icon: <Search className="w-6 h-6" />
        },
        {
            num: "02",
            title: "Choose",
            desc: "Compare profile details, ratings, and past projects.",
            icon: <Users className="w-6 h-6" />
        },
        {
            num: "03",
            title: "Book",
            desc: "Securely request service details and coordinate schedules.",
            icon: <CalendarCheck className="w-6 h-6" />
        },
        {
            num: "04",
            title: "Rate",
            desc: "Leave honest feedback to guide other community members.",
            icon: <Star className="w-6 h-6" />
        }
    ]

    return (
        <main className="bg-white text-black min-h-screen selection:bg-[#D4AF37] selection:text-black grid-glow">
            <Navbar />
            
            {/* 1. HERO SECTION */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-20"
                    >
                        <p className="text-[#D4AF37] font-mono uppercase tracking-[0.4em] text-[10px] mb-4 font-extrabold">THE PLATFORM</p>
                        <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[1.1] mb-8 uppercase">
                            What we <span className="text-[#D4AF37]">do.</span>
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                            We connect workers to jobs and clients to trusted services, creating a seamless marketplace for Mzansi's excellence.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. FOR WORKERS & CLIENTS */}
            <section className="py-20 px-6 border-y border-black/5 bg-gray-50/50">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
                    {/* For Workers */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="card-luxury p-10 md:p-14 border border-black/5 relative overflow-hidden group bg-white"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-3 pointer-events-none text-black">
                            <Briefcase className="w-36 h-36" />
                        </div>
                        
                        <div className="relative z-10 space-y-10">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-black mb-3 uppercase tracking-tight">For <span className="text-[#D4AF37]">Workers.</span></h2>
                                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-wider font-bold">Empowering your hustle with the right tools.</p>
                            </div>

                            <div className="grid gap-6">
                                {workerBenefits.map((b, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                                            {b.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-black uppercase tracking-tight">{b.title}</h4>
                                            <p className="text-gray-500 text-sm mt-1">{b.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link href="/signup?role=worker" className="btn-luxury btn-luxury-primary px-8 py-3 text-xs uppercase tracking-wider font-extrabold inline-block">
                                    Join as a Worker
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* For Clients */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="card-luxury p-10 md:p-14 border border-black/5 relative overflow-hidden group bg-white"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-3 text-[#D4AF37] pointer-events-none">
                            <Users className="w-36 h-36" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-black mb-3 uppercase tracking-tight">For <span className="text-[#D4AF37]">Clients.</span></h2>
                                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-wider font-bold">Finding help you can actually trust.</p>
                            </div>

                            <div className="grid gap-6">
                                {clientBenefits.map((b, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black flex-shrink-0 border border-black/5">
                                            {b.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-black uppercase tracking-tight">{b.title}</h4>
                                            <p className="text-gray-500 text-sm mt-1">{b.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link href="/workers" className="btn-luxury btn-luxury-secondary border-black/10 hover:border-black px-8 py-3 text-xs uppercase tracking-wider font-extrabold inline-block">
                                    Find a Worker
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. HOW IT WORKS */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4 uppercase">
                            How it <span className="text-[#D4AF37]">works.</span>
                        </h2>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-wider max-w-xl mx-auto">Simple steps to professional excellence.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {steps.map((s, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative p-8 card-luxury border border-black/5 group text-center bg-white"
                            >
                                <div className="absolute top-4 left-4 text-[#D4AF37]/15 font-mono font-black text-3xl">{s.num}</div>
                                <div className="flex justify-center mb-6 text-[#D4AF37] relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                                        {s.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-black mb-3 relative z-10 uppercase tracking-tight">{s.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed relative z-10">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
