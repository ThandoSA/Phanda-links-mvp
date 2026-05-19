
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getColumns() {
  console.log('Querying columns for jobs table via RPC (if exists) or just guess...')
  // Since we can't directly query information_schema via PostgREST easily without an RPC,
  // we can try to use a known technique: query a non-existent column and see if the error lists available ones.
  // Or better, just try to select * from jobs and see if it works now.
  
  const { data, error } = await supabase.from('jobs').select('*').limit(0)
  if (error) {
    console.error('Select failed:', error)
  } else {
    console.log('Select * succeeded (headers might have info in some clients, but here we just get data)')
  }
}

getColumns()
