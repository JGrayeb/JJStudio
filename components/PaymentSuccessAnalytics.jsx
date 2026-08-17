"use client"

import { useEffect } from "react"
import { track } from "@vercel/analytics"

export default function PaymentSuccessAnalytics({ packageId, amount, drinks }) {
  useEffect(() => {
    track("payment_confirmed", {
      package: packageId || "unknown",
      amount: amount || 0,
      drinks: drinks || 0,
    })
  }, [amount, drinks, packageId])

  return null
}
