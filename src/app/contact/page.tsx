"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import toast from "react-hot-toast"
import { Mail, Phone, MapPin, Send, ShieldCheck, Clock } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields")
      return
    }
    setSending(true)
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent. We'll get back to you shortly.")
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" })
      setSending(false)
    }, 1000)
  }

  return (
    <main className="bg-white min-h-screen flex flex-col justify-between">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter mb-6">
            We&apos;re Here to <span className="text-[#D4AF37]">Support You</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg font-medium leading-relaxed">
            Have questions about Phanda Links, need assistance with a job booking, or want to partner with us? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-8 bg-gray-50 border border-gray-100 rounded-3xl space-y-6">
              <h3 className="text-xl font-black text-black tracking-tight">Direct Contact Info</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Us</p>
                    <p className="text-black font-bold text-base mt-0.5">phandalinks@gmail.com</p>
                    <p className="text-xs text-gray-500 mt-1">24/7 inbox monitoring for support</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Call or WhatsApp</p>
                    <p className="text-black font-bold text-base mt-0.5">+27 83 207 3857</p>
                    <p className="text-black font-bold text-base">+27 61 154 0898</p>
                    <p className="text-xs text-gray-500 mt-1">Mon – Fri, 08:00 – 17:00 SAST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Headquarters</p>
                    <p className="text-black font-bold text-base mt-0.5">
                      13 Viljoen St, Lorentzville,<br />Johannesburg, 2094
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-black text-white rounded-3xl flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-[#D4AF37] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Dispute & Trust Assurance</h4>
                <p className="text-xs text-gray-400 mt-0.5">Every booking on Phanda Links is backed by our trust standards.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 bg-white border border-gray-100 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-2xl font-black text-black tracking-tight mb-2">Send a Message</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Ndlovu"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Topic / Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] text-sm font-bold transition-all"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Booking Assistance">Booking Assistance</option>
                  <option value="Worker Verification">Worker Verification / Registration</option>
                  <option value="Dispute Resolution">Dispute Resolution</option>
                  <option value="Partnerships">Partnerships & Press</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">How can we help? *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide details about your query..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] text-sm font-medium transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-luxury btn-luxury-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
