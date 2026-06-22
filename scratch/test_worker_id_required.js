
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testWorkerIdRequired() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
  const testClientId = profiles[0].id

  console.log('Testing insert without worker_id...')
  const { error } = await supabase.from('jobs').insert({
    client_id: testClientId,
    title: 'No Worker Job',
    description: 'Testing if worker_id is required',
    status: 'pending'
  })

  if (error) {
    console.error('Insert failed:', error.message)
  } else {
    console.log('Insert succeeded without worker_id!')
  }
}

testWorkerIdRequired()
