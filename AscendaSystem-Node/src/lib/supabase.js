import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export const supabaseAdmin = env.hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured. Set DATA_PROVIDER=supabase and fill Supabase keys.");
  }

  return supabaseAdmin;
}

export function createUserSupabase(accessToken) {
  if (!env.hasSupabaseConfig) {
    throw new Error("Supabase is not configured");
  }

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
