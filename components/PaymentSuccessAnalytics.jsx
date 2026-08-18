"use client"

import { useEffect } from "react"
import { track } from "@vercel/analytics"
import { trackMetaEvent } from "@/lib/meta-pixel"

export default function PaymentSuccessAnalytics({ packageId, amount, drinks, reference }) {
  useEffect(() => {
    const storageKey = reference ? `jjstudio:purchase-tracked:${reference}` : ""
    if (storageKey && window.sessionStorage.getItem(storageKey)) return

    track("payment_confirmed", {
      package: packageId || "unknown",
      amount: amount || 0,
      drinks: drinks || 0,
    })
    trackMetaEvent("Purchase", {
      content_ids: [packageId || "unknown"],
      content_type: "product",
      currency: "MXN",
      num_items: 1,
      value: amount || 0,
    })

    if (storageKey) window.sessionStorage.setItem(storageKey, "1")
  }, [amount, drinks, packageId, reference])

  return null
}
