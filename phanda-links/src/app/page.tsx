"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

/* ── NAVBAR ── */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg"
          : "bg-transparent"
        }`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">

          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/logo-icon.jpeg"
              alt="Phanda Links"
              width={36}
              height={36}
              style={{ width: "auto", height: "auto" }}
              className="group-hover:scale-105 transition-transform rounded-md"
            />
            <span className="font-bold text-xl tracking-wide text-white">
              Phanda <span className="text-gold">Links</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/workers" className="hover:text-white hover:text-gold transition-colors">Find Workers</Link>
            <Link href="/signup" className="hover:text-white hover:text-gold transition-colors">Find Work</Link>
            <Link href="/about" className="hover:text-white hover:text-gold transition-colors">About</Link>
          </div>

          <Link href="/login" className="hidden md:block bg-gold text-black px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            Sign In
          </Link>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(true)} className="md:hidden text-2xl text-white">
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 animate-fade-in-up">
          <div className="absolute right-0 top-0 w-3/4 max-w-sm h-full glass-luxury p-8 flex flex-col">
            <button onClick={() => setMenuOpen(false)} className="self-end text-3xl text-gray-400 hover:text-white mb-10">✕</button>

            <div className="flex flex-col gap-6 text-xl text-white">
              <Link href="/workers" onClick={() => setMenuOpen(false)} className="hover:text-gold transition">Find Workers</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="hover:text-gold transition">Find Work</Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-gold transition">About</Link>

              <div className="h-px w-full bg-white/10 my-4" />

              <Link href="/login" onClick={() => setMenuOpen(false)} className="bg-gold text-black px-6 py-3 rounded-full text-center font-bold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-10 px-6 border-t border-white/10 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/images/logo-icon.jpeg"
              alt="Phanda Links"
              width={32}
              height={32}
              style={{ width: "auto", height: "auto" }}
              className="rounded-md"
            />
            <h2 className="font-bold text-xl tracking-wide">Phanda <span className="text-gold">Links</span></h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Connecting premium hustle to real opportunity across Johannesburg and beyond.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Platform</h3>
          <ul className="text-gray-400 text-sm space-y-3">
            <li><Link href="/workers" className="hover:text-gold transition">Browse Elite Workers</Link></li>
            <li><Link href="/signup" className="hover:text-gold transition">Join as a Hustler</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Get Started</h3>
          <Link href="/signup" className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-full text-sm hover:bg-gold hover:text-black transition-all">
            Create an Account
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 relative z-10">
        <p>© {new Date().getFullYear()} Phanda Links. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="#" className="hover:text-gray-300">Privacy</Link>
          <Link href="#" className="hover:text-gray-300">Terms</Link>
        </div>
      </div>
    </footer>
  )
}

/* ── WORKERS (TEMP DATA) ── */
const workers = [
  { name: "Thabo Molefe", location: "Soweto, JHB", skills: ["Plumbing", "Maintenance"], image: "/images/House Repairs.jpg" },
  { name: "Nomsa Zulu", location: "Alexandra, JHB", skills: ["Deep Cleaning", "Sanitation"], image: "/images/Fotos de Manutençao - Baixe fotos grátis de alta qualidade _ Freepik.jpg" },
  { name: "Kagiso Dlamini", location: "Randburg, JHB", skills: ["Auto Repair", "Clutch Services"], image: "/images/Clutch Repair Services in NSW.jpg" },
]

/* ── PAGE ── */
export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const heroImages = [
    "/images/Joburg_.jpg",
    "/images/download (2).jpg",
    "/images/download (3).jpg"
  ]

  // Image rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000) // 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Simple scroll reveal
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal")
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up")
          entry.target.classList.remove("opacity-0")
        }
      })
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" })

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-black text-white min-h-screen selection:bg-gold selection:text-black">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 animate-luxury-bg opacity-80" />

        {/* Hero Image Overlay with crossfade */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark overlay for text readability */}
          {heroImages.map((src, idx) => (
            <Image 
              key={src}
              src={src} 
              alt="Background scene" 
              fill 
              className={`object-cover mix-blend-luminosity transition-opacity duration-1000 ease-in-out ${
                idx === currentImageIndex ? "opacity-50" : "opacity-0"
              }`}
              sizes="100vw"
              priority={idx === 0}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center reveal opacity-0">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-md text-gold text-sm font-medium tracking-wide animate-fade-in-down">
            Welcome to the new standard of work
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Opportunity isn't given — <br />
            <span className="text-gradient-gold text-shimmer">it's Phanda'd.</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Connecting elite, hardworking individuals to premium opportunities across Johannesburg. Experience seamless hiring and trustworthy service.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/signup" className="w-full sm:w-auto bg-gold text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)] btn-luxury">
              Find Work
            </Link>
            <Link href="/workers" className="w-full sm:w-auto glass-panel text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all btn-luxury">
              Hire Elite Talent
            </Link>
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-32 px-6 relative bg-black">
        <div className="max-w-4xl mx-auto text-center reveal opacity-0">
          <Image 
            src="/images/logo-icon.jpeg" 
            alt="Icon" 
            width={48} 
            height={48} 
            style={{ width: "auto", height: "auto" }}
            className="mx-auto mb-8 rounded-lg animate-bounce-gentle hover-scale"
          />
          <h2 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in-up">Built for the <span className="font-serif italic text-gold text-shimmer">Hustle</span></h2>
          <p className="text-xl text-gray-400 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Every day, thousands of skilled professionals are ready to work, but lack the premium platform to showcase their true value. <strong className="text-white">Phanda Links</strong> bridges that gap, elevating everyday services into a luxury experience.
          </p>
        </div>
      </section>

      {/* FEATURED WORKERS */}
      <section className="py-32 px-6 relative bg-[#050505] border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal opacity-0">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in-down">Featured Excellence</h2>
            <p className="text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Discover top-rated professionals in your area.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {workers.map((w, idx) => (
              <div 
                key={w.name} 
                className="glass-panel rounded-2xl overflow-hidden glass-hover reveal opacity-0 hover-lift"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Worker Image */}
                <div className="relative h-56 w-full">
                  <Image 
                    src={w.image} 
                    alt={w.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{w.name}</h3>
                    <p className="text-sm text-gold">{w.location}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {w.skills.map((s) => (
                      <span key={s} className="bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-gray-300 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>

                  <Link href="/workers" className="block w-full border border-gold/50 text-gold text-center py-3 rounded-xl font-semibold hover:bg-gold hover:text-black transition-colors">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16 reveal opacity-0 animate-fade-in-up">
             <Link href="/workers" className="inline-flex items-center gap-2 text-white hover:text-gold transition-colors font-medium border-b border-transparent hover:border-gold pb-1 hover-scale">
               Explore all professionals <span className="animate-bounce-gentle">→</span>
             </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}