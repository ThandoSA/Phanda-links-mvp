"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Star, Loader2, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchListedWorkers, type ListedWorker } from "@/lib/marketplace";
import toast from "react-hot-toast";

interface WorkerProfile extends ListedWorker {
  user_id?: string;
}

export default function DashboardWorkersPage() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [savedWorkerIds, setSavedWorkerIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkersAndSaved = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const [workersRes, savedRes] = await Promise.all([
        fetchListedWorkers(supabase),
        user ? supabase.from("saved_workers").select("worker_id").eq("client_id", user.id) : Promise.resolve({ data: [] })
      ]);

      if (workersRes.error) {
        console.error("Error fetching workers:", workersRes.error);
        toast.error("Could not load workers. Please refresh.");
      } else if (workersRes.workers) {
        const mapped = workersRes.workers.map((w) => ({
          ...w,
          user_id: w.id,
        }));
        setWorkers(mapped);
      }

      if (savedRes.data) {
        setSavedWorkerIds(new Set(savedRes.data.map((s: any) => s.worker_id)));
      }

      setLoading(false);
    };

    fetchWorkersAndSaved();

    const sub = supabase
      .channel("dashboard-workers")
      .on("postgres_changes", { event: "*", schema: "public", table: "worker_profiles" }, fetchWorkersAndSaved)
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  const toggleSaveWorker = async (e: React.MouseEvent, workerId: string) => {
    e.preventDefault();
    if (!currentUserId) return toast.error("Please log in to save workers");

    const isSaved = savedWorkerIds.has(workerId);
    
    // Optimistic update
    const newSaved = new Set(savedWorkerIds);
    if (isSaved) newSaved.delete(workerId);
    else newSaved.add(workerId);
    setSavedWorkerIds(newSaved);

    if (isSaved) {
      const { error } = await supabase.from("saved_workers").delete().match({ client_id: currentUserId, worker_id: workerId });
      if (error) {
        toast.error("Failed to remove worker");
        setSavedWorkerIds(savedWorkerIds); // Revert
      } else {
        toast.success("Worker removed from saved");
      }
    } else {
      const { error } = await supabase.from("saved_workers").insert({ client_id: currentUserId, worker_id: workerId });
      if (error) {
        toast.error("Failed to save worker");
        setSavedWorkerIds(savedWorkerIds); // Revert
      } else {
        toast.success("Worker saved!");
      }
    }
  };

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
    <div className="max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Find Talent</h1>
          <p className="text-gray-400 mt-1">Real people. Real skills. Right now.</p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search skills, names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#D4AF37] w-full sm:w-72"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#D4AF37] w-full sm:w-52"
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
            <Link href={`/workers/${worker.user_id || worker.id}`} key={worker.id} className="group">
              <div className="card-luxury p-0 rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col border border-white/5 hover:border-[#D4AF37]/50 relative">
                
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  {worker.is_verified && (
                    <div className="bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      ✓ Verified
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => toggleSaveWorker(e, worker.user_id || worker.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
                >
                  <Heart className={`w-4 h-4 transition-colors ${savedWorkerIds.has(worker.user_id || worker.id) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white"}`} />
                </button>

                <div className="relative h-56 w-full">
                  <Image
                    src={worker.avatar_url || "/images/default-avatar.svg"}
                    alt={worker.full_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Availability Badge */}
                  <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${
                    worker.availability === "busy"
                      ? "bg-orange-950/85 border-orange-500/30 text-orange-400"
                      : "bg-emerald-950/85 border-emerald-500/30 text-emerald-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${worker.availability === "busy" ? "bg-orange-400" : "bg-emerald-400 animate-pulse"}`} />
                    {worker.availability === "busy" ? "Busy" : "Available"}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                </div>
                
                <div className="p-6 flex-1 flex flex-col bg-black/40 backdrop-blur-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-white group-hover:text-[#D4AF37] transition-colors">{worker.full_name}</h3>
                      {worker.location && (
                        <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                          <MapPin className="w-3.5 h-3.5" /> {worker.location}
                        </div>
                      )}
                    </div>
                    {worker.rating && (
                      <div className="flex items-center gap-1 text-sm font-semibold bg-white/5 px-2 py-1 rounded-md border border-white/10">
                        <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
                        <span className="text-white">{worker.rating}</span>
                      </div>
                    )}
                  </div>

                  {worker.skills && worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-6">
                      {worker.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full">
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
