export function selectSupabasePublicConfig({
  jjUrl,
  jjPublishableKey,
  jjAnonKey,
  genericUrl,
  genericPublishableKey,
  genericAnonKey,
}) {
  const jjKey = jjPublishableKey || jjAnonKey
  if (jjUrl && jjKey) return { url: jjUrl, key: jjKey }

  const genericKey = genericPublishableKey || genericAnonKey
  if (genericUrl && genericKey) return { url: genericUrl, key: genericKey }

  return null
}

export function getSupabasePublicConfig() {
  return selectSupabasePublicConfig({
    jjUrl: process.env.NEXT_PUBLIC_JJStudio_SUPABASE_URL,
    jjPublishableKey: process.env.NEXT_PUBLIC_JJStudio_SUPABASE_PUBLISHABLE_KEY,
    jjAnonKey: process.env.NEXT_PUBLIC_JJStudio_SUPABASE_ANON_KEY,
    genericUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    genericPublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    genericAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
