import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getSupabasePublicConfig } from "@/lib/supabase/config.mjs"
import { SubscriptionError, subscriptionSettings } from "@/lib/subscriptions-domain.mjs"

export function subscriptionDatabase() {
  const config = getSupabasePublicConfig()
  const settings = subscriptionSettings()
  if (!config || !settings.serviceKey) throw new SubscriptionError("Las suscripciones todavía están en preparación. La compra única sigue disponible.", 503, "not_configured")
  return createClient(config.url, settings.serviceKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}

export async function subscriptionIdentity(request, { admin = false } = {}) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer ([^\s]+)$/i)?.[1]
  if (!bearer || bearer.length > 8192) throw new SubscriptionError("Entra a tu cuenta para continuar.", 401, "unauthorized")
  const config = getSupabasePublicConfig()
  if (!config) throw new SubscriptionError("El acceso a tu cuenta no está disponible temporalmente.", 503)
  const authClient = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const { data, error } = await authClient.auth.getUser(bearer)
  if (error || !data?.user?.id || !data.user.email || !data.user.email_confirmed_at) throw new SubscriptionError("Vuelve a entrar con tu correo confirmado.", 401, "unauthorized")
  const user = data.user
  const db = subscriptionDatabase()
  if (admin) {
    const result = await db.from("site_admins").select("email").eq("email", user.email.toLowerCase()).maybeSingle()
    if (result.error) throw new SubscriptionError("No pudimos comprobar los permisos administrativos.", 503)
    if (!result.data) throw new SubscriptionError("Esta cuenta no tiene permisos administrativos.", 403, "forbidden")
  }
  return { user, db, settings: subscriptionSettings() }
}

export function assertDatabase(result) {
  if (result.error) throw new SubscriptionError("No pudimos guardar o consultar tu suscripción. Intenta nuevamente.", 503, "database_error")
  return result.data
}
