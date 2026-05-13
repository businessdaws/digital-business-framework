import { createClient } from '@supabase/supabase-js'

declare const __SUPABASE_URL__: string
declare const __SUPABASE_KEY__: string

const url = (
  import.meta.env.VITE_SUPABASE_URL || 
  (typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '')
).trim().replace(/\/+$/, '')

const key = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof __SUPABASE_KEY__ !== 'undefined' ? __SUPABASE_KEY__ : '')
).trim()

export const isSupabaseConnected = !!(
  url && url.startsWith('https://') && key
)

export const supabase = isSupabaseConnected 
  ? createClient(url, key) 
  : null
