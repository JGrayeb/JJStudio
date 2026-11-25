// Noncritical telemetry only. Payment verification remains on the server;
// this module must never decide whether a customer has paid.
const referenceKey = reference => typeof reference === "string" && /^cs_[A-Za-z0-9_]{1,496}$/.test(reference)
  ? `jjstudio:purchase-tracked:${reference}`
  : null

function safelyCall(callback, ...args) {
  try {
    const result = callback?.(...args)
    // Analytics adapters are normally synchronous, but rejected async adapters
    // must not become an unhandled error on an already-paid confirmation page.
    if (result && typeof result.then === "function") Promise.resolve(result).catch(() => {})
  } catch {
    // A blocked pixel or analytics provider must not break the receipt.
  }
}

export function createPaymentSuccessTracker() {
  // Per exact Checkout reference, not one global "paid" flag. This also covers
  // Strict Mode/remounts when an in-app browser blocks sessionStorage entirely.
  const trackedReferences = new Set()

  return function trackPaymentSuccess({ packageId, amount, drinks, reference } = {}, {
    getSessionStorage = () => typeof window === "undefined" ? null : window.sessionStorage,
    trackEvent,
    trackMetaEvent,
  } = {}) {
    const key = referenceKey(reference)
    // Never merge unrelated/missing references into one anonymous paid event.
    if (!key || trackedReferences.has(key)) return false

    let storage = null
    try {
      storage = getSessionStorage()
      if (storage?.getItem(key)) {
        trackedReferences.add(key)
        return false
      }
    } catch {
      // Includes a throwing storage property getter as well as getItem.
    }

    // Mark before callbacks so reentrant providers cannot duplicate this event.
    trackedReferences.add(key)
    safelyCall(trackEvent, "payment_confirmed", {
      package: packageId || "unknown",
      amount: amount || 0,
      drinks: drinks || 0,
    })
    safelyCall(trackMetaEvent, "Purchase", {
      content_ids: [packageId || "unknown"],
      content_type: "product",
      currency: "MXN",
      num_items: 1,
      value: amount || 0,
    })
    try { storage?.setItem(key, "1") } catch {
      // The in-memory marker still prevents a duplicate in this page lifetime.
    }
    return true
  }
}

export const trackPaymentSuccess = createPaymentSuccessTracker()
