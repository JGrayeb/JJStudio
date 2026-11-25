import { importReviewRecord, PrivateImportReviewError } from "./private-import-review-domain.mjs"

// This is a review guide, not an identity resolver. It neither assigns an
// imported contact to Auth nor converts payment evidence into class rights.
const contactCases = {
  missing_stable_id: {
    title: "Falta el identificador de origen",
    summary: "Antes de relacionar este contacto con una cuenta, hay que localizar su ficha exacta en la fuente.",
    steps: [
      ["find_source_profile", "Localiza la ficha en Nessty o en la fuente original", "Comprueba el identificador estable de esa ficha. El número de fila de Sheets solo localiza la observación importada; no identifica a la persona."],
      ["verify_source_person", "Confirma a quién pertenece esa ficha", "Usa evidencia del registro original o confirmación directa documentada por el staff. No basta con que el nombre, correo o teléfono se parezcan."],
      ["verify_account_owner", "Verifica por separado la cuenta web", "Antes de un vínculo futuro, la persona deberá demostrar que controla la cuenta web que se propone relacionar. Este panel no crea ni vincula cuentas."],
    ],
  },
  invalid_contact: {
    title: "Confirma el dato de contacto",
    summary: "El correo o teléfono observado necesita confirmación. No debe corregirse por adivinación ni usarse para vincular una cuenta.",
    steps: [
      ["check_original_contact", "Compara el dato con la fuente original", "Revisa la ficha exacta y conserva el valor observado. Un error de formato no autoriza cambiar dígitos, prefijos de país o el propietario del dato."],
      ["confirm_contact_with_person", "Confirma el dato correcto con la persona", "Solicita el correo o teléfono por un canal ya verificado o en recepción. Documenta cómo y quién lo comprobó antes de proponer una corrección."],
      ["separate_contact_from_account", "Separa corrección de contacto y acceso web", "Confirmar un teléfono o correo no confirma por sí solo la titularidad de una cuenta Auth ni de una compra."],
    ],
  },
  possible_duplicate: {
    title: "Decide si son personas distintas",
    summary: "La coincidencia es una alerta de revisión, no una autorización para fusionar registros.",
    steps: [
      ["compare_stable_profiles", "Compara los identificadores de las fichas", "Abre cada ficha de origen por su identificador estable y revisa si corresponde a la misma persona. No uses la posición de fila como identidad."],
      ["confirm_separate_people", "Confirma si hay correo o teléfono compartido", "Una familia puede compartir datos de contacto; dos personas también pueden llamarse igual. Mantén las fichas separadas mientras falte evidencia."],
      ["document_identity_decision", "Documenta la decisión antes de cualquier cambio", "Registra la evidencia exacta, las fichas implicadas y quién lo confirmó. No se fusionan cuentas ni se trasladan compras desde esta revisión."],
    ],
  },
  format_ready: {
    title: "Formato preparado; identidad aún por verificar",
    summary: "El contacto pasó las validaciones de formato. Eso no significa que ya exista una cuenta web ni que sus compras estén relacionadas.",
    steps: [
      ["verify_source_person", "Verifica la identidad de la ficha de origen", "Confirma que el identificador estable corresponde a la persona correcta. El nombre y el correo son pistas de búsqueda, no prueba suficiente."],
      ["verify_account_owner", "Confirma quién controla la cuenta web", "Antes de relacionar una cuenta, verifica su titularidad mediante un mecanismo autorizado. No reutilices una sesión o un correo de otra persona."],
      ["review_purchases_separately", "Revisa las compras por separado", "Una ficha de contacto no acredita un pago, un paquete ni clases restantes. Cada compra requiere su propia evidencia y beneficiario confirmado."],
    ],
  },
}

