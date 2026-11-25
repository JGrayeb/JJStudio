export const STUDIO_TERMS_PATH = "/terminos-y-condiciones"
export const STUDIO_TERMS_DATE = "2026-11-10"
export const STUDIO_TERMS_REVISION = 4
export const STUDIO_TERMS_VERSION = `${STUDIO_TERMS_DATE}-v${STUDIO_TERMS_REVISION}`
export const STUDIO_TERMS_REQUIRED = "Marca la casilla de los términos y condiciones de JJStudio para continuar."

export function hasCurrentStudioTermsAcceptance(value) {
  return value?.studioTermsAccepted === true && value?.studioTermsVersion === STUDIO_TERMS_VERSION
}

// Called by the server only after validating an explicit acceptance.
export function studioTermsCheckoutMetadata() {
  return { jjstudio_terms_accepted: "true", jjstudio_terms_version: STUDIO_TERMS_VERSION }
}
