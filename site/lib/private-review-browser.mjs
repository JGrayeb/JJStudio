export const PRIVATE_REVIEW_ADMINS = Object.freeze(["administracion@jjstudio.mx", "jucagrape@gmail.com"])

export function privateReviewAdmin(email) {
  return typeof email === "string" && PRIVATE_REVIEW_ADMINS.includes(email.trim().toLowerCase())
}

export function createPrivateReviewTransport({ getToken, fetchImpl = globalThis.fetch, onUnauthorized = () => {} }) {
  return async function request(path, { signal } = {}) {
    if (typeof path !== "string" || !/^\/api\/admin\/import-review(?:\?|$)/.test(path)) throw new Error("Consulta privada no permitida.")
    const url = new URL(path, "https://review.invalid")
    if (url.pathname !== "/api/admin/import-review" || url.hash || url.searchParams.getAll("q").length > 1) throw new Error("Consulta privada no permitida.")
    const search = url.searchParams.get("q") || ""
    if (search.length > 80 || /[\u0000-\u001f\u007f]/u.test(search)) throw new Error("La búsqueda debe tener hasta 80 caracteres.")
    // Search terms can contain personal data: never put them in request URLs/logs.
    url.searchParams.delete("q")
    const token = await getToken()
    if (!token || typeof token !== "string") { onUnauthorized(); throw new Error("Entra de nuevo con tu correo administrativo.") }
    const headers = { Authorization: `Bearer ${token}`, "X-JJ-Review-Search": encodeURIComponent(search) }
    const controller = new AbortController()
    const abort = () => controller.abort()
    if (signal?.aborted) controller.abort()
    signal?.addEventListener("abort", abort, { once: true })
    const timer = setTimeout(abort, 20000)
    try {
      const response = await fetchImpl(`${url.pathname}${url.search}`, { method: "GET", headers, cache: "no-store", mode: "same-origin", credentials: "same-origin", redirect: "error", referrerPolicy: "no-referrer", signal: controller.signal })
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) onUnauthorized()
        const message = response.status === 401 ? "Entra de nuevo con tu correo administrativo." : response.status === 403 ? "Esta cuenta no tiene acceso a la revisión privada." : response.status === 400 ? "Revisa la búsqueda o vuelve a la lista de contactos." : "No pudimos consultar los registros. Intenta nuevamente."
        const error = new Error(message); error.status = response.status; throw error
      }
      return await response.json()
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener("abort", abort)
    }
  }
}