const purchaseSteps = [
  ["recheck_payment", "Revisa el pago exacto y su estado actual", "Consulta la referencia de Stripe en el entorno correcto y comprueba pago, devoluciones y disputas. La verificación histórica importada no certifica el estado actual."],
  ["identify_beneficiary", "Localiza al beneficiario por un identificador estable", "Identifica la ficha exacta de quien usará el paquete. Quien pagó puede ser otra persona; una coincidencia de nombre o correo no confirma al beneficiario."],
  ["document_beneficiary_evidence", "Documenta la confirmación del beneficiario", "Se necesita evidencia del registro de compra o confirmación directa documentada por el staff que relacione esta referencia de pago con esa ficha exacta."],
  ["verify_beneficiary_account", "Verifica por separado la cuenta web del beneficiario", "Antes de un vínculo futuro, confirma que el beneficiario controla la cuenta web elegida. El correo del pagador no autoriza acceso al paquete de otra persona."],
  ["review_entitlement_separately", "Mantén el pago separado del saldo de clases", "La asignación del paquete, su activación y las clases restantes necesitan su propia validación. El importe pagado no permite deducir el saldo."],
]

const guideSteps = steps => steps.map(([id, title, detail]) => ({ id, title, detail, required: true }))

function wrongContext() {
  throw new PrivateImportReviewError(
    "La ficha cambió o no coincide con esta revisión. Vuelve a abrir el registro antes de continuar.",
    409,
    "identity_review_context_changed",
  )
}

export function buildIdentityReviewCase(input, context = {}) {
  const row = importReviewRecord(input)
  if (context === null || typeof context !== "object" || Array.isArray(context)
    || Object.keys(context).some(key => !["expectedRecordId", "expectedImportedAt"].includes(key))) wrongContext()
  if (Object.hasOwn(context, "expectedRecordId")
    && (typeof context.expectedRecordId !== "string" || context.expectedRecordId.toLowerCase() !== row.id.toLowerCase())) wrongContext()
  if (Object.hasOwn(context, "expectedImportedAt")
    && (typeof context.expectedImportedAt !== "string" || context.expectedImportedAt !== row.provenance.importedAt)) wrongContext()
  if (row.kind === "contact" && row.quarantineCode === "ownership_unverified") {
    throw new PrivateImportReviewError("El tipo de ficha no coincide con su revisión.", 503, "identity_review_data_unavailable")
  }

  const isPurchase = row.kind === "purchase_evidence"
  const hasStableClientId = !isPurchase && Boolean(row.sourceClientId)
  const caseCode = isPurchase
    ? "ownership_unverified"
    : row.quarantineCode || (hasStableClientId ? "format_ready" : "missing_stable_id")
  const guide = isPurchase ? {
    title: "Confirma para quién es esta compra",
    summary: "El pago y el derecho a usar el paquete son comprobaciones diferentes. Pagador y beneficiario pueden ser personas distintas.",
    steps: purchaseSteps,
  } : contactCases[caseCode]

  return {
    recordId: row.id,
    kind: row.kind,
    caseCode,
    title: guide.title,
    summary: guide.summary,
    status: caseCode === "format_ready" ? "format_ready" : "pending_review",
    readOnly: true,
    canApply: false,
    ownershipVerified: false,
    accountLink: "not_verified_by_this_review",
    steps: guideSteps(guide.steps),
    warnings: [
      "Esta guía no guarda confirmaciones, corrige datos, fusiona personas ni relaciona cuentas.",
      "No se asignan paquetes, clases, vencimientos ni derechos por completar una lista de revisión.",
      ...(isPurchase ? ["La evidencia histórica de pago no sustituye una comprobación actual de Stripe ni confirma al beneficiario."] : []),
    ],
    sourceEvidence: {
      sourceSystem: row.provenance.sourceSystem,
      importedAt: row.provenance.importedAt,
      hasStableClientId,
      hasPaymentReference: isPurchase && Boolean(row.purchase.reference),
      paymentWasVerified: isPurchase && row.purchase.paymentStatus === "paid" && Boolean(row.purchase.verifiedAt),
    },
  }
}
