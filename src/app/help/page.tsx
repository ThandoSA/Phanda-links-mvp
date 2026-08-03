"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { Search, ChevronDown, HelpCircle, Briefcase, ShieldCheck, UserCheck, MessageSquare, ArrowRight } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
  category: "general" | "clients" | "workers" | "payments"
}

const FAQS: FAQItem[] = [
  {
    category: "general",
    question: "What is Phanda Links?",
    answer: "Phanda Links is a South African marketplace connecting clients who need quality services with skilled, vetted tradespeople and independent workers. We provide visibility, trust, and direct connections."
  },
  {
    category: "clients",
    question: "How do I post a job and hire a worker?",
    answer: "Log into your client dashboard, click 'Post New Job', fill out your project requirements and estimated budget, and submit. Vetted workers in your area can browse your posting and submit quotes directly."
  },
  {
    category: "clients",
    question: "How do I choose the right worker?",
    answer: "You can review worker profiles, view their verified badges, ratings, completed job counts, trade skills, and candidate proposals before accepting a quote."
  },
  {
    category: "workers",
    question: "How do I register as a worker on Phanda Links?",
    answer: "Sign up, choose 'Worker' during account setup, complete your trade profile with your skills, location, and bio, and start browsing open opportunities on the marketplace."
  },
  {
    category: "workers",
    question: "How do I submit a quote for a job?",
    answer: "Navigate to 'Browse Jobs' on your worker dashboard, select an open opportunity that matches your skills, and click 'Submit Proposal' to state your price and message to the client."
  },
  {
    category: "payments",
    question: "What should I do if a dispute arises?",
    answer: "Phanda Links prioritizes trust and safety. Contact our support team directly via email at phandalinks@gmail.com or call our hotline for assistance in resolving disputes."
  }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory
    const matchesSearch = !searchTerm || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="bg-white min-h-screen flex flex-col justify-between">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">Support Center</p>
          <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter mb-6">
            How Can We <span className="text-[#D4AF37]">Help You?</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg font-medium leading-relaxed mb-8">
            Find answers to common questions about posting jobs, offering quotes, worker verification, and account safety.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers (e.g. quotes, verification, hiring)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 text-sm font-medium text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: "all", label: "All Questions" },
            { id: "general", label: "General" },
            { id: "clients", label: "For Clients" },
            { id: "workers", label: "For Workers" },
            { id: "payments", label: "Safety & Disputes" },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeCategory === cat.id
                  ? "bg-black text-white"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-black"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-4 mb-20">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-medium">
              No matching questions found. Try a different search term or contact our team directly.
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className="glass-card bg-gray-50/80 border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 font-bold text-black text-lg hover:text-[#D4AF37] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-[#D4AF37]" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100 mt-2">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Still need help callout */}
        <div className="max-w-4xl mx-auto glass-card bg-black text-white p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-black tracking-tight mb-1">Still Have Questions?</h3>
            <p className="text-gray-400 text-sm font-medium">Our South African support team is ready to assist you directly.</p>
          </div>
          <Link href="/contact" className="btn-luxury btn-luxury-primary px-8 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
