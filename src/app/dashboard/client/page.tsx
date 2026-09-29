"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users, Clock, Star, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import QuoteReviewModal from "@/components/dashboard/client/QuoteReviewModal";

interface PostedJob {
  id: string;
  title: string;
  status: string;
  price?: number;
  applicants_count?: number;
  created_at?: string;
}

interface Profile {
  full_name: string;
  avatar_url?: string;
}

function getGreeting(firstName: string): { greeting: string; tagline: string } {
  const hour = new Date().getHours();
  const name = firstName || "Boss";

  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Good morning, ${name}.`,
      tagline: "Ready to find the right people for your work?",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: `Good afternoon, ${name}.`,
      tagline: "Check in on your active jobs or post a new one.",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: `Good evening, ${name}.`,
      tagline: "Review proposals from workers before tomorrow.",
    };
  } else {
    return {
      greeting: `Welcome back, ${name}.`,
      tagline: "Planning ahead? Post a job for tomorrow morning.",
    };
  }
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteModal, setQuoteModal] = useState<{ jobId: string; jobTitle: string } | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, status, price, created_at, location")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (jobsError) {
        console.error("Client dashboard jobs fetch error:", jobsError);
        toast.error("Could not load your posted jobs. Refresh to try again.");
      }

      const formattedJobs = (jobsData || []).map((job: any) => ({
        ...job,
        applicants_count: 0,
      }));

      const jobIds = formattedJobs.map((job) => job.id);
      if (jobIds.length > 0) {
        const { data: quotesData, error: quotesError } = await supabase
          .from("quotes")
          .select("job_id")
          .in("job_id", jobIds);

        if (quotesError) {
          console.error("Client dashboard quotes fetch error:", quotesError);
          toast.error("Could not load proposal counts.");
        } else {
          const counts = new Map<string, number>();
          (quotesData || []).forEach(({ job_id }) => counts.set(job_id, (counts.get(job_id) || 0) + 1));
          formattedJobs.forEach((job) => {
            job.applicants_count = counts.get(job.id) || 0;
          });
        }
      }

      setPostedJobs(formattedJobs);
      setLoading(false);
    };

    fetchClientData();

    const channel = supabase
      .channel("client-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, fetchClientData)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "quotes" }, fetchClientData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "";
  const { greeting, tagline } = getGreeting(firstName);

  const activeJobsCount = postedJobs.filter(j => j.status === "open" || j.status === "pending").length;
  const activityProgress = postedJobs.length > 0 ? Math.round((activeJobsCount / postedJobs.length) * 100) : 0;

  return (
    <div className="font-sans max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10 text-white">

      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 card-luxury p-8 rounded-2xl bg-[#111316] border border-white/10"
      >
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl flex-shrink-0">
            <Image
              src={profile?.avatar_url || "/images/default-avatar.svg"}
              alt={profile?.full_name || "Client"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white leading-tight">
              {loading ? "Loading..." : greeting}
            </h1>
            <p className="text-gray-400 font-medium mt-1 tracking-tight">{loading ? "" : tagline}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-right md:text-left md:self-start min-w-56">
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] font-black">Your activity</p>
          <div className="h-3 rounded-full bg-black/20 overflow-hidden border border-white/10 w-full">
            <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${activityProgress}%` }} />
          </div>
          <p className="text-xs text-gray-300">{activeJobsCount} active {activeJobsCount === 1 ? "job" : "jobs"} of {postedJobs.length} posted</p>
        </div>
      </motion.div>

      <div className="card-luxury p-6 rounded-2xl border border-[#D4AF37]/20 bg-[#111316]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] font-black mb-2">Keep your work moving</p>
            <h2 className="text-2xl font-black text-white">Find the right person for the job</h2>
            <p className="text-gray-400 mt-2 text-sm font-medium">Browse trusted workers or post a new request and start receiving proposals.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard/client/post-job" className="btn-luxury btn-luxury-primary px-6 py-3 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Post New Job
            </Link>
            <Link href="/dashboard/client/workers" className="btn-luxury btn-luxury-outline px-6 py-3 text-sm text-white">
              Browse Workers
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-5"
      >
        {[
          { label: "Jobs Posted", value: postedJobs.length, icon: <Briefcase className="w-7 h-7" /> },
          { label: "Active Jobs", value: activeJobsCount, icon: <Clock className="w-7 h-7" /> },
          { label: "Proposals Received", value: postedJobs.reduce((a, j) => a + (j.applicants_count || 0), 0), icon: <Users className="w-7 h-7" /> },
          { label: "Avg Rating", value: "4.9", icon: <Star className="w-7 h-7" /> },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="card-luxury p-7 rounded-2xl hover:scale-[1.02] transition-transform bg-[#111823] border border-white/10">
            <div className="text-[#D4AF37] mb-4">{stat.icon}</div>
            <div className="text-4xl font-black tracking-tighter text-white">{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1.5 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Posted Jobs ── */}
      <div className="card-luxury p-8 rounded-2xl bg-[#0d1120] border border-white/10">
        <div className="flex justify-between items-center mb-7">
          <h3 className="text-xl font-black text-white">Your Posted Jobs</h3>
          <Link href="/dashboard/client/bookings" className="text-[#D4AF37] hover:underline text-sm font-bold">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : postedJobs.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
            {postedJobs.map((job) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 last:border-none gap-3"
              >
                <div className="flex-1">
                  <p className="font-black text-white text-base leading-tight">{job.title}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Posted {new Date(job.created_at || "").toLocaleDateString("en-ZA")}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${
                    job.status === "open" ? "bg-emerald-900/50 text-emerald-200"
                    : job.status === "completed" ? "bg-gray-800 text-gray-200"
                    : "bg-amber-900/50 text-amber-200"
                  }`}>
                    {job.status}
                  </span>

                  {job.price && (
                    <div className="text-right">
                      <p className="font-black text-white text-sm">R{job.price}</p>
                      <p className="text-xs text-gray-400">Budget</p>
                    </div>
                  )}

                  <div className="text-right">
                    <p className="font-black text-white text-sm">{job.applicants_count || 0}</p>
                    <p className="text-xs text-gray-400">Applicants</p>
                  </div>

                  {(job.status === "open" || job.status === "pending") && (
                    <button
                      onClick={() => setQuoteModal({ jobId: job.id, jobTitle: job.title })}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#D4AF37] hover:bg-[#b8962e] text-black text-xs font-black rounded-full transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Quotes
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium mb-6">You haven&apos;t posted any jobs yet.</p>
            <Link href="/dashboard/client/post-job" className="btn-luxury btn-luxury-primary">
              Post Your First Job
            </Link>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid lg:grid-cols-5 gap-8"
      >
        <motion.div variants={itemVariants} className="lg:col-span-3 card-luxury p-8 rounded-2xl bg-[#111316] border border-white/10">
          <div className="flex justify-between items-center mb-7">
            <h3 className="text-xl font-black text-white">Next steps</h3>
            <Link href="/dashboard/client/profile" className="text-[#D4AF37] hover:underline text-sm font-bold">View Profile</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/dashboard/client/workers" className="border border-white/10 rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-colors group">
              <Users className="w-7 h-7 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-white mb-1">Browse Workers</h4>
              <p className="text-gray-400 text-sm">Find verified professionals for your next project.</p>
            </Link>
            <Link href="/dashboard/client/bookings" className="border border-white/10 rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-colors group">
              <Briefcase className="w-7 h-7 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-white mb-1">Job History</h4>
              <p className="text-gray-400 text-sm">View completed and past jobs.</p>
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 card-luxury p-8 rounded-2xl bg-[#111316] border border-white/10">
          <h3 className="text-xl font-black text-white mb-6">Account Snapshot</h3>
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Profile</p>
              <p className="text-gray-300 text-sm">{profile?.full_name ? `Signed in as ${profile.full_name}.` : "Complete your profile to build trust with workers."}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Quick links</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/client/saved" className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1.5 rounded-full font-bold">Saved Workers</Link>
                <Link href="/dashboard/messages" className="text-xs bg-white/5 text-gray-300 border border-white/10 px-3 py-1.5 rounded-full font-bold">Messages</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quote Review Modal */}
      {quoteModal && (
        <QuoteReviewModal
          jobId={quoteModal.jobId}
          jobTitle={quoteModal.jobTitle}
          onClose={() => setQuoteModal(null)}
          onAccepted={() => {
            setQuoteModal(null);
            // refresh jobs list
            setPostedJobs(prev =>
              prev.map(j => j.id === quoteModal.jobId ? { ...j, status: "accepted" } : j)
            );
          }}
        />
      )}
    </div>
  );
}