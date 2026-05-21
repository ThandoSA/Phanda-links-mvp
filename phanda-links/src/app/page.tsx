"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
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
  { name: "Plumbing", icon: <Zap className="w-5 h-5" />, count: "150+ Pros" },
  { name: "Electrical", icon: <Zap className="w-5 h-5" />, count: "120+ Pros" },
  { name: "Cleaning", icon: <CheckCircle2 className="w-5 h-5" />, count: "300+ Pros" },
  { name: "Beauty", icon: <Star className="w-5 h-5" />, count: "80+ Pros" },
  { name: "Building", icon: <Gem className="w-5 h-5" />, count: "200+ Pros" },
  { name: "Gardening", icon: <Rocket className="w-5 h-5" />, count: "100+ Pros" },
]

const trustSignals = [
  { label: "ID Verified", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { label: "Top Rated", icon: <Star className="w-3.5 h-3.5" /> },
  { label: "Secure Payments", icon: <Gem className="w-3.5 h-3.5" /> },
  { label: "Community Trusted", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
]

export default function Home() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [featuredWorkers, setFeaturedWorkers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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

  return (
    <main className="bg-black text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section ref={heroRef} id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[index]}
                alt="Phanda Links Hero"
                fill
                priority
                sizes="100vw"
                className="object-cover grayscale contrast-125"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl pt-32">
          <p className="text-[#C5A059] font-mono uppercase tracking-[0.25em] text-[10px] md:text-xs mb-4">
            Luxury Marketplace for South African Hustle
          </p>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter mb-6 uppercase">
            The Hustle <br />
            <span className="text-[#C5A059]">Deserves</span> <br />
            Visibility.
          </h1>

          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Phanda Links connects talented South African workers with real opportunities, turning the invisible hustle into a digital legacy.
          </p>

          <div className="w-full max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-[#C5A059] transition-colors duration-75" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need today?" 
                  className="input-luxury w-full pl-11"
                />
              </div>
              <button
                type="submit"
                className="btn-luxury btn-luxury-primary w-full sm:w-auto px-8 py-3.5 uppercase tracking-widest text-xs whitespace-nowrap cursor-pointer"
              >
                Find a Worker
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="bg-[#0B0B0C] border-y border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-around gap-6">
          {trustSignals.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-500 text-[9px] font-mono font-bold uppercase tracking-wider">
              <span className="text-[#C5A059]">{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED CATEGORIES */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-3 uppercase">
              Explore <span className="text-[#C5A059]">Expertise.</span>
            </h2>
            <p className="text-gray-500 text-sm font-medium">Find the best local talent across all major sectors.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                href={`/workers?category=${cat.name.toLowerCase()}`}
                className="card-luxury p-6 text-center group"
              >
                <div className="w-10 h-10 rounded-sm bg-white/3 flex items-center justify-center text-[#C5A059] mx-auto mb-4 transition-colors group-hover:bg-[#C5A059] group-hover:text-black">
                  {cat.icon}
                </div>
                <h3 className="text-white font-extrabold text-sm mb-1 uppercase tracking-tight">{cat.name}</h3>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. WHO WE ARE SECTION */}
      <section id="who-we-are" className="py-28 px-6 bg-[#050506] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-[#C5A059] font-mono text-[9px] font-bold uppercase tracking-widest">Our Identity</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] uppercase">
              A Digital <br />
              Marketplace for <br />
              <span className="text-[#C5A059]">Mzansi's Hustlers.</span>
            </h2>
            <div className="h-0.5 w-12 bg-[#C5A059]" />
            <p className="text-gray-500 text-base leading-relaxed font-medium max-w-lg">
              Phanda Links is more than a platform; it's a movement. We've built a premium digital space where South Africa's most talented workers can showcase their skills with professional dignity.
            </p>
            <Link 
              href="/who-we-are" 
              className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-widest text-[10px] font-mono group hover:text-[#C5A059] transition-colors duration-75"
            >
              Learn Our Story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="relative aspect-square rounded-sm overflow-hidden border border-white/10 group shadow-2xl">
            <Image 
              src="/images/download (2).jpg" 
              alt="Worker" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale contrast-125 transition-transform duration-75" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-28 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C5A059] font-mono text-[9px] font-bold uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">How It <span className="text-[#C5A059]">Works.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Create Profile", desc: "Build your professional digital identity in minutes. Showcase your skills, location, and personality." },
              { step: "02", title: "Get Found", desc: "Appear in searches by local clients looking for exactly what you offer. No more waiting for referrals." },
              { step: "03", title: "Get Hired", desc: "Receive bookings, chat securely, and get paid for your excellence. Grow your business on your terms." }
            ].map((item, i) => (
              <div 
                key={i}
                className="relative p-8 card-luxury group overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-[40px] font-mono font-bold text-white/5 group-hover:text-[#C5A059]/20 transition-colors duration-75">{item.step}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-extrabold text-white mb-4 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED WORKERS */}
      <section className="py-28 bg-black border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-3">
              <p className="text-[#C5A059] font-mono text-[9px] font-bold uppercase tracking-widest">The Elite</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase font-sans">Featured <span className="text-[#C5A059]">Talent.</span></h2>
            </div>
            <Link href="/workers" className="group flex items-center gap-2 text-white font-bold uppercase tracking-widest text-[10px] font-mono border-b border-[#C5A059] pb-1 hover:text-[#C5A059] transition-colors duration-75">
              View All Professionals
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorkers.length === 0 ? (
               [1,2,3].map(i => <div key={i} className="h-[400px] bg-white/5 rounded-sm animate-pulse" />)
            ) : (
              featuredWorkers.map((worker) => (
                <Link key={worker.id} href={`/workers/${worker.id}`}>
                  <div 
                    className="group relative h-[420px] rounded-sm overflow-hidden border border-white/10 transition-all duration-75 hover:border-[#C5A059] hover:shadow-[3px_3px_0px_0px_var(--gold)]"
                  >
                    <Image 
                      src={worker.avatar_url || "/images/default-avatar.svg"} 
                      alt={worker.full_name} 
                      fill 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover grayscale contrast-125 transition-transform duration-75" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="bg-[#C5A059] text-black px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider">Verified Elite</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#C5A059] fill-[#C5A059]" />
                          <span className="text-[#C5A059] font-mono text-xs font-bold">{worker.rating || "5.0"}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">{worker.full_name}</h3>
                        <p className="text-[#C5A059] text-[10px] font-mono uppercase tracking-wider">{worker.worker_profiles?.[0]?.skills?.slice(0, 2).join(" • ") || "Elite Professional"}</p>
                      </div>
                      <p className="text-gray-500 text-xs font-mono">{worker.location || "South Africa"}</p>
                      <div className="w-full py-3 bg-white/5 group-hover:bg-[#C5A059] group-hover:text-black rounded-sm text-[10px] font-extrabold uppercase tracking-widest border border-white/10 transition-all duration-75 flex items-center justify-center">
                        View Profile
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-28 relative overflow-hidden bg-black border-t border-white/10">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/Joburg_.jpg" 
            alt="Phanda Links Footer" 
            fill 
            sizes="100vw"
            className="object-cover opacity-10 grayscale" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.0] uppercase">
              Ready to <br />
              <span className="text-[#C5A059]">Empower</span> <br />
              The Hustle?
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
              Join the elite community where talent meets opportunity. Whether you're hiring or hustling, your future starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/signup?role=worker"
                className="btn-luxury btn-luxury-primary px-8 py-4 font-black text-xs uppercase tracking-widest"
              >
                Become a Worker
              </Link>
              <Link
                href="/workers"
                className="btn-luxury bg-transparent border border-white/10 hover:border-white text-white px-8 py-4 font-black text-xs uppercase tracking-widest"
              >
                Find a Worker
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}