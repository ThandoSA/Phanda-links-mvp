"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Shield, Book, UserCheck, Briefcase, CreditCard, XCircle, Star, Scale, Award, Heart, ScrollText, Lock } from "lucide-react"

export default function PoliciesPage() {
    const policies = [
        {
            id: "terms-of-service",
            title: "1. Terms of Service",
            icon: <ScrollText className="w-6 h-6" />,
            desc: "This policy outlines the rules for using Phanda Links.",
            sections: [
                "Users must be 18 years or older.",
                "All information provided must be accurate and truthful.",
                "Workers are independent service providers, not employees of Phanda Links.",
                "Phanda Links acts as a platform connecting clients and workers.",
                "Misuse of the platform may result in suspension or permanent bans."
            ]
        },
        {
            id: "privacy-policy",
            title: "2. Privacy Policy",
            icon: <Lock className="w-6 h-6" />,
            desc: "We are committed to protecting user data.",
            subsections: [
                {
                    subtitle: "What We Collect:",
                    items: ["Personal details (name, contact info, ID verification)", "Location data (for matching services)", "Payment information", "Usage data"]
                },
                {
                    subtitle: "How We Use It:",
                    items: ["To connect users with nearby services", "To improve app performance", "To ensure safety and verification", "To process payments"]
                },
                {
                    subtitle: "Commitment:",
                    items: ["We do not sell user data.", "All data is stored securely.", "Users can request access or deletion of their data."]
                }
            ]
        },
        {
            id: "user-conduct",
            title: "3. User Conduct Policy",
            icon: <UserCheck className="w-6 h-6" />,
            desc: "All users must behave respectfully and responsibly.",
            subsections: [
                {
                    subtitle: "Not Allowed:",
                    items: ["Fraud or fake profiles", "Harassment or abuse", "Unsafe or illegal activities", "Misrepresentation of skills or services"]
                },
                {
                    subtitle: "Violations may result in:",
                    items: ["Account suspension", "Permanent banning", "Legal action (if necessary)"]
                }
            ]
        },
        {
            id: "worker-policy",
            title: "4. Worker Policy",
            icon: <Briefcase className="w-6 h-6" />,
            desc: "This applies to all service providers on the platform.",
            subsections: [
                {
                    subtitle: "Requirements:",
                    items: ["Valid ID or verification documents", "Honest listing of skills and experience", "Professional conduct at all times"]
                },
                {
                    subtitle: "Expectations:",
                    items: ["Arrive on time", "Deliver agreed services", "Maintain communication with clients"]
                },
                {
                    subtitle: "Accountability:",
                    items: ["Poor ratings or misconduct may lead to removal from the platform."]
                }
            ]
        },
        {
            id: "client-policy",
            title: "5. Client Policy",
            icon: <UserCheck className="w-6 h-6" />,
            desc: "This applies to all customers using the platform.",
            subsections: [
                {
                    subtitle: "Responsibilities:",
                    items: ["Provide accurate job descriptions", "Ensure a safe working environment", "Pay for services as agreed"]
                },
                {
                    subtitle: "Not Allowed:",
                    items: ["Exploiting workers", "Unsafe or illegal requests", "Cancelling jobs unfairly"]
                }
            ]
        },
        {
            id: "payments-fees",
            title: "6. Payments & Fees Policy",
            icon: <CreditCard className="w-6 h-6" />,
            desc: "Guidelines regarding financial transactions.",
            subsections: [
                {
                    subtitle: "Payments:",
                    items: ["All payments should be made through the app.", "Secure payment gateways will be used."]
                },
                {
                    subtitle: "Fees:",
                    items: ["Phanda Links may charge a service fee or commission."]
                },
                {
                    subtitle: "Refunds:",
                    items: ["Service not delivered", "Major disputes", "Each case will be reviewed individually."]
                }
            ]
        },
        {
            id: "cancellation-policy",
            title: "7. Cancellation Policy",
            icon: <XCircle className="w-6 h-6" />,
            desc: "Rules for cancelling scheduled services.",
            subsections: [
                {
                    subtitle: "Clients:",
                    items: ["Must cancel within a specified time window.", "Late cancellations may incur a fee."]
                },
                {
                    subtitle: "Workers:",
                    items: ["Repeated cancellations may affect ratings and visibility."]
                }
            ]
        },
        {
            id: "ratings-reviews",
            title: "8. Ratings & Reviews Policy",
            icon: <Star className="w-6 h-6" />,
            desc: "Ensuring honest and fair feedback.",
            sections: [
                "Clients can rate workers after each job.",
                "Workers may also rate clients.",
                "Reviews must be honest and respectful.",
                "Fake or abusive reviews will be removed."
            ]
        },
        {
            id: "safety-trust",
            title: "9. Safety & Trust Policy",
            icon: <Shield className="w-6 h-6" />,
            desc: "Phanda Links prioritizes safety.",
            subsections: [
                {
                    subtitle: "Measures:",
                    items: ["Identity verification", "Rating system", "Report & support system"]
                },
                {
                    subtitle: "Disclaimer:",
                    items: ["While we aim to create a safe platform, users must exercise personal judgment and caution."]
                }
            ]
        },
        {
            id: "dispute-resolution",
            title: "10. Dispute Resolution Policy",
            icon: <Scale className="w-6 h-6" />,
            desc: "How we handle issues that arise.",
            subsections: [
                {
                    subtitle: "Process:",
                    items: ["Users report through the app", "Phanda Links reviews the case", "A fair resolution is provided"]
                },
                {
                    subtitle: "Possible outcomes:",
                    items: ["Refunds", "Account warnings", "Suspensions"]
                }
            ]
        },
        {
            id: "credits-rewards",
            title: "11. Credits & Rewards Policy",
            icon: <Award className="w-6 h-6" />,
            desc: "Worker incentives and benefits.",
            subsections: [
                {
                    subtitle: "Workers earn credits based on:",
                    items: ["Completed jobs", "Good ratings", "Consistency"]
                },
                {
                    subtitle: "Credits can be used for:",
                    items: ["Profile boosts", "Training opportunities", "Platform benefits"]
                }
            ]
        },
        {
            id: "community-impact",
            title: "12. Community Impact Policy",
            icon: <Heart className="w-6 h-6" />,
            desc: "Our commitment to South Africa.",
            sections: [
                "Supporting local economies",
                "Promoting fair work practices",
                "Encouraging youth employment",
                "Creating sustainable opportunities"
            ]
        }
    ]

    return (
        <main className="bg-black min-h-screen selection:bg-gold selection:text-black">
            <Navbar />
            
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4">Official Documentation</p>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
                            Our <span className="text-gold italic">Policies.</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
                            The foundation of trust and professional excellence within the Phanda Links marketplace.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1 space-y-2 sticky top-32 h-fit hidden lg:block">
                            {policies.map(p => (
                                <a 
                                    key={p.id} 
                                    href={`#${p.id}`}
                                    className="block px-4 py-3 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gold transition-all border border-transparent hover:border-white/5"
                                >
                                    {p.title}
                                </a>
                            ))}
                        </div>

                        {/* Policies Content */}
                        <div className="lg:col-span-3 space-y-24">
                            {policies.map((p, idx) => (
                                <motion.section 
                                    key={p.id} 
                                    id={p.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className="scroll-mt-32"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold shadow-xl">
                                            {p.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tight">{p.title}</h2>
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">{p.desc}</p>
                                        </div>
                                    </div>

                                    <div className="card-luxury p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
                                        
                                        {p.sections && (
                                            <ul className="space-y-4">
                                                {p.sections.map((s, i) => (
                                                    <li key={i} className="flex gap-4 text-gray-400 leading-relaxed font-medium">
                                                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {p.subsections && (
                                            <div className="space-y-10">
                                                {p.subsections.map((sub, i) => (
                                                    <div key={i} className="space-y-4">
                                                        <h3 className="text-gold font-black uppercase tracking-widest text-[11px] border-l-2 border-gold/30 pl-4">{sub.subtitle}</h3>
                                                        <ul className="space-y-3">
                                                            {sub.items.map((item, j) => (
                                                                <li key={j} className="flex gap-4 text-gray-400 leading-relaxed font-medium pl-4">
                                                                    <span className="w-1 h-1 bg-white/20 rounded-full mt-2.5 flex-shrink-0" />
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
