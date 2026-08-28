const formatMxn = (value) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: Number(value) % 1 ? 2 : 0,
  maximumFractionDigits: 2,
}).format(Number(value))

const finiteNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizePublicPromotion(data, fallback) {
  if (!data) return null

  const discountPercent = finiteNumber(data.discount_percent)
  const trialPrice = finiteNumber(data.trial_price)
  const fallbackPackages = new Map((fallback?.packages || []).map((item) => [item.name, item]))
  const sourcePackages = Array.isArray(data.packages) && data.packages.length ? data.packages : fallback?.packages || []

  return {
    name: data.name || fallback?.name || "Promoción del mes",
    code: data.code || fallback?.code || "",
    active: data.active !== false,
    startsAt: data.starts_at || fallback?.startsAt || null,
    endsAt: data.ends_at || fallback?.endsAt || null,
    discountLabel: discountPercent == null ? fallback?.discountLabel || "Promoción especial" : `${discountPercent}% en Nessty`,
    trialClass: {
      name: fallback?.trialClass?.name || "Clase de muestra",
      price: trialPrice == null ? fallback?.trialClass?.price || "" : formatMxn(trialPrice),
      guestLabel: data.trial_guest_label || fallback?.trialClass?.guestLabel || "",
    },
    packages: sourcePackages.map((item) => {
      const packageFallback = fallbackPackages.get(item.name) || {}
      const nessty = finiteNumber(item.nessty)
      const nesstyPerClass = finiteNumber(item.nesstyPerClass)
      const frontDesk = finiteNumber(item.frontDesk)
      const frontDeskPerClass = finiteNumber(item.frontDeskPerClass)
      const drinks = finiteNumber(item.drinks)

      return {
        name: item.name || packageFallback.name || "Paquete",
        nessty: nessty == null ? packageFallback.nessty || "" : formatMxn(nessty),
        nesstyPerClass: nesstyPerClass == null ? packageFallback.nesstyPerClass ?? null : formatMxn(nesstyPerClass),
        frontDesk: frontDesk == null ? packageFallback.frontDesk || "" : formatMxn(frontDesk),
        frontDeskPerClass: frontDeskPerClass == null ? packageFallback.frontDeskPerClass ?? null : formatMxn(frontDeskPerClass),
        drinks: drinks == null ? packageFallback.drinks || "0 bebidas" : `${drinks} bebidas`,
      }
    }),
  }
}
