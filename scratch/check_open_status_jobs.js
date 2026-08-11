const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ilnscaylznwtcsyztkbs.supabase.co'
const supabaseAnonKey = 'sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkOpenStatusJobs() {
  const { data, count, error } = await supabase
    .from('jobs')
    .select('id, status, worker_id, title, created_at', { count: 'exact' })
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Query failed:', error)
    return
  }

  console.log('Open jobs count:', count)
  if (!data || data.length === 0) {
    console.log('No open jobs found.')
    return
  }

  data.forEach((job) => {
    console.log(`- id=${job.id}, status=${job.status}, worker_id=${job.worker_id}, title=${job.title}, created_at=${job.created_at}`)
  })
}

checkOpenStatusJobs()
