import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const isSupabaseConnected = !!(
  url && url.startsWith('https://') && key
)

export const supabase = isSupabaseConnected
  ? createClient(url, key)
  : null
