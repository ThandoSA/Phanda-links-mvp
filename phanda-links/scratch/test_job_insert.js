
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  console.log('Fetching a profile to test with...')
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1)
  
  if (pError || !profiles || profiles.length === 0) {
    console.error('Could not find a profile to test with:', pError)
    return
  }

  const testClientId = profiles[0].id
  console.log('Testing insert with client_id:', testClientId)

  const { data, error } = await supabase.from('jobs').insert({
    client_id: testClientId,
    title: 'Test Job ' + new Date().toISOString(),
    description: 'Test Description from diagnostic script',
    price: 100,
    location: 'Test Location',
    status: 'pending'
  }).select()

  if (error) {
    console.error('Insert failed with error:', JSON.stringify(error, null, 2))
  } else {
    console.log('Insert succeeded! Created job:', JSON.stringify(data, null, 2))
  }
}

testInsert()
