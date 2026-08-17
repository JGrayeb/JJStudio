const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const STORAGE_VERSION = 1

export function readLocalPreference(key, maxAgeMs = DEFAULT_MAX_AGE_MS) {
  if (typeof window === "undefined") return null

  try {
    const stored = JSON.parse(window.localStorage.getItem(key) || "null")
    if (!stored || stored.version !== STORAGE_VERSION || typeof stored.savedAt !== "number" || typeof stored.value !== "object") return null
    if (Date.now() - stored.savedAt > maxAgeMs) {
      window.localStorage.removeItem(key)
      return null
    }
    return stored.value
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

export function writeLocalPreference(key, value) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, savedAt: Date.now(), value }))
    window.dispatchEvent(new CustomEvent("jjstudio:preference-updated", { detail: { key, value } }))
  } catch {
    // Browsers can block storage in private or restricted modes. The flow still works without it.
  }
}

export function removeLocalPreference(key) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent("jjstudio:preference-updated", { detail: { key, value: null } }))
  } catch {
    // The interface remains usable when storage is unavailable.
  }
}
