
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testMinimalInsert() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
  const testClientId = profiles[0].id

  console.log('Testing minimal insert...')
  const { error } = await supabase.from('jobs').insert({
    client_id: testClientId,
    status: 'pending'
  })

  if (error) {
    console.error('Minimal insert failed:', error.message)
  } else {
    console.log('Minimal insert succeeded!')
  }
}

testMinimalInsert()
