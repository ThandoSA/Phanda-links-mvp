const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAllProfiles() {
  console.log("=== Fetching all profiles ===")
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_verified, location')
  
  if (profError) {
    console.error("Error fetching profiles:", profError)
    return
  }
  console.log("Profiles found:", profiles)

  console.log("\n=== Fetching all worker_profiles ===")
  const { data: workerProfiles, error: workerError } = await supabase
    .from('worker_profiles')
    .select('*')
  
  if (workerError) {
    console.error("Error fetching worker_profiles:", workerError)
    return
  }
  console.log("Worker profiles found:", workerProfiles)
}

checkAllProfiles()
