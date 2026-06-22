
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  // We need a valid user ID to test client_id. 
  // I'll try to find one from the profiles table.
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1)
  if (pError || !profiles || profiles.length === 0) {
    console.error('Could not find a profile to test with:', pError)
    return
  }

  const testClientId = profiles[0].id
  console.log('Testing insert with client_id:', testClientId)

  const { data, error } = await supabase.from('jobs').insert({
    client_id: testClientId,
    title: 'Test Job',
    description: 'Test Description',
    price: 100,
    location: 'Test Location',
    status: 'pending'
  })

  if (error) {
    console.error('Insert failed with error:', error)
  } else {
    console.log('Insert succeeded (unexpectedly if worker_id is required):', data)
  }
}

testInsert()
