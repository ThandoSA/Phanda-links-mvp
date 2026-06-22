"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Shield, Zap, Heart, ArrowRight, Users2, Globe } from "lucide-react"

export default function WhoWeArePage() {
    const values = [
        {
            icon: <Users2 className="w-8 h-8" />,
            title: "TRUST",
            desc: "Building verified, reliable connections across South Africa."
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "VISIBILITY",
            desc: "Enabling hidden talent to showcase their work and scale."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "COMMUNITY",
            desc: "Circulating financial opportunities directly back into local economies."
        }
    ]

    return (
        <main className="bg-white text-black min-h-screen selection:bg-[#D4AF37] selection:text-black grid-glow">
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <p className="text-[#D4AF37] font-mono uppercase tracking-[0.4em] text-[10px] mb-4 font-extrabold">OUR IDENTITY</p>
                        <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[1.1] mb-8 uppercase">
                            Building a platform where <br />
                            <span className="text-[#D4AF37]">skills meet opportunity.</span>
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                            Connecting communities and empowering South Africa's workforce through trust, visibility, and professional dignity.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative h-[350px] md:h-[500px] rounded-[32px] overflow-hidden border border-black/5 shadow-xl group"
                    >
                        <Image
                            src="/images/Who.png.jpg"
                            alt="Community Workers"
                            fill
                            className="object-cover object-top img-reveal"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
                            <p className="text-white text-xs font-mono uppercase tracking-widest opacity-80">Community Connection</p>
                            <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-md">
                                <Heart className="w-5 h-5 text-black" fill="currentColor" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. OUR STORY */}
            <section className="py-32 px-6 bg-gray-50 border-y border-black/5">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-6 uppercase">
                                Our <span className="text-[#D4AF37]">Story.</span>
                            </h2>
                            <div className="space-y-5 text-gray-600 text-base leading-relaxed font-medium">
                                <p>
                                    Phanda Links was born from a simple observation: talented, hardworking people across South Africa struggle to find consistent work, while households and businesses need reliable local services.
                                </p>
                                <p>
                                    We saw an opportunity to bridge this gap through technology — creating a platform that doesn't just connect people, but builds trust, circulates income, and strengthens communities.
                                </p>
                                <p>
                                    Today, we're proud to be empowering thousands of workers while providing South Africans with fast, reliable access to trusted local services.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="card-luxury p-8 space-y-6 bg-white border border-black/5"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-black uppercase tracking-tight">Our Mission</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                To create dignified employment opportunities for South African workers while connecting communities with trusted, reliable services.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="card-luxury p-8 space-y-6 bg-white border border-black/5"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-black uppercase tracking-tight">Our Vision</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                A South Africa where every skilled individual has access to sustainable income, and every household can find trusted help when they need it.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. OUR VALUES */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4 uppercase">
                        Our <span className="text-[#D4AF37]">Values.</span>
                    </h2>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">The principles that guide every connection we make.</p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {values.map((v, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-8 card-luxury group bg-white border border-black/5"
                        >
                            <div className="flex justify-center mb-6 text-[#D4AF37]">
                                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                                    {v.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3 uppercase tracking-tight">{v.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. JOIN US */}
            <section className="py-32 px-6 relative overflow-hidden border-t border-black/5 bg-black text-white">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero-1.svg"
                        alt="Join Phanda Community"
                        fill
                        className="object-cover opacity-10"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] uppercase">
                        Join Our Growing <br />
                        <span className="text-[#D4AF37]">Community.</span>
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Whether you're looking for work or need a trusted service provider, Phanda Links is here to bridge the gap.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/workers"
                            className="btn-luxury btn-luxury-primary bg-[#D4AF37] text-black border-[#D4AF37] hover:bg-white hover:text-black hover:border-white px-8 py-4 text-xs uppercase tracking-wider flex items-center gap-2 font-extrabold"
                        >
                            Find a Worker <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/signup?role=worker"
                            className="btn-luxury border border-white/20 text-white hover:bg-white/5 px-8 py-4 text-xs uppercase tracking-wider font-extrabold"
                        >
                            Become a Worker
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
