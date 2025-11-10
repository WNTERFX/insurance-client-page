// src/dbServer.js
import { createClient } from '@supabase/supabase-js';

/* Read envs in BOTH CRA and Vite apps */
const VITE = (typeof import.meta !== 'undefined' && import.meta.env) || {};

const SUPABASE_URL =
  VITE.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_URL);

const SUPABASE_ANON_KEY =
  VITE.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_ANON_KEY);

/* Gentle warning if missing (don’t print secrets) */
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] Missing env vars. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (Vite) ' +
      'or REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY (CRA) in .env.local, then restart.'
  );
}

/* Single shared client */
export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default db;

/* ---- Optional quick debug (local only) ----
if (typeof window !== 'undefined' && process?.env?.NODE_ENV === 'development') {
  console.log('[ENV] SUPABASE_URL:', SUPABASE_URL);
  console.log('[ENV] ANON prefix:', (SUPABASE_ANON_KEY || '').slice(0, 8) + '…');
}
*/
