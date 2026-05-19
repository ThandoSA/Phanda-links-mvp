"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { 
  Gem, 
  Rocket, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Search,
  ShieldCheck,
  Star
} from "lucide-react"

const heroImages = [
  "/images/Joburg_.jpg",
  "/images/download (2).jpg",
  "/images/download (3).jpg"
]

const categories = [
  { name: "Plumbing", icon: <Zap className="w-6 h-6" />, count: "150+ Pros" },
  { name: "Electrical", icon: <Zap className="w-6 h-6" />, count: "120+ Pros" },
  { name: "Cleaning", icon: <CheckCircle2 className="w-6 h-6" />, count: "300+ Pros" },
  { name: "Beauty", icon: <Star className="w-6 h-6" />, count: "80+ Pros" },
  { name: "Building", icon: <Gem className="w-6 h-6" />, count: "200+ Pros" },
  { name: "Gardening", icon: <Rocket className="w-6 h-6" />, count: "100+ Pros" },
]

const trustSignals = [
  { label: "ID Verified", icon: <ShieldCheck className="w-4 h-4" /> },
  { label: "Top Rated", icon: <Star className="w-4 h-4" /> },
  { label: "Secure Payments", icon: <Gem className="w-4 h-4" /> },
  { label: "Community Trusted", icon: <CheckCircle2 className="w-4 h-4" /> },
]



export default function Home() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [featuredWorkers, setFeaturedWorkers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { scrollY } = useScroll()
  const heroRef = useRef(null)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/workers?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/workers')
    }
  }
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`id, full_name, location, avatar_url, worker_profiles(skills, rating, verified)`)
        .eq("role", "worker")
      if (!error && data) {
        const mapped = data.map((profile: any) => {
          const wp = profile.worker_profiles?.[0]
          return {
            ...profile,
            rating: wp?.rating || 0,
            is_verified: wp?.verified || false
          }
        })
        const sorted = [...mapped].sort((a: any, b: any) => b.rating - a.rating)
        setFeaturedWorkers(sorted.slice(0, 3))
      } else if (error) {
        console.error("Error fetching featured workers:", error)
      }
    }
    fetchFeatured()
  }, [])

  const y1 = useTransform(scrollY, [0, 800], [0, 200])

  return (
    <main className="bg-black text-white selection:bg-gold selection:text-black">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section ref={heroRef} id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1.05 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[index]}
                alt="Phanda Links Hero"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-6xl pt-40">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gold font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-6"
          >
            Luxury Marketplace for South African Hustle
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8"
          >
            The Hustle <br />
            <span className="text-gold italic font-serif">Deserves</span> <br />
            Visibility.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-[1.4]"
          >
            Phanda Links connects talented South African workers with real opportunities, turning the invisible hustle into a digital legacy.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="w-full max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 justify-center items-center w-full">
              <div className="relative w-full group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-gold transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need today?" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-medium focus:outline-none focus:border-gold/50 backdrop-blur-xl transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-white text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold transition-all shadow-xl whitespace-nowrap cursor-pointer"
              >
                Find a Worker
              </button>
            </form>
          </motion.div>
        </div>


      </section>

      {/* TRUST STRIP */}
      <div className="bg-white/[0.02] border-y border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-around gap-8">
          {trustSignals.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-gold">{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED CATEGORIES */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Explore <span className="text-gold font-serif italic">Expertise.</span>
            </h2>
            <p className="text-gray-500 font-medium">Find the best local talent across all major sectors.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                href={`/workers?category=${cat.name.toLowerCase()}`}
                className="card-luxury p-8 rounded-3xl border border-white/5 text-center group hover:border-gold/30 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-white font-black text-sm mb-1">{cat.name}</h3>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. WHO WE ARE SECTION */}
      <section id="who-we-are" className="py-40 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <p className="text-gold font-black uppercase tracking-[0.3em] text-xs">Our Identity</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
              A Digital <br />
              Marketplace for <br />
              <span className="text-gold font-serif italic">Mzansi's Hustlers.</span>
            </h2>
            <div className="h-px w-20 bg-gold" />
            <p className="text-gray-400 text-xl leading-relaxed font-medium">
              Phanda Links is more than a platform; it's a movement. We've built a premium digital space where South Africa's most talented workers can showcase their skills with professional dignity.
            </p>
            <Link 
              href="/who-we-are" 
              className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs group hover:text-gold transition-colors"
            >
              Learn Our Story <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl"
          >
            <Image 
              src="/images/download (2).jpg" 
              alt="Worker" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>



      {/* 4. HOW IT WORKS */}
      <section className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-gold font-black uppercase tracking-[0.3em] text-xs mb-4">The Process</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">How It <span className="text-gold">Works.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Create Profile", desc: "Build your professional digital identity in minutes. Showcase your skills, location, and personality." },
              { step: "02", title: "Get Found", desc: "Appear in searches by local clients looking for exactly what you offer. No more waiting for referrals." },
              { step: "03", title: "Get Hired", desc: "Receive bookings, chat securely, and get paid for your excellence. Grow your business on your terms." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative p-12 glass-luxury rounded-[2.5rem] border border-white/10 group overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 text-[120px] font-black text-white/5 group-hover:text-gold/10 transition-colors">{item.step}</div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-white mb-6">{item.title}</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                  <div className="mt-8 h-1 w-0 bg-gold group-hover:w-20 transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED WORKERS */}
      <section className="py-40 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <p className="text-gold font-black uppercase tracking-[0.3em] text-xs">The Elite</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Featured <span className="text-gold">Talent.</span></h2>
            </div>
            <Link href="/workers" className="group flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs border-b border-gold pb-2 hover:text-gold transition-colors">
              View All Professionals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredWorkers.length === 0 ? (
               [1,2,3].map(i => <div key={i} className="h-[500px] bg-white/5 rounded-[2.5rem] animate-pulse" />)
            ) : (
              featuredWorkers.map((worker, i) => (
                <Link key={worker.id} href={`/workers/${worker.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -15 }}
                    className="group relative h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
                  >
                    <Image 
                      src={worker.avatar_url || "/images/default-avatar.svg"} 
                      alt={worker.full_name} 
                      fill 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex justify-between items-center">
                        <span className="bg-gold text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Verified Elite</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-gold fill-gold" />
                          <span className="text-gold font-black text-sm">{worker.rating || "5.0"}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white">{worker.full_name}</h3>
                        <p className="text-gold text-xs font-black uppercase tracking-widest">{worker.worker_profiles?.[0]?.skills?.slice(0, 2).join(" • ") || "Elite Professional"}</p>
                      </div>
                      <p className="text-gray-400 text-sm font-medium">{worker.location || "South Africa"}</p>
                      <div className="w-full py-4 bg-white/10 group-hover:bg-gold group-hover:text-black rounded-xl text-xs font-black uppercase tracking-widest backdrop-blur-xl border border-white/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        View Profile
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/Joburg_.jpg" 
            alt="Phanda Links Footer" 
            fill 
            sizes="100vw"
            className="object-cover opacity-20" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              Ready to <br />
              <span className="text-gold">Empower</span> <br />
              The Hustle?
            </h2>
            <p className="text-gray-400 text-xl font-medium max-w-xl mx-auto">
              Join the elite community where talent meets opportunity. Whether you're hiring or hustling, your future starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
              <Link
                href="/signup?role=worker"
                className="bg-gold text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_20px_60px_rgba(212,175,55,0.3)]"
              >
                Become a Worker
              </Link>
              <Link
                href="/workers"
                className="bg-white/5 border border-white/10 text-white px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-xl"
              >
                Find a Worker
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}