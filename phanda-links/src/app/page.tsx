"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

const heroImages = [
  "/images/Joburg_.jpg",
  "/images/download (2).jpg",
  "/images/download (3).jpg"
]

export default function Home() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* Background Images */}
        <div className="absolute inset-0">
          {heroImages.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt="hero"
              fill
              priority={i === 0}
              className={`object-cover transition-all duration-[3000ms] ease-in-out ${i === index
                ? "opacity-40 scale-105"
                : "opacity-0 scale-100"
                }`}
            />
          ))}

          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 animate-fadeUp">
            Built for the <span className="text-[#D4AF37] italic">Hustle</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 animate-fadeUp delay-200">
            Connecting skilled people to real opportunities across South Africa.
          </p>

          <div className="flex gap-4 justify-center animate-fadeUp delay-300">
            <Link
              href="/signup"
              className="bg-[#D4AF37] text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition"
            >
              Find Work
            </Link>

            <Link
              href="/workers"
              className="border border-white/20 px-8 py-4 rounded-full hover:bg-white/10 transition"
            >
              Hire Talent
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: VALUE */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">

          {[
            {
              title: "Trusted Workers",
              desc: "Profiles built around real skills and verified identity."
            },
            {
              title: "Direct Hiring",
              desc: "No middleman. Connect instantly and get the job done."
            },
            {
              title: "Built for Mzansi",
              desc: "Designed around how people actually find work locally."
            }
          ].map((item, i) => (
            <div
              key={i}
              className="opacity-0 animate-fadeUp"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <h3 className="text-xl font-semibold mb-3 text-white">
                {item.title}
              </h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: STORY */}
      <section className="py-32 px-6 text-center border-t border-white/10 border-b border-white/10">
        <div className="max-w-3xl mx-auto opacity-0 animate-fadeUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What does <span className="text-[#D4AF37]">Phanda</span> mean?
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            It means hustle. It means showing up. It means doing whatever it takes
            to make something happen.
            <br /><br />
            Phanda Links exists to give that hustle visibility.
          </p>
        </div>
      </section>

      {/* SECTION: WORKERS */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Featured Workers</h2>

          <Link href="/workers" className="text-[#D4AF37] text-sm">
            View all →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition duration-300 opacity-0 animate-fadeUp"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="h-56 bg-gray-800" />

              <div className="p-6">
                <h3 className="font-semibold text-lg mb-1">
                  Worker Name
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Johannesburg
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-white/10 px-3 py-1 text-xs rounded">
                    Skill
                  </span>
                </div>

                <button className="w-full bg-[#D4AF37] text-black py-2 rounded-lg text-sm font-medium">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center bg-[#D4AF37] text-black">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Start your journey today
        </h2>

        <Link
          href="/signup"
          className="bg-black text-white px-10 py-4 rounded-full hover:scale-105 transition"
        >
          Join Phanda Links
        </Link>
      </section>
    </main>
  )
}