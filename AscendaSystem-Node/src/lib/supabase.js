import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function createUserSupabase(accessToken) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
