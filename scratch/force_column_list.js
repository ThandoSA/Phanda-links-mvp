
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://ilnscaylznwtcsyztkbs.supabase.co"
const supabaseAnonKey = "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listColumns() {
  console.log('Attempting to list columns of "jobs" table...')
  // We can try to insert a row with a deliberate error in a column name
  // PostgREST sometimes returns the list of valid columns in the error for a bad column.
  const { error } = await supabase.from('jobs').insert({ non_existent_column: 'test' })
  
  if (error) {
    console.log('Error message:', error.message)
    console.log('Error details:', error.details)
    console.log('Error hint:', error.hint)
  }
}

listColumns()
