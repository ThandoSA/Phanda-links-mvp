"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Users, Target, Award, ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function WhyPhandaLinks() {
  return (
    <main className="bg-white text-black overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/Joburg_.jpg"
          alt="South African hustle"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black tracking-tighter leading-tight mb-6 text-white"
          >
            Why <span className="text-[#D4AF37]">Phanda Links</span>?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-white/90"
          >
            Talent shouldn't depend on who you know.
          </motion.p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-5xl font-black tracking-tighter">The Problem is Real</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
              Great workers are everywhere. But opportunities are not.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="glass-card p-10">
              <h3 className="text-2xl font-bold mb-4">For Workers</h3>
              <p className="text-gray-600 leading-relaxed">
                Too many skilled people depend on word-of-mouth and referrals. 
                When those run dry, they struggle — even with years of experience.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="glass-card p-10">
              <h3 className="text-2xl font-bold mb-4">For Clients</h3>
              <p className="text-gray-600 leading-relaxed">
                Finding reliable, trustworthy help is stressful and time-consuming. 
                Trust is difficult to verify quickly.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-20 px-6 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <motion.h2 {...fadeUp} className="text-5xl font-black tracking-tighter">Our Solution</motion.h2>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div {...fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-4 mb-6">
              <Users className="w-10 h-10 text-[#D4AF37]" />
              <h3 className="text-3xl font-bold">For Workers</h3>
            </div>
            <ul className="space-y-4 text-lg">
              <li>✓ Professional profile &amp; visibility</li>
              <li>✓ Showcase real skills and experience</li>
              <li>✓ Get discovered by paying clients</li>
              <li>✓ Build reputation through reviews</li>
            </ul>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="glass-card p-10">
            <div className="flex items-center gap-4 mb-6">
              <Target className="w-10 h-10 text-[#D4AF37]" />
              <h3 className="text-3xl font-bold">For Clients</h3>
            </div>
            <ul className="space-y-4 text-lg">
              <li>✓ Find verified local talent fast</li>
              <li>✓ See real profiles and reviews</li>
              <li>✓ Hire with confidence</li>
              <li>✓ Support South African hustlers</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Why Phanda */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <Award className="w-16 h-16 mx-auto text-[#D4AF37] mb-6" />
            <h2 className="text-5xl font-black tracking-tighter mb-8">
              Why "<span className="text-[#D4AF37]">Phanda</span>"?
            </h2>
            <p className="text-xl leading-relaxed text-gray-300">
              "Phanda" captures the South African spirit of hustle, resilience, and determination. 
              This platform exists to support that spirit — making hardworking people more visible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#D4AF37] to-amber-400">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            {...fadeUp}
            className="text-5xl md:text-6xl font-black tracking-tighter text-black mb-8"
          >
            Ready to join the movement?
          </motion.h2>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/signup" className="btn-luxury bg-black text-white px-12 py-6 text-lg font-semibold hover:bg-gray-900">
              Join as a Worker
            </Link>
            <Link href="/signup?role=client" className="btn-luxury bg-white text-black px-12 py-6 text-lg font-semibold hover:bg-gray-100">
              I Need Talent
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
