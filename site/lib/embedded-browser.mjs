/** Classify only explicit social-app UA markers; do not infer from referrers. */
export function embeddedBrowserContext(userAgent) {
  if (typeof userAgent !== "string" || !userAgent.trim()) return "unknown"
  if (/\bInstagram(?:\s+\d|\/\d|\s*$)/i.test(userAgent)) return "instagram"
  if (/\b(?:FBAN\/|FBAV\/|FB_IAB\/|FBIOS\b|FB4A\b)/i.test(userAgent)) return "facebook"
  return "standard"
}
