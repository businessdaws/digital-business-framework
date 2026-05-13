import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Vite embeds VITE_ vars at build time
// These will be replaced with actual values during Vercel build
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const url = SUPABASE_URL.trim().replace(/\/+$/, '')
const key = SUPABASE_ANON_KEY.trim()

export const isSupabaseConnected = Boolean(
  url && 
  url.startsWith('https://') && 
  url.includes('.supabase.co') &&
  key &&
  key.length > 20
)

export const supabase: SupabaseClient | null = isSupabaseConnected
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null

// Debug — visible in Vercel function logs
if (typeof window !== 'undefined') {
  console.log('[Supabase] URL detected:', Boolean(url))
  console.log('[Supabase] Key detected:', Boolean(key))
  console.log('[Supabase] Connected:', isSupabaseConnected)
}
