import { getDrinkAddon, getPurchasePackage } from "./purchase-packages.mjs"

export const GUEST_PAYMENT_CHOICE_PREVIEW_FLAG = "JJ_GUEST_PAYMENT_CHOICE_PREVIEW"
const recurringPackageIds = new Set(["12-clases", "16-clases", "unlimited"])

// Called on the server and passed as a boolean prop. Production always keeps
// the existing checkout, even if the opt-in flag was accidentally configured.
export function guestPaymentChoicePreviewEnabled(env = {}) {
  return env.VERCEL_ENV === "preview" && env.JJ_GUEST_PAYMENT_CHOICE_PREVIEW === "true"
}

export function supportsGuestSubscription(packageId) {
  return recurringPackageIds.has(packageId)
}

export function guestPaymentQuote({ packageId, drinkAddonId = "none", choice = "once" } = {}) {
  const pack = getPurchasePackage(packageId)
  const drinks = getDrinkAddon(drinkAddonId)
  if (!pack || !drinks || !["once", "subscription"].includes(choice)) throw new TypeError("La selección de prueba no es válida.")
  if (choice === "subscription" && !supportsGuestSubscription(packageId)) throw new TypeError("Este paquete solo admite compra única.")
  return Object.freeze({
    choice,
    packageId: pack.id,
    packageName: pack.displayName || pack.name,
    classAmount: pack.regularAmount,
    drinkAddonId: drinks.id,
    drinkAddonAmount: drinks.amount,
    drinkAddonQuantity: drinks.quantity,
    includedDrinks: pack.includedDrinks,
    initialAmount: pack.regularAmount + drinks.amount,
    recurringAmount: choice === "subscription" ? pack.regularAmount : 0,
    billingDays: choice === "subscription" ? 30 : null,
    currency: "MXN",
    taxIncluded: true,
  })
}

export function simulateGuestPayment({ packageId, drinkAddonId = "none", choice, studioTermsAccepted, recurringAccepted = false } = {}) {
  if (!["once", "subscription"].includes(choice)) throw new TypeError("Elige cómo quieres pagar.")
  if (studioTermsAccepted !== true) throw new TypeError("Acepta los términos antes de probar esta opción.")
  if (choice === "subscription" && recurringAccepted !== true) throw new TypeError("Confirma por separado la renovación cada 30 días.")
  const quote = guestPaymentQuote({ packageId, drinkAddonId, choice })
  return Object.freeze({
    simulated: true,
    charged: false,
    subscriptionCreated: false,
    accountCreated: false,
    classesAssigned: false,
    quote,
  })
}
