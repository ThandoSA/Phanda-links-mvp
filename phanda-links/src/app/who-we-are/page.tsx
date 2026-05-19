"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Shield, Zap, Heart, ArrowRight, CheckCircle2, Users2, Globe } from "lucide-react"

export default function WhoWeArePage() {
    const values = [
        {
            icon: <Users2 className="w-10 h-10" />,
            title: "Trust",
            desc: "Building verified, reliable connections"
        },
        {
            icon: <Zap className="w-10 h-10" />,
            title: "Speed",
            desc: "Fast responses, quick solutions"
        },
        {
            icon: <Globe className="w-10 h-10" />,
            title: "Community",
            desc: "Empowering local economies"
        }
    ]

    return (
        <main className="bg-black min-h-screen selection:bg-gold selection:text-black">
            <Navbar />
            
            {/* 1. HERO SECTION */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[160px] rounded-full pointer-events-none" />
                
                <div className="max-w-6xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4">Our Identity</p>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8">
                            Building a platform where <br />
                            <span className="text-gold italic font-serif">skills meet opportunity.</span>
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                            Connecting communities and empowering South Africa's workforce through trust, visibility, and professional dignity.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group"
                    >
                        <Image 
                            src="/images/hero.png" 
                            alt="Community Workers" 
                            fill 
                            className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                            <p className="text-white text-xs font-black uppercase tracking-[0.3em] opacity-60">Community Connection</p>
                            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center shadow-2xl">
                                <Heart className="w-8 h-8 text-black" fill="currentColor" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. OUR STORY */}
            <section className="py-32 px-6 bg-[#050505]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8">
                                Our <span className="text-gold font-serif italic">Story.</span>
                            </h2>
                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed font-medium">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="card-luxury p-10 rounded-[2.5rem] border border-white/5 space-y-6"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gold border border-white/10">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-white">Our Mission</h3>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                To create dignified employment opportunities for South African workers while connecting communities with trusted, reliable services.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="card-luxury p-10 rounded-[2.5rem] border border-white/5 space-y-6"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gold border border-white/10">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-white">Our Vision</h3>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                A South Africa where every skilled individual has access to sustainable income, and every household can find trusted help when they need it.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. OUR VALUES */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                        Our <span className="text-gold font-serif italic">Values.</span>
                    </h2>
                    <p className="text-gray-500 font-medium">The principles that guide every connection we make.</p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {values.map((v, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-12 card-luxury rounded-[2.5rem] border border-white/5 group hover:border-gold/30 transition-all"
                        >
                            <div className="flex justify-center mb-8 text-gold group-hover:scale-110 transition-transform">
                                {v.icon}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">{v.title}</h3>
                            <p className="text-gray-500 text-sm font-medium">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. JOIN US */}
            <section className="py-40 px-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gold/5 blur-[180px] rounded-full pointer-events-none" />
                </div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[1.1]">
                        Join Our Growing <br />
                        <span className="text-gold font-serif italic">Community.</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Whether you're looking for work or need a trusted service provider, Phanda Links is here for you.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link 
                            href="/workers" 
                            className="btn-luxury bg-white text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-gold transition-all"
                        >
                            Find a Worker <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link 
                            href="/signup?role=worker" 
                            className="btn-luxury border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
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
