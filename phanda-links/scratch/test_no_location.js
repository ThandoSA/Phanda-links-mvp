
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsertNoLocation() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
  const testClientId = profiles[0].id

  console.log('Testing insert without location...')
  const { error } = await supabase.from('jobs').insert({
    client_id: testClientId,
    title: 'Test Job No Location',
    description: 'Testing if location is the problem',
    price: 100,
    status: 'pending'
  })

  if (error) {
    console.error('Insert failed:', error.message)
    if (error.message.includes('column')) {
        console.log('Error still mentions a column issue.')
    }
  } else {
    console.log('Insert succeeded without location!')
  }
}

testInsertNoLocation()
