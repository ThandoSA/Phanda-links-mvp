"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Star, MapPin, Calendar, Plus, Zap, ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface WorkerProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  skills?: string[];
  bio?: string;
  verified?: boolean;
  rating?: number;
  jobs_completed?: number;
  availability?: string;
}

interface RecentJob {
  id: string;
  title: string;
  status: string;
  price?: number;
  created_at?: string;
}

interface OpenJob {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at: string;
}

function getGreeting(firstName: string): { greeting: string; tagline: string } {
  const hour = new Date().getHours();
  const name = firstName || "Hustler";

  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Good morning, ${name}.`,
      tagline: "Let's secure the bag today.",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: `Good afternoon, ${name}.`,
      tagline: "Keep the momentum going — great jobs are waiting.",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: `Good evening, ${name}.`,
      tagline: "Review your pending quotes before calling it a day.",
    };
  } else {
    return {
      greeting: `Welcome back, ${name}.`,
      tagline: "Burning the midnight oil? Check your latest activity.",
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

export default function WorkerDashboard() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [topPicks, setTopPicks] = useState<OpenJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch profile + worker_profiles joined
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select(`
          full_name,
          avatar_url,
          worker_profiles (
            skills,
            bio,
            verified,
            rating,
            jobs_completed,
            availability
          )
        `)
        .eq("id", user.id)
        .single();

      let workerSkills: string[] = [];

      if (!error && profileData) {
        const workerData = (profileData.worker_profiles as any)?.[0] || {};
        workerSkills = workerData.skills || [];
        setProfile({
          ...workerData,
          id: user.id,
          user_id: user.id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
        });
      }

      // Fetch recent jobs assigned to this worker
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title, status, price, created_at")
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentJobs(jobsData || []);

      // Fetch Top Picks — open jobs matching worker's skills
      if (workerSkills.length > 0) {
        const skillFilters = workerSkills.map((s) => `title.ilike.%${s}%`).join(",");
        const { data: picks } = await supabase
          .from("jobs")
          .select("id, title, description, price, location, created_at")
          .is("worker_id", null)
          .or(skillFilters)
          .order("created_at", { ascending: false })
          .limit(3);
        setTopPicks(picks || []);
      } else {
        // No skills yet — show 3 latest open jobs as fallback
        const { data: fallback } = await supabase
          .from("jobs")
          .select("id, title, description, price, location, created_at")
          .is("worker_id", null)
          .order("created_at", { ascending: false })
          .limit(3);
        setTopPicks(fallback || []);
      }

      setLoading(false);
    };

    fetchDashboardData();

    const channel = supabase
      .channel("worker-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "worker_profiles" }, fetchDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, fetchDashboardData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "";
  const { greeting, tagline } = getGreeting(firstName);

  const profileCompletionItems = [
    { key: "bio", label: "Profile bio", done: !!profile?.bio?.trim() },
    { key: "skills", label: "Skills listed", done: !!profile?.skills?.length },
    { key: "availability", label: "Availability set", done: !!profile?.availability },
    { key: "avatar", label: "Profile photo", done: !!profile?.avatar_url && profile.avatar_url !== "/images/default-avatar.svg" },
  ];

  const completedCount = profileCompletionItems.filter((item) => item.done).length;
  const missingItems = profileCompletionItems.filter((item) => !item.done);

  const stats = [
    { label: "Jobs Completed", value: profile?.jobs_completed ?? 0, icon: <Briefcase className="w-7 h-7" /> },
    { label: "Rating", value: profile?.rating ? Number(profile.rating).toFixed(1) : "0.0", icon: <Star className="w-7 h-7" /> },
    { label: "Availability", value: profile?.availability ? profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1) : "Available", icon: <MapPin className="w-7 h-7" /> },
    { label: "This Month", value: recentJobs.filter(j => {
      const d = new Date(j.created_at || "");
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length, icon: <Calendar className="w-7 h-7" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10 text-white bg-[#05080f] rounded-[2rem] shadow-2xl ring-1 ring-white/10">

      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 card-luxury p-8 rounded-2xl bg-[#111316] border border-white/10">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl flex-shrink-0">
              <Image
                src={profile?.avatar_url || "/images/default-avatar.svg"}
                alt={profile?.full_name || "Profile"}
                fill
                className="object-cover"
              />
              {profile?.verified && (
                <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">✓</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white leading-tight">
                {loading ? "Loading..." : greeting}
              </h1>
              <p className="text-gray-400 font-medium mt-1">{loading ? "" : tagline}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-right md:text-left md:self-start">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] font-black">Your progress</p>
            <div className="h-3 rounded-full bg-black/20 overflow-hidden border border-white/10 w-full md:w-72">
              <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${(completedCount / profileCompletionItems.length) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-300">{completedCount}/{profileCompletionItems.length} steps complete</p>
          </div>
        </div>

        {missingItems.length > 0 && (
          <div className="card-luxury p-6 rounded-2xl border border-[#D4AF37]/20 bg-[#111316]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] font-black mb-2">Complete your profile</p>
                <h2 className="text-2xl font-black text-white">Fill these items to get better matches</h2>
                <p className="text-gray-400 mt-2 text-sm">A stronger profile helps clients find you faster and improves your job recommendations.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                {missingItems.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-white/10 p-4 bg-black/40">
                    <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">{item.label}</p>
                    <p className="text-sm font-semibold text-white">Pending</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/worker/profile" className="btn-luxury btn-luxury-primary px-6 py-3 text-sm">
                Complete Profile
              </Link>
              <Link href="/dashboard/worker/jobs" className="btn-luxury btn-luxury-outline px-6 py-3 text-sm text-white border-white/10">
                Browse Jobs
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-5"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="card-luxury p-7 rounded-2xl hover:scale-[1.02] transition-transform bg-[#111316] border border-white/10">
            <div className="text-[#D4AF37] mb-4">{stat.icon}</div>
            <div className="text-4xl font-black tracking-tighter text-white">{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1.5 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Top Picks for Your Skills ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Top Picks for Your Skills</h2>
              <p className="text-xs text-gray-400 font-medium">
                {profile?.skills?.length
                  ? `Matched to: ${profile.skills.slice(0, 3).join(", ")}${profile.skills.length > 3 ? "..." : ""}`
                  : "Complete your profile to get personalised picks"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/worker/jobs"
            className="text-sm font-bold text-[#D4AF37] hover:underline flex items-center gap-1 whitespace-nowrap"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="h-40 skeleton rounded-2xl" />)}
          </div>
        ) : topPicks.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {topPicks.map((job) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                className="card-luxury rounded-2xl p-6 flex flex-col gap-3 border border-white/10 bg-[#0f1320] hover:border-[#D4AF37]/50 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-white text-base leading-tight group-hover:text-[#D4AF37] transition-colors line-clamp-2 flex-1">
                    {job.title || "Service Request"}
                  </h3>
                  <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap border border-[#D4AF37]/20 flex-shrink-0">
                    R {Number(job.price || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 font-medium flex-1">
                  {job.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1 text-gray-300 text-xs font-bold">
                    <MapPin className="w-3 h-3" />
                    {(job.location || "Anywhere").substring(0, 18)}
                  </div>
                  <div className="flex items-center gap-1 text-gray-300 text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {new Date(job.created_at).toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="card-luxury rounded-2xl p-10 text-center text-gray-400 font-medium bg-[#0f1320] border border-white/10">
            No open jobs match your skills right now.{" "}
            <Link href="/dashboard/worker/jobs" className="text-[#D4AF37] hover:underline">Browse all jobs →</Link>
          </div>
        )}
      </motion.section>

      {/* ── Bottom Row ── */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-3 card-luxury p-8 rounded-2xl bg-[#111316] border border-white/10">
          <div className="flex justify-between items-center mb-7">
            <h3 className="text-xl font-black text-white">Recent Activity</h3>
            <Link href="/dashboard/worker/jobs" className="text-[#D4AF37] hover:underline text-sm font-bold">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
            </div>
          ) : recentJobs.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
              {recentJobs.map((job) => (
                <motion.div key={job.id} variants={itemVariants} className="flex justify-between items-center border-b border-white/5 pb-5 last:border-none">
                  <div>
                    <p className="font-bold text-white">{job.title}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {new Date(job.created_at || "").toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      job.status === "completed" ? "bg-emerald-900/50 text-emerald-200" : "bg-amber-900/50 text-amber-200"
                    }`}>
                      {job.status}
                    </span>
                    {job.price && <p className="text-sm font-bold text-white mt-1">R{job.price}</p>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-14 text-gray-400 font-medium">
              No jobs yet.{" "}
              <Link href="/dashboard/worker/jobs" className="text-[#D4AF37] hover:underline">Start applying</Link>
            </div>
          )}
        </div>

        {/* Profile Summary */}
        <div className="lg:col-span-2 card-luxury p-8 rounded-2xl flex flex-col bg-[#111316] border border-white/10">
          <h3 className="text-xl font-black text-white mb-6">Your Profile</h3>
          <div className="space-y-5 flex-1">
            {profile?.bio && (
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Bio</p>
                <p className="text-gray-300 text-sm line-clamp-4 leading-relaxed">{profile.bio}</p>
              </div>
            )}
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.slice(0, 6).map((skill, i) => (
                    <span key={i} className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1.5 rounded-full font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!profile?.bio && !profile?.skills?.length && (
              <p className="text-sm text-gray-400 font-medium">Complete your profile to attract more clients.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}