"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Briefcase, Users, Search, Star, CreditCard, Clock, ShieldCheck, MapPin, CalendarCheck, MessageSquare } from "lucide-react"

export default function WhatWeDoPage() {
    const workerBenefits = [
        {
            title: "Find Consistent Work",
            desc: "Connect with clients in your area looking for your skills",
            icon: <MapPin className="w-6 h-6" />
        },
        {
            title: "Build Your Reputation",
            desc: "Earn ratings and reviews to attract more clients",
            icon: <Star className="w-6 h-6" />
        },
        {
            title: "Secure Payments",
            desc: "Get paid fairly and on time for completed work",
            icon: <CreditCard className="w-6 h-6" />
        },
        {
            title: "Flexible Schedule",
            desc: "Work when you want, where you want",
            icon: <Clock className="w-6 h-6" />
        }
    ]

    const clientBenefits = [
        {
            title: "Find Trusted Workers Fast",
            desc: "Search by location, skill, and availability",
            icon: <Search className="w-6 h-6" />
        },
        {
            title: "Verified Profiles",
            desc: "All workers are ID-verified for your safety",
            icon: <ShieldCheck className="w-6 h-6" />
        },
        {
            title: "Read Real Reviews",
            desc: "See ratings and feedback from other clients",
            icon: <MessageSquare className="w-6 h-6" />
        },
        {
            title: "Support Local",
            desc: "Hire from your community and keep income local",
            icon: <Users className="w-6 h-6" />
        }
    ]

    const steps = [
        {
            num: "01",
            title: "Search",
            desc: "Browse workers by service and location",
            icon: <Search className="w-8 h-8" />
        },
        {
            num: "02",
            title: "Choose",
            desc: "Compare profiles, ratings, and availability",
            icon: <Users className="w-8 h-8" />
        },
        {
            num: "03",
            title: "Book",
            desc: "Request a service and schedule a time",
            icon: <CalendarCheck className="w-8 h-8" />
        },
        {
            num: "04",
            title: "Rate",
            desc: "Leave feedback to help others",
            icon: <Star className="w-8 h-8" />
        }
    ]

    return (
        <main className="bg-black min-h-screen selection:bg-gold selection:text-black">
            <Navbar />
            
            {/* 1. HERO SECTION */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        className="mb-20"
                    >
                        <p className="text-gold font-mono uppercase tracking-[0.4em] text-[10px] mb-4">THE PLATFORM</p>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8 uppercase">
                            What we <span className="text-gold">do.</span>
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                            We connect workers to jobs and clients to trusted services, creating a seamless marketplace for Mzansi's excellence.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. FOR WORKERS & CLIENTS */}
            <section className="py-20 px-6 border-t border-b border-white/10 bg-[#050505]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
                    {/* For Workers */}
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        className="card-luxury p-10 md:p-16 border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Briefcase className="w-40 h-40" />
                        </div>
                        
                        <div className="relative z-10 space-y-12">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase">For <span className="text-gold">Workers.</span></h2>
                                <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">Empowering your hustle with the right tools.</p>
                            </div>

                            <div className="grid gap-8">
                                {workerBenefits.map((b, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-12 h-12 rounded-sm bg-gold/10 flex items-center justify-center text-gold flex-shrink-0 border border-gold/20">
                                            {b.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-white font-black uppercase tracking-tight">{b.title}</h4>
                                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{b.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/signup?role=worker" className="btn-luxury btn-luxury-primary px-10 py-5 text-sm uppercase tracking-widest inline-block">
                                Join as a Worker
                            </Link>
                        </div>
                    </motion.div>

                    {/* For Clients */}
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        className="card-luxury p-10 md:p-16 border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 text-gold pointer-events-none">
                            <Users className="w-40 h-40" />
                        </div>

                        <div className="relative z-10 space-y-12">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase">For <span className="text-gold">Clients.</span></h2>
                                <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">Finding help you can actually trust.</p>
                            </div>

                            <div className="grid gap-8">
                                {clientBenefits.map((b, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-12 h-12 rounded-sm bg-white/5 flex items-center justify-center text-white flex-shrink-0 border border-white/10 group-hover:border-gold/30 transition-colors duration-75">
                                            {b.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-white font-black uppercase tracking-tight">{b.title}</h4>
                                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{b.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/workers" className="btn-luxury border border-white/10 text-white px-10 py-5 text-sm uppercase tracking-widest inline-block hover:bg-white/5">
                                Find a Worker
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. HOW IT WORKS */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 uppercase">
                            How it <span className="text-gold">works.</span>
                        </h2>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-wider max-w-xl mx-auto">Simple steps to professional excellence.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((s, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.1, ease: "linear" }}
                                className="relative p-10 card-luxury border border-white/10 group text-center"
                            >
                                <div className="absolute top-6 left-6 text-gold/10 font-mono font-black text-4xl leading-none tracking-tighter">{s.num}</div>
                                <div className="flex justify-center mb-8 text-gold group-hover:scale-105 transition-transform duration-75 relative z-10">
                                    {s.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 relative z-10 uppercase">{s.title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed relative z-10">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
