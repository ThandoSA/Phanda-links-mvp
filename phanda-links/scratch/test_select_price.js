
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSelectPrice() {
  console.log('Testing select price from jobs...')
  const { data, error } = await supabase.from('jobs').select('price').limit(1)
  
  if (error) {
    console.error('Select price failed:', error.message)
  } else {
    console.log('Select price succeeded!')
  }
}

testSelectPrice()
