export const META_PIXEL_ID = "1374797471387817"

export function trackMetaEvent(eventName, parameters = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return
  window.fbq("track", eventName, parameters)
}

export function trackMetaCustomEvent(eventName, parameters = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return
  window.fbq("trackCustom", eventName, parameters)
}
