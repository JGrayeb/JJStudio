export const PURCHASE_PACKAGES = [
  {
    id: "12-clases",
    name: "12 clases",
    nesstyAmount: 3024,
    stripeAmount: 3000,
    perClass: 250,
    drinks: "3 bebidas",
  },
  {
    id: "16-clases",
    name: "16 clases",
    nesstyAmount: 3645,
    stripeAmount: 3600,
    perClass: 225,
    drinks: "3 bebidas",
  },
  {
    id: "unlimited",
    name: "Unlimited",
    nesstyAmount: 4005,
    stripeAmount: 3900,
    perClass: null,
    drinks: "5 bebidas",
  },
]

export const DEFAULT_PURCHASE_PACKAGE_ID = "unlimited"

export function getPurchasePackage(packageId) {
  return PURCHASE_PACKAGES.find((item) => item.id === packageId) ?? null
}

export function getCheckoutReturnOrigin({ vercelEnv, vercelUrl, siteUrl }) {
  if (vercelEnv === "preview" && vercelUrl) return `https://${vercelUrl}`
  return siteUrl
}

export function formatMxn(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
