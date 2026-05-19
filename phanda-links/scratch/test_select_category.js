
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSelectCategory() {
  console.log('Testing select category from jobs...')
  const { data, error } = await supabase.from('jobs').select('category').limit(1)
  
  if (error) {
    console.error('Select category failed:', error.message)
  } else {
    console.log('Select category succeeded!')
  }
}

testSelectCategory()
