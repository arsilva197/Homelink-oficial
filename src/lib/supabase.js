// HomeLink — Supabase client
// Falls back to demo/mock mode when env vars are not set.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const demoMode     = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

/** True when Supabase credentials are present and demo mode is off */
export const isSupabaseEnabled =
  !demoMode && supabaseUrl.startsWith('https://') && supabaseKey.length > 20

/** Supabase client — only use after checking isSupabaseEnabled */
export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

/**
 * Subscribe to real-time changes on a table.
 * Returns an unsubscribe function; call it in useEffect cleanup.
 *
 * @param {string} table - table name
 * @param {(payload: object) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeTable(table, callback) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`rt_${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
