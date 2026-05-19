
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testWorkingInsert() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(2)
  if (!profiles || profiles.length < 1) {
    console.error('No profiles found')
    return
  }
  const testClientId = profiles[0].id
  const testWorkerId = profiles[1] ? profiles[1].id : profiles[0].id

  console.log('Testing insert with only base columns...')
  const { error } = await supabase.from('jobs').insert({
    client_id: testClientId,
    worker_id: testWorkerId,
    title: 'Minimal Job',
    description: 'Minimal Description',
    status: 'pending'
  })

  if (error) {
    console.error('Insert failed:', error.message)
  } else {
    console.log('Insert succeeded with base columns!')
  }
}

testWorkingInsert()
