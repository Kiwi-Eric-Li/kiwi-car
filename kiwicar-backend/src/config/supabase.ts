import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Admin client — bypasses RLS, used for server-side operations
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

// Per-request client that respects the user's auth context
export function createSupabaseClient(accessToken: string): SupabaseClient {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
  );
}
