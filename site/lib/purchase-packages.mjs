// Release-wide commercial policy: never revive expired discounts from cached
// browser choices, old promotion rows or the independent direct-price table.
export const REGULAR_PRICING_ONLY = true
export const REGULAR_DRINK_UNIT_PRICE = 99

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
    displayName: "Intro · 3 clases",
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
    stripeAmount: 360,
    perClass: 360,
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
    stripeAmount: 1390,
    perClass: 347.5,
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
    stripeAmount: 2550,
    perClass: 318.75,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "12-clases",
    name: "12 clases",
    badge: "Más elegido",
    category: "Normal",
    classes: 12,
    regularAmount: 3360,
    nesstyAmount: 3360,
    stripeAmount: 3360,
    perClass: 280,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "16-clases",
    name: "16 clases",
    category: "Normal",
    classes: 16,
    regularAmount: 4050,
    nesstyAmount: 4050,
    stripeAmount: 4050,
    perClass: 253.125,
    drinks: null,
    includedDrinks: 0,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    category: "Normal",
    classes: null,
    regularAmount: 4450,
    nesstyAmount: 4450,
    stripeAmount: 4450,
    perClass: null,
    drinks: null,
    includedDrinks: 2,
  },
]

export const DRINK_ADDONS = [
  { id: "none", name: "Sin extras", quantity: 0, amount: 0, perDrink: null },
  { id: "1-bebida", name: "+1", quantity: 1, amount: 99, perDrink: 99 },
  { id: "3-bebidas", name: "+3", quantity: 3, amount: 297, perDrink: 99 },
  { id: "5-bebidas", name: "+5", quantity: 5, amount: 495, perDrink: 99 },
  { id: "8-bebidas", name: "+8", quantity: 8, amount: 792, perDrink: 99 },
  { id: "10-bebidas", name: "+10", quantity: 10, amount: 990, perDrink: 99 },
]

export const DEFAULT_PURCHASE_PACKAGE_ID = "1-muestra"

