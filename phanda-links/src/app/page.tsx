"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Search, Star, MapPin, Briefcase, ChevronRight } from "lucide-react"

const heroImages = [
  "/images/Joburg_.jpg",
  "/images/download (2).jpg",
  "/images/download (3).jpg"
]

export default function Home() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [featuredWorkers, setFeaturedWorkers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

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
            is_verified: wp?.verified || false,
            skills: wp?.skills || []
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
    <main className="bg-white text-black selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
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
          {/* Glass Overlay to make text readable and blend with white theme */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 text-center px-6 max-w-5xl pt-32"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.0] tracking-tighter mb-6 text-black drop-shadow-sm">
            The Hustle <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#B8860B]">Deserves</span> <br />
            Visibility.
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-gray-800 mb-10 max-w-2xl mx-auto drop-shadow-sm">
            Connecting skilled South Africans with real opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <Link href="/signup" className="btn-luxury btn-luxury-primary w-full px-8 py-4 text-sm whitespace-nowrap shadow-lg">
              Get Started
            </Link>
            <Link href="/login" className="btn-luxury btn-luxury-outline bg-white/70 backdrop-blur-md w-full px-8 py-4 text-sm whitespace-nowrap shadow-sm hover:bg-white">
              Login
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. WHO WE ARE SECTION */}
      <section className="py-32 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-8">
              <span className="status-badge status-pending">Who We Are</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
                A Marketplace Designed for <br/>
                <span className="text-[#D4AF37]">Excellence.</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                Phanda Links is a premium marketplace built to help workers showcase their skills professionally while giving clients access to trusted, local talent. We are redefining how South Africa connects.
              </p>
              <Link href="/who-we-are" className="inline-flex items-center gap-2 font-bold text-black hover:text-[#D4AF37] transition-colors group">
                Discover Our Story 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/download (2).jpg"
                alt="Professional Worker"
                fill
                className="object-cover img-premium"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. WHY WE CREATED PHANDA LINKS */}
      <section id="why-we-created" className="py-32 px-6 bg-[#F9FAFB] relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="status-badge status-accepted mb-6">Our Mission</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Bridging the Gap to <span className="text-[#D4AF37]">Opportunity.</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "The Invisible Talent",
                desc: "Many brilliant workers rely entirely on word of mouth. Their skills remain hidden from those who need them most."
              },
              {
                title: "Access is Limited",
                desc: "Finding trustworthy, local talent is often difficult. Clients struggle to discover vetted professionals outside their immediate circle."
              },
              {
                title: "The Phanda Solution",
                desc: "We provide the digital infrastructure for visibility, trust, and economic empowerment. A stage for South African excellence."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="glass-card p-10"
              >
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-lg mb-6">
                  {i + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BUILT FOR SOUTH AFRICA */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden py-32 px-8 shadow-2xl"
          >
            <div className="absolute inset-0 z-0">
              <Image src="/images/Joburg_.jpg" alt="South Africa" fill className="object-cover img-premium" />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white">
                Built for <span className="text-[#D4AF37]">South Africa.</span>
              </h2>
              <p className="text-lg text-gray-200 font-medium leading-relaxed">
                Celebrating tradespeople, domestic workers, artisans, freelancers, township entrepreneurs, creatives, and service providers. Your hustle builds our nation.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-32 px-6 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Your Journey to <span className="text-[#D4AF37]">Success.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: "Create Your Profile",
                desc: "Build a premium digital identity. Showcase your skills, experience, and availability to the world."
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: "Get Discovered",
                desc: "Clients search for exactly what you offer. Stand out with our elegant marketplace design."
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Get Hired",
                desc: "Receive booking requests, communicate securely, and build your reputation with verified reviews."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card p-10 text-center group"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED WORKERS */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <span className="status-badge status-in_progress">The Elite</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Featured <span className="text-[#D4AF37]">Talent.</span></h2>
            </div>
            <Link href="/workers" className="inline-flex items-center gap-2 font-bold text-black hover:text-[#D4AF37] transition-colors group pb-2">
              Browse Directory 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWorkers.length === 0 ? (
              // Beautiful Empty State / Loading
              [1, 2, 3].map(i => (
                <div key={i} className="h-[450px] skeleton rounded-3xl" />
              ))
            ) : (
              featuredWorkers.map((worker, i) => (
                <motion.div
                  key={worker.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={`/workers/${worker.id}`} className="block h-full">
                    <div className="glass-card h-full p-6 flex flex-col group">
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-6">
                        <Image
                          src={worker.avatar_url || "/images/default-avatar.svg"}
                          alt={worker.full_name}
                          fill
                          className="object-cover img-premium"
                        />
                        {worker.is_verified && (
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#D4AF37] p-2 rounded-full shadow-lg">
                            <Star className="w-4 h-4 fill-[#D4AF37]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-black mb-1 truncate">{worker.full_name}</h3>
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{worker.location || "South Africa"}</span>
                          </div>
                          
                          {worker.skills && worker.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {worker.skills.slice(0, 2).map((skill: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">
                                  {skill}
                                </span>
                              ))}
                              {worker.skills.length > 2 && (
                                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">
                                  +{worker.skills.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                            <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "New"}</span>
                          </div>
                          <span className="text-[#D4AF37] font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                            View Profile <ChevronRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-32 px-6 bg-[#D4AF37] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-sm">
              Ready to Empower <br /> The Hustle?
            </h2>
            <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
              Join the elite community where talent meets opportunity. Whether you're hiring or hustling, your future starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup?role=worker" className="btn-luxury bg-black text-white hover:bg-gray-900 px-10 py-5 text-sm font-bold shadow-xl">
                Become a Worker
              </Link>
              <Link href="/workers" className="btn-luxury bg-white text-black hover:bg-gray-50 px-10 py-5 text-sm font-bold shadow-xl">
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