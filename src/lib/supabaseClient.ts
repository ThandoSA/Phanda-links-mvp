import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Public (client-side) Supabase keys must be prefixed with NEXT_PUBLIC_ in Next.js.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY'
	)
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)