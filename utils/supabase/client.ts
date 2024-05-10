import { createBrowserClient } from '@supabase/ssr'
const supabaseurl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseanonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(
    supabaseurl,
    supabaseanonkey,
  )
}

