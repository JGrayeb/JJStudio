function getTextCustomField(session, key) {
  const field = session?.custom_fields?.find((item) => item.key === key)
  return field?.text?.value?.trim() || ""
}

function getNonNegativeInteger(value) {
  const number = Number.parseInt(String(value ?? ""), 10)
  return Number.isInteger(number) && number >= 0 ? number : 0
}

export function buildActivationRecord(session, eventCreated) {
  const reference = session?.id?.trim()

  if (!reference) {
    throw new Error("Stripe session reference is missing")
  }

  const createdAt = Number.isFinite(session?.created) ? session.created : eventCreated

  return {
    paidAt: Number.isFinite(createdAt) ? new Date(createdAt * 1000).toISOString() : new Date().toISOString(),
    name: getTextCustomField(session, "participant_name") || session?.customer_details?.name?.trim() || "",
    email: session?.customer_details?.email?.trim() || session?.customer_email?.trim() || "",
    phone: session?.customer_details?.phone?.trim() || "",
    package: session?.metadata?.packageName?.trim() || session?.metadata?.packageId?.trim() || "Paquete JJ Studio",
    drinks: getNonNegativeInteger(session?.metadata?.totalDrinks),
    amount: Number.isFinite(session?.amount_total) ? session.amount_total / 100 : 0,
    reference,
  }
}

export async function registerPaidActivation(record, { url, secret, fetchImpl = fetch } = {}) {
  if (!url || !secret) {
    throw new Error("Activation Sheet integration is not configured")
  }

  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...record, secret }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Activation Sheet returned HTTP ${response.status}`)
  }

  const result = await response.json()

  if (!result?.ok) {
    throw new Error("Activation Sheet rejected the registration")
  }

  return result
}
