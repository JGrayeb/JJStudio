"use client"

import { useEffect } from "react"
import { track } from "@vercel/analytics"
import { trackMetaEvent } from "@/lib/meta-pixel"
import { trackPaymentSuccess } from "@/lib/payment-success-analytics.mjs"

export default function PaymentSuccessAnalytics({ packageId, amount, drinks, reference }) {
  useEffect(() => {
    trackPaymentSuccess({ packageId, amount, drinks, reference }, { trackEvent: track, trackMetaEvent })
  }, [amount, drinks, packageId, reference])

  return null
}
