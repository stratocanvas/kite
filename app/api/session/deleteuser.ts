'use server'
import { createClient } from '@supabase/supabase-js'

const supabaseurl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const servicerolekey = process.env.SUPABASE_SERVICE_ROLE_KEY!


const supabase = createClient(supabaseurl, servicerolekey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

//Access auth admin api
const adminAuthClient = supabase.auth.admin

export async function deleteUser(id: string) {
  const { data, error } = await adminAuthClient.deleteUser(id)
  console.log(data)
  return data
}

