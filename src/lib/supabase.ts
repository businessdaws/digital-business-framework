import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use a safe initialization to prevent crashing if credentials are missing
export const supabase = (url && key) 
  ? createClient(url, key) 
  : null

export const isSupabaseConnected = !!supabase
