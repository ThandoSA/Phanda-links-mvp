"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, Star, TrendingUp, Calendar, Plus, MapPin } from "lucide-react";
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

interface Job {
  id: string;
  title: string;
  status: string;
  amount?: number;
  created_at?: string;
}

export default function WorkerDashboard() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch profile + worker_profiles in one query
      const { data: profileData, error } = await supabase
        .from('profiles')
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
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (profileData) {
        const workerData = profileData.worker_profiles?.[0] || {};
        setProfile({
          ...workerData,
          id: user.id,
          user_id: user.id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
        });
      }

      // Fetch recent jobs (adjust table/column names if needed)
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, status, amount, created_at')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentJobs(jobsData || []);
      setLoading(false);
    };

    fetchDashboardData();

    // Real-time subscription
    const channel = supabase
      .channel('worker-dashboard')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'worker_profiles' },
        () => fetchDashboardData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = [
    {
      label: "Jobs Completed",
      value: profile?.jobs_completed ?? 0,
      icon: <Briefcase className="w-8 h-8" />
    },
    {
      label: "Rating",
      value: profile?.rating ? Number(profile.rating).toFixed(1) : "0.0",
      icon: <Star className="w-8 h-8" />
    },
    {
      label: "Availability",
      value: profile?.availability ? profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1) : "Available",
      icon: <MapPin className="w-8 h-8" />
    },
    {
      label: "This Month",
      value: "—",
      icon: <Calendar className="w-8 h-8" />
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
              <Image
                src={profile?.avatar_url || "/images/default-avatar.svg"}
                alt={profile?.full_name || "Profile"}
                fill
                className="object-cover"
              />
              {profile?.verified && (
                <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold px-2.5 py-1 rounded-full">
                  ✓
                </div>
              )}
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Hustler"} 👋
              </h1>
              <p className="text-xl text-gray-600 mt-1">Let’s keep building your reputation</p>
            </div>
          </div>

          <Link
            href="/dashboard/worker/profile/edit"
            className="btn-luxury btn-luxury-primary flex items-center gap-3 mt-6 md:mt-0"
          >
            <Plus className="w-5 h-5" /> Update Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-8 hover:scale-[1.02] transition-all">
              <div className="text-[#D4AF37] mb-6">{stat.icon}</div>
              <div className="text-5xl font-black tracking-tighter">{stat.value}</div>
              <div className="text-gray-500 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Recent Jobs */}
          <div className="lg:col-span-3 glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Recent Jobs</h3>
              <Link href="/dashboard/worker/jobs" className="text-[#D4AF37] hover:underline text-sm font-medium">
                View All Jobs →
              </Link>
            </div>

            {loading ? (
              <div className="py-20 text-center">Loading your activity...</div>
            ) : recentJobs.length > 0 ? (
              <div className="space-y-6">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex justify-between items-center border-b pb-6 last:border-none">
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.created_at || "").toLocaleDateString('en-ZA')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-1 text-xs font-medium rounded-full 
                        ${job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {job.status}
                      </span>
                      {job.amount && <p className="font-medium mt-1">R{job.amount}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                No jobs yet. Start applying on the{" "}
                <Link href="/dashboard/workers" className="text-[#D4AF37] hover:underline">Find Work</Link> page.
              </div>
            )}
          </div>

          {/* Profile Summary */}
          <div className="lg:col-span-2 glass-card p-8">
            <h3 className="text-2xl font-bold mb-6">Your Profile</h3>

            <div className="space-y-6">
              {profile?.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Bio</p>
                  <p className="text-gray-700 line-clamp-4">{profile.bio}</p>
                </div>
              )}

              {profile?.skills && profile.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-4 py-2 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/dashboard/worker/profile/edit"
                className="btn-luxury w-full mt-6"
              >
                Edit Profile & Add Photos
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
}