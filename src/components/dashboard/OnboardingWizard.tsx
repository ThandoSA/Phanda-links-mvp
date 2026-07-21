"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { CheckCircle2, Hammer, Search, ArrowRight, X } from "lucide-react";

interface Props {
  role: string;
  userId: string;
}

const COMMON_SKILLS = [
  "Plumbing", "Electrical", "Carpentry", "Cleaning", 
  "Painting", "Handyman", "Gardening", "Moving"
];

export default function OnboardingWizard({ role, userId }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Worker specific state
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (role === "client") {
          const isDone = localStorage.getItem(`client_onboarded_${userId}`);
          if (!isDone) {
            setShow(true);
          }
        } else if (role === "worker") {
          const skipped = localStorage.getItem(`worker_skipped_${userId}`);
          if (skipped) {
            setLoading(false);
            return;
          }
          const { data, error } = await supabase
            .from("worker_profiles")
            .select("skills, bio")
            .eq("user_id", userId)
            .limit(1);

          if (!error && data && data.length > 0) {
            const profile = data[0];
            // If they have no skills array or it's empty, show wizard
            if (!profile.skills || profile.skills.length === 0) {
              setShow(true);
            }
          } else {
             // No row exists yet (or error), show wizard
             setShow(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [role, userId]);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      if (skills.length >= 5) {
        toast.error("You can select a maximum of 5 skills.");
        return;
      }
      setSkills([...skills, skill]);
    }
  };

  const completeClientOnboarding = () => {
    localStorage.setItem(`client_onboarded_${userId}`, "true");
    setShow(false);
  };

  const saveWorkerProfile = async () => {
    if (skills.length === 0) {
      toast.error("Please select at least one skill.");
      return;
    }
    if (!bio.trim()) {
      toast.error("Please write a short bio.");
      return;
    }

    setSaving(true);
    try {
      // Check if profile exists
      const { data: existing } = await supabase
        .from("worker_profiles")
        .select("user_id")
        .eq("user_id", userId)
        .limit(1);

      let error;
      if (existing && existing.length > 0) {
        const { error: updateError } = await supabase
          .from("worker_profiles")
          .update({ skills, bio })
          .eq("user_id", userId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("worker_profiles")
          .insert({ user_id: userId, skills, bio });
        error = insertError;
      }

      if (error) throw error;
      
      toast.success("Profile setup complete!");
      setShow(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-card bg-white w-full max-w-lg relative z-10 overflow-hidden shadow-2xl rounded-3xl"
        >
          {/* Close Button */}
          <button 
            onClick={() => {
              if (role === "worker") localStorage.setItem(`worker_skipped_${userId}`, "true");
              else localStorage.setItem(`client_onboarded_${userId}`, "true");
              setShow(false);
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Client Welcome Flow */}
          {role === "client" && (
            <div className="p-8 md:p-10 text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-4 text-black">Welcome to Phanda Links</h2>
              <p className="text-gray-500 font-medium mb-8">
                You're all set to find South Africa's best talent. Browse worker profiles, post jobs, and build your trusted network.
              </p>
              
              <div className="space-y-4 mb-8 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <p className="text-sm text-gray-700 font-bold">Verified workers</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <p className="text-sm text-gray-700 font-bold">Secure payments & reviews</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <p className="text-sm text-gray-700 font-bold">Direct messaging</p>
                </div>
              </div>

              <button 
                onClick={completeClientOnboarding}
                className="btn-luxury btn-luxury-primary w-full py-4 text-sm flex items-center justify-center gap-2"
              >
                Start Hiring <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Worker Setup Flow */}
          {role === "worker" && (
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-black">
                    {step === 1 ? "Select Your Skills" : "Write Your Bio"}
                  </h2>
                  <p className="text-sm text-gray-500 font-bold mt-1">Step {step} of 2</p>
                </div>
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                  <Hammer className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>

              {step === 1 ? (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <p className="text-gray-600 text-sm mb-6">
                    What are you best at? Select up to 5 skills to show clients what you can do.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {COMMON_SKILLS.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                          skills.includes(skill)
                            ? "bg-black text-white border-black shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      if (skills.length === 0) toast.error("Select at least one skill to continue.");
                      else setStep(2);
                    }}
                    className="btn-luxury btn-luxury-primary w-full py-4 text-sm flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <p className="text-gray-600 text-sm mb-6">
                    Write a short, professional bio. Tell clients about your experience, your work ethic, and why they should hire you.
                  </p>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. I am a licensed plumber with 5 years of experience handling residential and commercial repairs. I take pride in arriving on time and leaving the site clean."
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] resize-none text-sm text-black mb-8 transition-all"
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-full font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={saveWorkerProfile}
                      disabled={saving}
                      className="btn-luxury btn-luxury-primary flex-1 py-4 text-sm flex items-center justify-center gap-2"
                    >
                      {saving ? "Saving..." : "Complete Profile"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
