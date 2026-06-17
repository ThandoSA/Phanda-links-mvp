"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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

export default function ClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch client profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch jobs posted by this client
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          status,
          budget,
          created_at,
          applicants_count:job_applications(count)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      const formattedJobs = jobsData?.map((job: any) => ({
        ...job,
        applicants_count: job.applicants_count?.[0]?.count || 0
      })) || [];

      setPostedJobs(formattedJobs);
      setLoading(false);
    };

    fetchClientData();

    // Real-time subscription
    const channel = supabase
      .channel('client-dashboard')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => fetchClientData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
              <Image
                src={profile?.avatar_url || "/images/default-avatar.jpg"}
                alt={profile?.full_name || "Client"}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Boss"} 👋
              </h1>
              <p className="text-xl text-gray-600 mt-1">Let’s find the right people for your work</p>
            </div>
          </div>

          <Link
            href="/jobs/new"
            className="btn-luxury btn-luxury-primary flex items-center gap-3 mt-6 md:mt-0"
          >
            <Plus className="w-5 h-5" /> Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Jobs Posted", value: postedJobs.length, icon: <Briefcase className="w-8 h-8" /> },
            { label: "Active Jobs", value: postedJobs.filter(j => j.status === 'open').length, icon: <Clock className="w-8 h-8" /> },
            { label: "Total Applicants", value: "—", icon: <Users className="w-8 h-8" /> },
            { label: "Avg Rating", value: "4.9", icon: <Star className="w-8 h-8" /> },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-8 hover:scale-[1.02] transition-all">
              <div className="text-[#D4AF37] mb-6">{stat.icon}</div>
              <div className="text-5xl font-black tracking-tighter">{stat.value}</div>
              <div className="text-gray-500 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Posted Jobs */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Your Posted Jobs</h3>
            <Link href="/jobs" className="text-[#D4AF37] hover:underline text-sm font-medium">
              View All Jobs →
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center">Loading your jobs...</div>
          ) : postedJobs.length > 0 ? (
            <div className="space-y-6">
              {postedJobs.map((job) => (
                <div key={job.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 last:border-none gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{job.title}</p>
                    <p className="text-sm text-gray-500">
                      Posted {new Date(job.created_at || "").toLocaleDateString('en-ZA')}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className={`inline-block px-5 py-1.5 text-sm font-medium rounded-full 
                        ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {job.status}
                      </span>
                    </div>

                    {job.budget && (
                      <div className="text-right">
                        <p className="font-medium">R{job.budget}</p>
                        <p className="text-xs text-gray-500">Budget</p>
                      </div>
                    )}

                    <div className="text-right">
                      <p className="font-medium">{job.applicants_count || 0}</p>
                      <p className="text-xs text-gray-500">Applicants</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 mb-6">You haven't posted any jobs yet</p>
              <Link href="/jobs/new" className="btn-luxury btn-luxury-primary">
                Post Your First Job
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <Link href="/workers" className="glass-card p-10 hover:shadow-xl transition-all group">
            <div className="text-[#D4AF37] mb-4">
              <Users className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold group-hover:text-[#D4AF37] transition">Browse Workers</h4>
            <p className="text-gray-600 mt-2">Find skilled professionals near you</p>
          </Link>

          <Link href="/dashboard/client/history" className="glass-card p-10 hover:shadow-xl transition-all group">
            <div className="text-[#D4AF37] mb-4">
              <Briefcase className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold group-hover:text-[#D4AF37] transition">Job History</h4>
            <p className="text-gray-600 mt-2">View completed and past jobs</p>
          </Link>
        </div>
      </div>
    </main>
  );
}