import { createClient } from "@supabase/supabase-js"
import { getSupabasePublicConfig } from "@/lib/supabase/config.mjs"

let client

export function getSupabaseBrowserClient() {
  const config = getSupabasePublicConfig()
  if (!config) return null
  if (!client) client = createClient(config.url, config.key)
  return client
}
