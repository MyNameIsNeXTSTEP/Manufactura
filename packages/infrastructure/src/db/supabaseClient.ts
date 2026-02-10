import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { appEnv } from "@manufactura/shared";

export function createSupabaseAdminClient(): SupabaseClient {
  if (!appEnv.supabasePublicUrl || !appEnv.supabaseSecretKey) {
    throw new Error(
      "Supabase client configuration is missing. Check SUPABASE_PUBLIC_URL and SUPABASE_SECRET_KEY."
    );
  }

  return createClient(appEnv.supabasePublicUrl, appEnv.supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
