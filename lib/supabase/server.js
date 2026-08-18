import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getSupabasePublicConfig } from "@/lib/supabase/config.mjs"

export async function getActivePromotion({ throwOnError = false } = {}) {
  const config = getSupabasePublicConfig()
  if (!config) {
    if (throwOnError) throw new Error("Supabase public configuration is incomplete")
    return null
  }

  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("site_promotions")
    .select("name,code,discount_percent,active,starts_at,ends_at,trial_price,trial_guest_label,packages")
    .eq("active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(JSON.stringify({ level: "error", message: "Active promotion lookup failed", error: error.message }))
    if (throwOnError) throw error
    return null
  }
  return data
}

export async function getBeveragePrices() {
  const config = getSupabasePublicConfig()
  if (!config) return []

  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { data, error } = await supabase
    .from("site_beverage_prices")
    .select("item_key,price,updated_at")
    .order("display_order", { ascending: true })

  if (error) {
    console.error(JSON.stringify({ level: "error", message: "Beverage price lookup failed", error: error.message }))
    return []
  }
  return data ?? []
}
