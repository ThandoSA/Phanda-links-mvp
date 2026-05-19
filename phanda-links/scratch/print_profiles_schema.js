const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runCheck() {
  console.log("=== Profiling 'profiles' table ===")
  const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1)
  if (pError) {
    console.error("Profiles query error:", pError)
  } else if (pData && pData.length > 0) {
    console.log("Profiles row keys:", Object.keys(pData[0]))
    console.log("Profiles row sample:", pData[0])
  } else {
    console.log("No data found in profiles table.")
  }

  console.log("\n=== Profiling 'worker_profiles' table ===")
  const { data: wpData, error: wpError } = await supabase.from('worker_profiles').select('*').limit(1)
  if (wpError) {
    console.error("Worker Profiles query error:", wpError)
  } else if (wpData && wpData.length > 0) {
    console.log("Worker Profiles row keys:", Object.keys(wpData[0]))
    console.log("Worker Profiles row sample:", wpData[0])
  } else {
    console.log("No data found in worker_profiles table.")
  }
}

runCheck()
