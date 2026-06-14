"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Search, MapPin, Star, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // adjust path if needed

interface WorkerProfile {
  id: string;
  full_name: string;
  location?: string;
  avatar_url?: string;
  rating?: number;
  is_verified?: boolean;
  skills?: string[];
  role?: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Fetch workers with real-time subscription
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('worker_profiles')
        .select(`
          id,
          full_name,
          location,
          avatar_url,
          rating,
          is_verified,
          skills,
          profiles!inner(full_name, avatar_url)
        `)
        .order('rating', { ascending: false });

      if (error) {
        console.error("Error fetching workers:", error);
      } else {
        setWorkers(data || []);
      }
      setLoading(false);
    };

    fetchWorkers();

    // Real-time subscription
    const subscription = supabase
      .channel('workers')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'worker_profiles' },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchWorkers(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = searchTerm === "" ||
      worker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = filterLocation === "" ||
      worker.location?.toLowerCase().includes(filterLocation.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">Find Talent</h1>
            <p className="text-xl text-gray-600 mt-2">Real people. Real skills. Right now.</p>
          </div>

          <div className="mt-6 md:mt-0 flex gap-4">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search electricians, plumbers, cleaners..."
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#D4AF37] text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkers.map((worker) => (
              <Link href={`/workers/${worker.id}`} key={worker.id} className="group">
                <div className="glass-card overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-64">
                    <Image
                      src={worker.avatar_url || "/images/default-avatar.jpg"}
                      alt={worker.full_name}
                      fill
                      className="object-cover"
                    />
                    {worker.is_verified && (
                      <div className="absolute top-4 right-4 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-2xl">{worker.full_name}</h3>
                        <p className="text-[#D4AF37]">{worker.role || "Skilled Professional"}</p>
                      </div>
                      {worker.rating && (
                        <div className="flex items-center gap-1 text-lg font-medium">
                          <Star className="text-[#D4AF37] fill-current" /> {worker.rating}
                        </div>
                      )}
                    </div>

                    {worker.location && (
                      <div className="flex items-center gap-1 text-gray-500 mt-2">
                        <MapPin className="w-4 h-4" /> {worker.location}
                      </div>
                    )}

                    {worker.skills && worker.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-6">
                        {worker.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-4 py-1.5 rounded-full">
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

        {filteredWorkers.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-500">
            No workers found matching your search.
          </div>
        )}
      </div>
    </main>
  );
}