const roundMoney = (value) => Math.round(Number(value) * 100) / 100
const finiteNumber = (value) => {
  if (value === null || value === undefined || value === "") return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

export function expandPromotionPackages(packages = [], discountPercent = 0) {
  if (REGULAR_PRICING_ONLY) return regularPackagePrices()
  const storedPackages = new Map(
    (Array.isArray(packages) ? packages : []).map((item) => [String(item?.name || "").trim().toLowerCase(), item]),
  )
  const normalizedDiscount = Math.min(100, Math.max(0, Number(discountPercent) || 0))

  return PURCHASE_PACKAGES.map((packageConfig) => {
    const storedPackage = storedPackages.get(packageConfig.name.toLowerCase()) || {}
    const storedDirectAmount = finiteNumber(storedPackage.frontDesk)
    const storedDrinks = finiteNumber(storedPackage.drinks)
    const nessty = roundMoney(packageConfig.regularAmount * (1 - (normalizedDiscount / 100)))
    const frontDesk = storedDirectAmount != null && storedDirectAmount > 0
      ? storedDirectAmount
      : packageConfig.stripeAmount
    const drinks = storedDrinks != null && storedDrinks >= 0 ? storedDrinks : packageConfig.includedDrinks

    return {
      name: packageConfig.name,
      nessty,
      frontDesk,
      drinks,
      nesstyPerClass: packageConfig.classes ? roundMoney(nessty / packageConfig.classes) : null,
      frontDeskPerClass: packageConfig.classes && frontDesk
        ? roundMoney(frontDesk / packageConfig.classes)
        : null,
    }
  })
}

export function mergePackagePriceRows(packages = [], rows = [], discountPercent = 0) {
  if (REGULAR_PRICING_ONLY) return regularPackagePrices()
  const rowsById = new Map((rows || []).map((row) => [row.package_id, row]))
  return expandPromotionPackages(packages, discountPercent).map((item) => {
    const packageConfig = PURCHASE_PACKAGES.find((config) => config.name === item.name)
    const row = rowsById.get(packageConfig.id)
    if (!row) return item
    const frontDesk = finiteNumber(row.direct_amount)
    const drinks = finiteNumber(row.included_drinks)
    return {
      ...item,
      frontDesk: frontDesk != null && frontDesk > 0 ? frontDesk : item.frontDesk,
      drinks: drinks != null && drinks >= 0 ? drinks : item.drinks,
      frontDeskPerClass: packageConfig.classes && frontDesk > 0
        ? roundMoney(frontDesk / packageConfig.classes)
        : item.frontDeskPerClass,
    }
  })
}

export function createPackagePriceRows(packages, updatedAt) {
  return packages.map((item) => ({
    package_id: PURCHASE_PACKAGES.find((config) => config.name === item.name).id,
    direct_amount: Number(item.frontDesk),
    included_drinks: Number(item.drinks),
    updated_at: updatedAt,
  }))
}

export function getPurchasePackage(packageId) {
  return PURCHASE_PACKAGES.find((item) => item.id === packageId) ?? null
}

export function getDrinkAddon(addonId) {
  return DRINK_ADDONS.find((item) => item.id === addonId) ?? null
}

export function regularPackagePrices() {
  return PURCHASE_PACKAGES.map((item) => ({
    name: item.name,
    nessty: item.regularAmount,
    frontDesk: item.regularAmount,
    drinks: item.includedDrinks,
    nesstyPerClass: item.classes ? roundMoney(item.regularAmount / item.classes) : null,
    frontDeskPerClass: item.classes ? roundMoney(item.regularAmount / item.classes) : null,
  }))
}

const numberFromPrice = (value) => Number(String(value ?? "0").replace(/[^0-9.-]/g, "")) || 0

export function resolveDirectPackagePricing({
  selectedPackage,
  packagePrices = null,
  activePromotion = null,
  requestedPromotionCode = null,
  promotionAccepted = true,
}) {
  if (!selectedPackage) return null
  if (REGULAR_PRICING_ONLY) {
    const canonical = getPurchasePackage(selectedPackage.id)
    if (!canonical) return null
    return { amount: canonical.regularAmount, includedDrinks: canonical.includedDrinks, promotionApplied: false, promotionCode: "" }
  }

  const configuredPackage = packagePrices?.find(
    (item) => item.name?.trim().toLowerCase() === selectedPackage.name.toLowerCase(),
  )
  const directAmount = numberFromPrice(configuredPackage?.frontDesk)
  if (directAmount > 0) {
    return {
      amount: directAmount,
      includedDrinks: numberFromPrice(configuredPackage.drinks),
      promotionApplied: false,
      promotionCode: "",
    }
  }

  const promotionPackage = activePromotion?.packages?.find(
    (item) => item.name?.toLowerCase() === selectedPackage.name.toLowerCase(),
  )
  const configuredAmount = numberFromPrice(promotionPackage?.frontDesk)
  const codeMatches = !requestedPromotionCode || !activePromotion?.code || requestedPromotionCode === activePromotion.code
  const promotionApplied = Boolean(
    selectedPackage.category === "Oferta"
    && promotionAccepted
    && activePromotion
    && codeMatches
    && promotionPackage
    && configuredAmount > 0,
  )

  if (promotionApplied) {
    return {
      amount: configuredAmount,
      includedDrinks: numberFromPrice(promotionPackage.drinks),
      promotionApplied: true,
      promotionCode: activePromotion.code,
    }
  }

  const configuredStandardPackage = selectedPackage.category !== "Oferta"
    && promotionPackage
    && configuredAmount > 0

  if (configuredStandardPackage) {
    return {
      amount: configuredAmount,
      includedDrinks: numberFromPrice(promotionPackage.drinks),
      promotionApplied: false,
      promotionCode: "",
    }
  }

  const usesRegularFallback = selectedPackage.category === "Oferta"
  return {
    amount: usesRegularFallback ? selectedPackage.regularAmount : selectedPackage.stripeAmount,
    includedDrinks: usesRegularFallback ? 0 : selectedPackage.includedDrinks,
    promotionApplied: false,
    promotionCode: "",
  }
}

export function getCheckoutReturnOrigin({ vercelEnv, vercelUrl, siteUrl }) {
  if (vercelEnv === "preview" && vercelUrl) return `https://${vercelUrl}`
  return siteUrl
}

export function formatMxn(amount) {
  const numericAmount = Number(amount)
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: Number.isInteger(numericAmount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}
