
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  console.log('Fetching one job to see columns...')
  const { data, error } = await supabase.from('jobs').select('*').limit(1)
  
  if (error) {
    console.error('Fetch failed:', error)
  } else if (data && data.length > 0) {
    console.log('Columns in jobs table:', Object.keys(data[0]))
  } else {
    console.log('No jobs found to inspect columns.')
  }
}

checkSchema()
