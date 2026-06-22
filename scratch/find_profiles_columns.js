const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function findColumns() {
  console.log("=== Querying non-existent column on profiles ===")
  const { error: error1 } = await supabase.from('profiles').select('non_existent_column_to_trigger_error').limit(1)
  console.log("Profiles columns error:", error1)

  console.log("\n=== Querying non-existent column on worker_profiles ===")
  const { error: error2 } = await supabase.from('worker_profiles').select('non_existent_column_to_trigger_error').limit(1)
  console.log("Worker profiles columns error:", error2)
}

findColumns()
