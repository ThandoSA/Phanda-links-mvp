
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkWorkerProfile() {
  const { data, error } = await supabase.from('worker_profiles').select('*').limit(1)
  if (data && data.length > 0) {
    console.log('worker_profiles columns:', Object.keys(data[0]))
  } else {
    console.log('No worker profiles found or error:', error)
  }
}

checkWorkerProfile()
