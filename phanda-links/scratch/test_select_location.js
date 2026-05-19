
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSelectLocation() {
  console.log('Testing select location from jobs...')
  const { data, error } = await supabase.from('jobs').select('location').limit(1)
  
  if (error) {
    console.error('Select location failed:', error.message)
  } else {
    console.log('Select location succeeded!')
  }
}

testSelectLocation()
