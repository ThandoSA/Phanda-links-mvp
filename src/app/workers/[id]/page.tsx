"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import { Star, MapPin, Award, MessageCircle, Calendar, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface WorkerProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  verified?: boolean;
  jobs_completed?: number;
  availability?: string;
}

export default function WorkerProfile() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.id as string;

  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!workerId) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          location,
          worker_profiles (
            skills,
            bio,
            verified,
            rating,
            jobs_completed,
            availability
          )
        `)
        .eq('id', workerId)
        .single();

      if (error) {
        console.error(error);
        setError("Worker profile not found");
      } else if (data) {
        const workerData = data.worker_profiles?.[0] || {};
        setProfile({
          id: data.id,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          location: data.location,
          ...workerData,
        });
      }
      setLoading(false);
    };

    fetchWorkerProfile();
  }, [workerId]);

  const handleHire = () => {
    toast.success("Hire flow coming soon! (We can build this next)");
  };

  const handleMessage = () => {
    toast.success("Messaging feature coming soon!");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Profile not found</h2>
          <Link href="/workers" className="text-[#D4AF37] hover:underline">
            ← Back to all workers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back to workers
        </button>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-8">
            <div className="relative h-[460px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={profile.avatar_url || "/images/default-avatar.svg"}
                alt={profile.full_name}
                fill
                className="object-cover"
                priority
              />
              {profile.verified && (
                <div className="absolute top-6 right-6 bg-[#D4AF37] text-black font-bold px-5 py-2 rounded-full flex items-center gap-2">
                  <Award className="w-5 h-5" /> Verified Professional
                </div>
              )}
            </div>

            <div className="mt-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h1 className="text-5xl font-black tracking-tighter">{profile.full_name}</h1>
                {profile.rating && (
                  <div className="flex items-center gap-2 text-2xl font-medium">
                    <Star className="text-[#D4AF37] fill-current" /> {profile.rating}
                  </div>
                )}
              </div>

              {profile.location && (
                <div className="flex items-center gap-2 text-gray-600 mt-3 text-lg">
                  <MapPin className="w-5 h-5" /> {profile.location}
                </div>
              )}

              {profile.availability && (
                <div className="inline-block mt-4 px-6 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                  {profile.availability === 'available' ? '✅ Available Now' : profile.availability}
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">About Me</h3>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-6 py-3 bg-gray-100 hover:bg-[#D4AF37] hover:text-black transition-colors rounded-2xl text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions & Stats */}
          <div className="lg:col-span-4">
            <div className="glass-card p-8 sticky top-8">
              <div className="text-center mb-8">
                <div className="text-6xl font-black text-[#D4AF37]">
                  {profile.jobs_completed || 0}
                </div>
                <p className="text-gray-600">Jobs Completed</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleHire}
                  className="btn-luxury btn-luxury-primary w-full py-5 text-lg font-semibold flex items-center justify-center gap-3"
                >
                  Hire {profile.full_name.split(" ")[0]}
                </button>

                <button
                  onClick={handleMessage}
                  className="btn-luxury w-full py-5 text-lg font-semibold flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send Message
                </button>
              </div>

              <div className="mt-10 pt-8 border-t text-sm text-gray-600 space-y-4">
                <div className="flex justify-between">
                  <span>Member since</span>
                  <span className="font-medium">2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Response time</span>
                  <span className="font-medium">Usually within 2 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}