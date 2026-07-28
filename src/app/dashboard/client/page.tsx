"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users, Clock, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface PostedJob {
  id: string;
  title: string;
  status: string;
  budget?: number;
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

      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          status,
          budget,
          created_at,
          applicants_count:job_applications(count)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      const formattedJobs = jobsData?.map((job: any) => ({
        ...job,
        applicants_count: job.applicants_count?.[0]?.count || 0,
      })) || [];

      setPostedJobs(formattedJobs);
      setLoading(false);
    };

    fetchClientData();

    const channel = supabase
      .channel("client-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, fetchClientData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "";
  const { greeting, tagline } = getGreeting(firstName);

  const activeJobsCount = postedJobs.filter(j => j.status === "open" || j.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10">

      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8"
      >
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
            <Image
              src={profile?.avatar_url || "/images/default-avatar.svg"}
              alt={profile?.full_name || "Client"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-black leading-tight">
              {loading ? "Loading..." : greeting}
            </h1>
            <p className="text-gray-500 font-medium mt-1">{loading ? "" : tagline}</p>
          </div>
        </div>

        <Link
          href="/dashboard/client/post-job"
          className="btn-luxury btn-luxury-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </Link>
      </motion.div>

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
          { label: "Total Applicants", value: postedJobs.reduce((a, j) => a + (j.applicants_count || 0), 0), icon: <Users className="w-7 h-7" /> },
          { label: "Avg Rating", value: "4.9", icon: <Star className="w-7 h-7" /> },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card p-7 hover:scale-[1.02] transition-transform">
            <div className="text-[#D4AF37] mb-4">{stat.icon}</div>
            <div className="text-4xl font-black tracking-tighter text-black">{stat.value}</div>
            <div className="text-gray-500 text-sm mt-1.5 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Posted Jobs ── */}
      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-7">
          <h3 className="text-xl font-black text-black">Your Posted Jobs</h3>
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
                className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-5 last:border-none gap-3"
              >
                <div className="flex-1">
                  <p className="font-bold text-black text-base">{job.title}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Posted {new Date(job.created_at || "").toLocaleDateString("en-ZA")}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${
                    job.status === "open" ? "bg-emerald-100 text-emerald-700"
                    : job.status === "completed" ? "bg-gray-100 text-gray-600"
                    : "bg-amber-100 text-amber-700"
                  }`}>
                    {job.status}
                  </span>

                  {job.budget && (
                    <div className="text-right">
                      <p className="font-bold text-black text-sm">R{job.budget}</p>
                      <p className="text-xs text-gray-400">Budget</p>
                    </div>
                  )}

                  <div className="text-right">
                    <p className="font-bold text-black text-sm">{job.applicants_count || 0}</p>
                    <p className="text-xs text-gray-400">Applicants</p>
                  </div>
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
        className="grid md:grid-cols-2 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Link href="/dashboard/workers" className="glass-card p-10 hover:shadow-xl transition-all group flex flex-col">
            <div className="text-[#D4AF37] mb-4">
              <Users className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black group-hover:text-[#D4AF37] transition-colors">Browse Workers</h4>
            <p className="text-gray-500 mt-2 font-medium">Find skilled professionals near you</p>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/dashboard/client/bookings" className="glass-card p-10 hover:shadow-xl transition-all group flex flex-col">
            <div className="text-[#D4AF37] mb-4">
              <Briefcase className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black group-hover:text-[#D4AF37] transition-colors">Job History</h4>
            <p className="text-gray-500 mt-2 font-medium">View completed and past jobs</p>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}