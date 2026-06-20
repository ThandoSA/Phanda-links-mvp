"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface WorkerProfile {
  id: string;
  user_id?: string;
  full_name: string;
  location?: string;
  avatar_url?: string;
  rating?: number;
  is_verified?: boolean;
  skills?: string[];
}

export default function DashboardWorkersPage() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("worker_profiles")
        .select(`
          id,
          user_id,
          location,
          rating,
          is_verified,
          skills,
          profiles(id, full_name, avatar_url)
        `)
        .order("rating", { ascending: false });

      if (!error) {
        const mapped = (data || []).map((w: any) => ({
          id: w.id || w.user_id,
          user_id: w.user_id,
          full_name: w.profiles?.full_name || "Worker",
          avatar_url: w.profiles?.avatar_url,
          location: w.location,
          rating: w.rating,
          is_verified: w.is_verified,
          skills: w.skills,
        }));
        setWorkers(mapped);
      }
      setLoading(false);
    };

    fetchWorkers();

    const sub = supabase
      .channel("dashboard-workers")
      .on("postgres_changes", { event: "*", schema: "public", table: "worker_profiles" }, fetchWorkers)
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  const filtered = workers.filter((w) => {
    const matchSearch =
      !searchTerm ||
      w.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.skills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchLocation =
      !filterLocation ||
      w.location?.toLowerCase().includes(filterLocation.toLowerCase());
    return matchSearch && matchLocation;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Find Talent</h1>
          <p className="text-gray-500 mt-1">Real people. Real skills. Right now.</p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills, names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[#D4AF37] w-full sm:w-72"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[#D4AF37] w-full sm:w-52"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No workers found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((worker) => (
            <Link href={`/workers/${worker.id}`} key={worker.id} className="group">
              <div className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="relative h-56">
                  <Image
                    src={worker.avatar_url || "/images/default-avatar.jpg"}
                    alt={worker.full_name}
                    fill
                    className="object-cover"
                  />
                  {worker.is_verified && (
                    <div className="absolute top-3 right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">
                      ✓ Verified
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{worker.full_name}</h3>
                      {worker.location && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                          <MapPin className="w-3 h-3" /> {worker.location}
                        </div>
                      )}
                    </div>
                    {worker.rating && (
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Star className="w-4 h-4 text-[#D4AF37] fill-current" />
                        {worker.rating}
                      </div>
                    )}
                  </div>

                  {worker.skills && worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-4">
                      {worker.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
