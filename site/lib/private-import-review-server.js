import "server-only"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getSupabasePublicConfig } from "@/lib/supabase/config.mjs"
import { PRIVATE_IMPORT_REVIEW_ADMINS, PrivateImportReviewError, importReviewEnabled, parseImportReviewQuery, importReviewResponse } from "@/lib/private-import-review-domain.mjs"

const headers = { "cache-control": "private, no-store", "vary": "Authorization, X-JJ-Review-Search", "x-robots-tag": "noindex, nofollow" }
const json = (value, status = 200, extraHeaders = {}) => NextResponse.json(value, { status, headers: { ...headers, ...extraHeaders } })
const clientOptions = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }

function requireEnabled() {
  if (!importReviewEnabled()) throw new PrivateImportReviewError("Esta revisión privada no está disponible en este entorno.", 404, "private_review_unavailable")
}

async function reviewIdentity(request) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer ([^\s]+)$/i)?.[1]
  if (!bearer || bearer.length > 8192) throw new PrivateImportReviewError("Entra con una cuenta administrativa para revisar los datos.", 401, "unauthorized")
  const config = getSupabasePublicConfig()
  if (!config) throw new PrivateImportReviewError("La conexión privada no está disponible temporalmente.", 503, "private_review_unavailable")
  const auth = createClient(config.url, config.key, clientOptions)
  const { data, error } = await auth.auth.getUser(bearer)
  if (error || !data?.user?.id || !data.user.email || !data.user.email_confirmed_at || data.user.is_anonymous === true) throw new PrivateImportReviewError("Vuelve a entrar con tu correo administrativo confirmado.", 401, "unauthorized")
  const email = data.user.email.toLowerCase()
  if (!PRIVATE_IMPORT_REVIEW_ADMINS.includes(email)) throw new PrivateImportReviewError("Esta cuenta no tiene permisos para revisar estos datos.", 403, "forbidden")
  const key = process.env.JJStudio_SUPABASE_SECRET_KEY || process.env.JJStudio_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!key) throw new PrivateImportReviewError("La conexión privada no está disponible temporalmente.", 503, "private_review_unavailable")
  const db = createClient(config.url, key, clientOptions)
  const access = await db.from("site_admins").select("email").eq("email", email).maybeSingle()
  if (access.error) throw new PrivateImportReviewError("No pudimos comprobar tus permisos. Intenta nuevamente.", 503, "admin_check_unavailable")
  if (!access.data) throw new PrivateImportReviewError("Esta cuenta no tiene permisos para revisar estos datos.", 403, "forbidden")
  return db
}

export async function getPrivateImportReview(request) {
  requireEnabled()
  const db = await reviewIdentity(request)
  const query = parseImportReviewQuery(request.url, { searchHeader: request.headers.get("x-jj-review-search") })
  const result = await db.rpc("jj_read_private_import_review", { p_view: query.view, p_search: query.q, p_page: query.page, p_record_id: query.recordId })
  if (result.error) throw new PrivateImportReviewError("No pudimos consultar la revisión privada. Intenta nuevamente.", 503, "review_read_unavailable")
  return json(importReviewResponse(result.data, query))
}

export async function privateImportReviewRoute(handler) {
  try { return await handler() }
  catch (error) {
    // Do not log request URLs, headers, names, queries, contacts or RPC errors.
    const known = error instanceof PrivateImportReviewError
    return json({ error: known ? error.message : "No pudimos consultar la revisión privada. Intenta nuevamente.", code: known ? error.code : "review_read_unavailable" }, known ? error.status : 503)
  }
}

export function privateImportReviewMethodNotAllowed() {
  return json({ error: "Esta revisión solo permite consultar datos.", code: "method_not_allowed" }, 405, { Allow: "GET" })
}
