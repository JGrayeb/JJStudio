export const PURCHASE_PACKAGES = [
  {
    id: "1-muestra",
    name: "1 muestra",
    category: "Muestra",
    classes: 1,
    regularAmount: 245,
    nesstyAmount: 245,
    stripeAmount: 245,
    perClass: 245,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "3-muestra",
    name: "3 muestra",
    category: "Muestra",
    classes: 3,
    regularAmount: 720,
    nesstyAmount: 720,
    stripeAmount: 720,
    perClass: 240,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "1-clase",
    name: "1 clase",
    category: "Normal",
    classes: 1,
    regularAmount: 360,
    nesstyAmount: 360,
    stripeAmount: 350,
    perClass: 350,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "4-clases",
    name: "4 clases",
    category: "Normal",
    classes: 4,
    regularAmount: 1390,
    nesstyAmount: 1390,
    stripeAmount: 1350,
    perClass: 337.5,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "8-clases",
    name: "8 clases",
    category: "Normal",
    classes: 8,
    regularAmount: 2550,
    nesstyAmount: 2550,
    stripeAmount: 2450,
    perClass: 306.25,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "12-clases",
    name: "12 clases",
    category: "Oferta",
    classes: 12,
    regularAmount: 3360,
    nesstyAmount: 3024,
    stripeAmount: 3000,
    perClass: 250,
    drinks: "3 bebidas",
    includedDrinks: 3,
  },
  {
    id: "16-clases",
    name: "16 clases",
    category: "Oferta",
    classes: 16,
    regularAmount: 4050,
    nesstyAmount: 3645,
    stripeAmount: 3600,
    perClass: 225,
    drinks: "3 bebidas",
    includedDrinks: 3,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    category: "Oferta",
    classes: null,
    regularAmount: 4450,
    nesstyAmount: 4005,
    stripeAmount: 3900,
    perClass: null,
    drinks: "5 bebidas",
    includedDrinks: 5,
  },
]

export const DRINK_ADDONS = [
  { id: "none", name: "Sin extras", quantity: 0, amount: 0, perDrink: null },
  { id: "1-bebida", name: "+1", quantity: 1, amount: 132, perDrink: 132 },
  { id: "3-bebidas", name: "+3", quantity: 3, amount: 390, perDrink: 130 },
  { id: "5-bebidas", name: "+5", quantity: 5, amount: 625, perDrink: 125, badge: "Más elegido" },
  { id: "8-bebidas", name: "+8", quantity: 8, amount: 960, perDrink: 120 },
  { id: "10-bebidas", name: "+10", quantity: 10, amount: 1150, perDrink: 115, badge: "Mejor precio" },
]

export const DEFAULT_PURCHASE_PACKAGE_ID = "unlimited"

export function getPurchasePackage(packageId) {
  return PURCHASE_PACKAGES.find((item) => item.id === packageId) ?? null
}

export function getDrinkAddon(addonId) {
  return DRINK_ADDONS.find((item) => item.id === addonId) ?? null
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
