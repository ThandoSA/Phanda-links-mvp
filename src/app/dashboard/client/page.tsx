"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users, Clock, Star, FileText, AlertCircle, ArrowRight, CheckCircle2, MapPin, MessageSquare, CalendarDays, RefreshCw, Wallet } from "lucide-react";
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
  updated_at?: string;
  location?: string;
  worker_id?: string | null;
  scheduled_time?: string | null;
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
  const [currentTime] = useState(() => Date.now());

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
        .select("id, title, status, price, created_at, updated_at, location, worker_id, scheduled_time")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (jobsError) {
        console.error("Client dashboard jobs fetch error:", jobsError);
        toast.error("Could not load your posted jobs. Refresh to try again.");
      }

      const formattedJobs: PostedJob[] = (jobsData || []).map((job) => ({
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

  const activeStatuses = ["open", "pending", "accepted", "en_route", "in_progress"];
  const activeJobs = postedJobs.filter(job => activeStatuses.includes(job.status));
  const activeJobsCount = activeJobs.length;
  const completedJobsCount = postedJobs.filter(job => job.status === "completed").length;
  const hiredWorkersCount = postedJobs.filter(job => job.worker_id && ["accepted", "en_route", "in_progress", "completed"].includes(job.status)).length;
  const proposalCount = postedJobs.reduce((total, job) => total + (job.applicants_count || 0), 0);
  const committedBudget = activeJobs.reduce((total, job) => total + Number(job.price || 0), 0);
  const upcomingJobs = postedJobs
    .filter((job) => job.scheduled_time && new Date(job.scheduled_time).getTime() >= currentTime && activeStatuses.includes(job.status))
    .sort((a, b) => new Date(a.scheduled_time || 0).getTime() - new Date(b.scheduled_time || 0).getTime())
    .slice(0, 3);
  const pipeline = [
    { label: "Open", statuses: ["open"] },
    { label: "Reviewing quotes", statuses: ["pending"] },
    { label: "Worker selected", statuses: ["accepted"] },
    { label: "In progress", statuses: ["en_route", "in_progress"] },
    { label: "Completed", statuses: ["completed"] },
  ];
  const profileComplete = Boolean(profile?.full_name && profile.avatar_url && profile.avatar_url !== "/images/default-avatar.svg");
  const activityProgress = postedJobs.length > 0 ? Math.round((completedJobsCount / postedJobs.length) * 100) : 0;
  const jobsForDisplay = [...postedJobs].sort((a, b) => {
    const activeDifference = Number(activeStatuses.includes(b.status)) - Number(activeStatuses.includes(a.status));
    if (activeDifference !== 0) return activeDifference;
    return new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime();
  });
  const needsAttention = postedJobs.filter(job =>
    (job.applicants_count || 0) > 0 && ["open", "pending"].includes(job.status),
  ).slice(0, 3);
  const recentActivity = [...postedJobs]
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
    .slice(0, 4);

  const statusLabel = (status: string) => status.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());

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
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] font-black">Work completed</p>
          <div className="h-3 rounded-full bg-black/20 overflow-hidden border border-white/10 w-full">
            <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${activityProgress}%` }} />
          </div>
          <p className="text-xs text-gray-300">{completedJobsCount} of {postedJobs.length} {postedJobs.length === 1 ? "job" : "jobs"} completed</p>
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
        className="grid grid-cols-2 md:grid-cols-5 gap-5"
      >
        {[
          { label: "Jobs Posted", value: postedJobs.length, icon: <Briefcase className="w-7 h-7" /> },
          { label: "Active Jobs", value: activeJobsCount, icon: <Clock className="w-7 h-7" /> },
          { label: "Proposals Received", value: proposalCount, icon: <Users className="w-7 h-7" /> },
          { label: "Workers Hired", value: hiredWorkersCount, icon: <Star className="w-7 h-7" /> },
          { label: "Committed Budget", value: `R ${committedBudget.toLocaleString()}`, icon: <Wallet className="w-7 h-7" /> },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="card-luxury p-7 rounded-2xl hover:scale-[1.02] transition-transform bg-[#111823] border border-white/10">
            <div className="text-[#D4AF37] mb-4">{stat.icon}</div>
            <div className="text-4xl font-black tracking-tighter text-white">{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1.5 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <section className="card-luxury rounded-2xl border border-white/10 bg-[#111316] p-6 md:p-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div><h2 className="text-xl font-black text-white">Hiring pipeline</h2><p className="mt-1 text-sm font-medium text-gray-400">See where every request stands.</p></div>
          <button type="button" onClick={() => window.location.reload()} aria-label="Refresh client dashboard" className="rounded-full p-2 text-[#D4AF37] transition-colors hover:bg-white/5"><RefreshCw className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {pipeline.map((stage) => {
            const count = postedJobs.filter((job) => stage.statuses.includes(job.status)).length
            return <Link key={stage.label} href="/dashboard/client/bookings" className="rounded-2xl border border-white/10 p-4 transition-colors hover:border-[#D4AF37]/50"><p className="text-2xl font-black text-white">{count}</p><p className="mt-1 text-xs font-bold leading-5 text-gray-400">{stage.label}</p></Link>
          })}
        </div>
      </section>

      <section className="card-luxury rounded-2xl border border-white/10 bg-[#111316] p-6 md:p-8">
        <div className="flex items-center justify-between gap-3 mb-6"><div><h2 className="text-xl font-black text-white">Upcoming work</h2><p className="mt-1 text-sm font-medium text-gray-400">Scheduled jobs that need your attention next.</p></div><CalendarDays className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" /></div>
        {upcomingJobs.length > 0 ? <div className="grid gap-4 md:grid-cols-3">{upcomingJobs.map((job) => <Link key={job.id} href={`/dashboard/jobs/${job.id}`} className="rounded-2xl border border-white/10 p-5 transition-colors hover:border-[#D4AF37]/50"><p className="font-black text-white">{job.title}</p><p className="mt-2 text-sm font-bold text-[#D4AF37]">{new Date(job.scheduled_time || "").toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</p><p className="mt-1 text-xs text-gray-400">{job.location || "On-site"}</p></Link>)}</div> : <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm font-medium text-gray-400">No upcoming jobs scheduled yet.</p>}
      </section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="card-luxury p-6 md:p-8 rounded-2xl bg-[#111316] border border-[#D4AF37]/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Needs your attention</h2>
              <p className="text-sm text-gray-400 font-medium">Keep your hiring moving with these next actions.</p>
            </div>
          </div>
          <Link href="/dashboard/client/bookings" className="text-sm font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
            View all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {needsAttention.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {needsAttention.map((job) => (
              <div key={job.id} className="border border-white/10 rounded-2xl p-5 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-white leading-tight line-clamp-2">{job.title}</h3>
                  <span className="flex-shrink-0 text-xs font-black text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-2.5 py-1">
                    {job.applicants_count} {job.applicants_count === 1 ? "quote" : "quotes"}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-3">Review proposals and choose the right worker.</p>
                <button
                  type="button"
                  onClick={() => setQuoteModal({ jobId: job.id, jobTitle: job.title })}
                  className="mt-4 min-h-11 w-full flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-black text-black hover:bg-[#b8962e] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Review quotes
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-gray-300 font-medium">You&apos;re all caught up. New proposals and job updates will appear here.</p>
          </div>
        )}
      </motion.section>

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
            {jobsForDisplay.map((job) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 last:border-none gap-4"
              >
                <Link href="/dashboard/client/bookings" className="flex-1 min-w-0 rounded-xl p-2 -m-2 hover:bg-white/[0.03] transition-colors group">
                  <p className="font-black text-white text-base leading-tight group-hover:text-[#D4AF37] transition-colors truncate">{job.title}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-medium mt-2">
                    <span>Updated {new Date(job.updated_at || job.created_at || "").toLocaleDateString("en-ZA")}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-[#D4AF37]" />{job.location || "On-site"}</span>
                  </div>
                </Link>

                <div className="flex items-center gap-3 flex-wrap md:justify-end">
                  <span className={`px-3 py-1.5 text-xs font-black rounded-full capitalize ${
                    job.status === "open" ? "bg-emerald-900/50 text-emerald-200"
                    : job.status === "completed" ? "bg-gray-800 text-gray-200"
                    : "bg-amber-900/50 text-amber-200"
                  }`}>
                    {statusLabel(job.status)}
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
                      type="button"
                      onClick={() => setQuoteModal({ jobId: job.id, jobTitle: job.title })}
                      className="min-h-11 flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#b8962e] text-black text-xs font-black rounded-full transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Quotes
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-14 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-5">
              <Briefcase className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Start your first project</h3>
            <p className="text-gray-400 font-medium text-sm max-w-md mb-6">Post a request for trusted workers, or browse professionals who can help today.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link href="/dashboard/client/post-job" className="btn-luxury btn-luxury-primary min-h-11 px-6">Post Your First Job</Link>
              <Link href="/dashboard/client/workers" className="btn-luxury btn-luxury-outline min-h-11 px-6 text-white">Browse Workers</Link>
            </div>
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
            <Link href="/dashboard/client/profile" className="text-[#D4AF37] hover:underline text-sm font-bold">{profileComplete ? "View Profile" : "Complete Profile"}</Link>
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
          <div className="flex items-center justify-between gap-3 mb-6">
            <h3 className="text-xl font-black text-white">Recent Activity</h3>
            <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-5">
              {recentActivity.map((job) => (
                <Link key={job.id} href="/dashboard/client/bookings" className="flex items-start gap-3 group">
                  <div className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${job.applicants_count ? "bg-[#D4AF37]/10" : "bg-white/5"}`}>
                    {job.applicants_count ? <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Clock className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">{job.applicants_count ? `${job.applicants_count} ${job.applicants_count === 1 ? "proposal" : "proposals"} received` : `${statusLabel(job.status)} job`}</p>
                    <p className="text-xs text-gray-400 truncate">{job.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{new Date(job.updated_at || job.created_at || "").toLocaleDateString("en-ZA")}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 font-medium">
              <p>No activity yet.</p>
              <Link href="/dashboard/client/workers" className="inline-flex items-center gap-1 mt-3 text-[#D4AF37] hover:underline">Browse workers <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          )}
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