
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testWorkerIdNotNull() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
  const testClientId = profiles[0].id

  console.log('Testing insert without worker_id but with new columns...')
  const { error } = await supabase.from('jobs').insert({
    client_id: testClientId,
    title: 'Marketplace Job Test',
    description: 'Testing if worker_id is required',
    price: 500,
    location: 'Sandton',
    status: 'pending'
  })

  if (error) {
    console.log('Error Code:', error.code)
    console.log('Error Message:', error.message)
  } else {
    console.log('Insert succeeded! worker_id is NULLABLE.')
  }
}

testWorkerIdNotNull()
