"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Briefcase, Star, Users, MapPin, Award } from "lucide-react";

const heroImages = [
  "/images/Joburg_.jpg",
  "/images/download (2).jpg",
  "/images/download (3).jpg",
];

export default function Home() {
  const [index, setIndex] = useState(0);

  // Hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-white text-black selection:bg-[#D4AF37] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.8 }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[index]}
                alt="Real South African workers and families"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        </div>

        <div className="relative z-10 text-center px-5 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[92px] font-black leading-[1.02] tracking-tighter mb-5 md:mb-6 text-white">
              Real people.<br />
              <span className="bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#B8860B] bg-clip-text text-transparent">
                Real work.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 md:mb-10">
              Connecting skilled hands across South Africa with opportunities that matter.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
              <Link href="/signup" className="btn-luxury btn-luxury-primary px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-semibold w-full sm:w-auto">
                Join as a Worker
              </Link>
              <Link href="/signup?role=client" className="btn-luxury btn-luxury-outline px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-semibold w-full sm:w-auto">
                Hire Talent
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/*(TRUST BAR / STATS)
      <div className="py-8 bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-x-12 gap-y-6 text-center">
          <div><span className="text-4xl font-black text-[#D4AF37]">2,400+</span><p className="text-sm text-gray-500">Workers</p></div>
          <div><span className="text-4xl font-black text-[#D4AF37]">1,800+</span><p className="text-sm text-gray-500">Successful Jobs</p></div>
          <div><span className="text-4xl font-black text-[#D4AF37]">4.9</span><p className="text-sm text-gray-500">Average Rating</p></div>
          <div><span className="text-4xl font-black text-[#D4AF37]">9 Provinces</span><p className="text-sm text-gray-500">Across Mzansi</p></div>
        </div>
      </div>*/}

      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <span className="px-5 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">Our Story</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">Born in the streets of South Africa</h2>
            <p className="text-base md:text-lg text-gray-600">
              We saw too many talented people struggling to find work while families and businesses needed reliable help.
              Phanda Links is our answer — a platform built with respect, dignity, and real South African spirit.
            </p>
            <Link href="/who-we-are" className="btn-luxury btn-luxury-primary inline-flex px-8 py-3.5 text-sm font-semibold">
              Our Story →
            </Link>
          </div>
          <div className="relative aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-2">
            <Image
              src="/images/download (2).jpg"
              alt="South African community"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* (TESTIMONIALS)
      <section className="py-24 px-6 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-5xl font-black tracking-tighter mb-16">Real Stories from Real People</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sipho Nkosi",
                role: "Electrician • Johannesburg",
                quote: "I went from struggling to find jobs to having steady work every week. The platform feels like family.",
                image: "/images/download (3).jpg"
              },
              {
                name: "Nomsa Khumalo",
                role: "Domestic Worker • Durban",
                quote: "Clients now respect my time and skills. I’ve built a good reputation and can support my children better.",
                image: "/images/Joburg_.jpg"
              },
              {
                name: "Thabo Mthembu",
                role: "Client • Cape Town",
                quote: "Found an amazing plumber within 2 days. The reviews and verification made me feel safe.",
                image: "/images/download (2).jpg"
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="glass-card p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden">
                    <Image src={testimonial.image} alt={testimonial.name} width={64} height={64} className="object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="italic text-gray-700">“{testimonial.quote}”</p>
                <div className="flex text-[#D4AF37] mt-6">★★★★★</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Simple. Human. Effective.</h2>
          <p className="text-gray-500 mt-4 text-lg">Three steps to your next opportunity.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 md:gap-10">
          {[
            { icon: <Briefcase className="w-10 h-10" />, title: "Build Your Profile", desc: "Tell your story with pride. Add your skills, experience, and photos so clients can see the real you." },
            { icon: <Users className="w-10 h-10" />, title: "Get Discovered", desc: "Be found by people who need your skills. Browse open jobs or let opportunities come to you." },
            { icon: <Award className="w-10 h-10" />, title: "Grow Together", desc: "Build a reputation through honest reviews and lasting relationships that grow your income." },
          ].map((step, i) => (
            <motion.div key={i} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ delay: i * 0.1 }} className="text-center glass-card p-8 md:p-10">
              <div className="mx-auto w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-amber-100 to-white rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 text-[#D4AF37]">
                {step.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-br from-[#D4AF37] to-amber-400">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-black mb-6 md:mb-8">
            Your next opportunity is waiting
          </h2>
          <p className="text-base md:text-xl text-black/80 mb-10 md:mb-12">Join the growing community of South Africans who believe work should be fair, visible, and respectful.</p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link href="/signup?role=worker" className="btn-luxury bg-black text-white px-10 sm:px-14 py-5 sm:py-6 text-base md:text-lg font-bold w-full sm:w-auto">I&apos;m Ready to Work</Link>
            <Link href="/signup?role=client" className="btn-luxury bg-white text-black px-10 sm:px-14 py-5 sm:py-6 text-base md:text-lg font-bold w-full sm:w-auto">I Need Reliable Help</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}