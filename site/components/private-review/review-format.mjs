export const REVIEW_VIEWS = Object.freeze([
  { id: "all", label: "Contactos", description: "Directorio importado", count: "contacts", icon: "users" },
  { id: "attention", label: "Por revisar", description: "Datos que necesitan atención", count: "attentionContacts", icon: "attention" },
  { id: "purchases", label: "Compras", description: "Evidencias sin asignar", count: "purchaseEvidence", icon: "purchases" },
])

const quarantineLabels = {
  missing_stable_id: { title: "Falta identificador estable", description: "El origen no tiene un identificador estable del cliente. Este contacto se conserva separado y no se vinculó automáticamente con otra persona." },
  invalid_contact: { title: "Contacto por verificar", description: "Los datos de contacto del origen necesitan revisión antes de considerarlos confirmados." },
  possible_duplicate: { title: "Posible duplicado", description: "Podría existir otro registro de la misma persona. No se han unido los datos ni se ha elegido una identidad automáticamente." },
  ownership_unverified: { title: "Beneficiario por confirmar", description: "El pago no confirma por sí solo quién recibió el paquete. No se ha vinculado a una cuenta ni asignado clases." },
  missing_identity: { title: "Identidad incompleta", description: "Faltan datos de origen para identificar este contacto con seguridad." },
  missing_name: { title: "Nombre por verificar", description: "El registro no tiene un nombre confirmado suficiente para identificar al cliente." },
  missing_client_id: { title: "Identificador por verificar", description: "Falta un identificador estable en el origen. No se vinculó automáticamente con otra persona." },
  duplicate_client_id: { title: "Identificador repetido", description: "Hay registros con el mismo identificador. Necesitan revisión antes de vincularlos." },
  conflicting_identity: { title: "Datos de identidad diferentes", description: "La información de origen no permite confirmar que los registros correspondan a una sola persona." },
  invalid_email: { title: "Correo por verificar", description: "El formato del correo necesita revisión. No se usó para vincular cuentas." },
  invalid_phone: { title: "Teléfono por verificar", description: "El teléfono del origen necesita revisión antes de utilizarlo como dato confirmado." },
}

export function reviewIssue(code) {
  return quarantineLabels[code] || { title: "Datos pendientes de revisión", description: "Este registro se conserva separado hasta verificar los datos de origen. No se hicieron asignaciones automáticas." }
}

export function reviewName(record) {
  return record?.kind === "purchase_evidence" ? record.purchase?.beneficiaryName || record.fullName || "Beneficiario por confirmar" : record?.fullName || "Contacto sin nombre confirmado"
}

export function reviewInitials(name) {
  return String(name || "JJ").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => Array.from(word)[0] || "").join("").toLocaleUpperCase("es-MX") || "JJ"
}

export function reviewDate(value, withTime = false) {
  const date = value ? new Date(value) : null
  if (!date || !Number.isFinite(date.getTime())) return "No registrada"
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", ...(withTime ? { timeStyle: "short" } : {}), timeZone: "America/Mexico_City" }).format(date)
}

export function reviewMoney(amount, currency = "MXN") {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "Importe no registrado"
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "MXN"
  try { return new Intl.NumberFormat("es-MX", { style: "currency", currency: safeCurrency, maximumFractionDigits: 2 }).format(amount) + ` ${safeCurrency}` }
  catch { return "Moneda por verificar" }
}

export function reviewSource(source) {
  return ({ google_sheets: "Google Sheets", sheets: "Google Sheets", stripe: "Stripe", nessty: "Nessty", clientes_sheet: "Archivo Clientes" })[source] || source || "Origen por confirmar"
}

export function reviewPaymentState(status) {
  return ({ paid: "Pago reportado como pagado", unpaid: "No pagado", pending: "Pago pendiente", no_payment_required: "Sin pago requerido" })[status] || "Estado de pago por verificar"
}
