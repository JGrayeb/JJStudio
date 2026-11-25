import { verifyRelease, ReleaseError } from "./release-policy.mjs"
try {
  if (process.argv.length !== 2) throw new ReleaseError("Solo se revisa la fuente canónica site; no se admiten rutas o destinos arbitrarios.")
  const { actual, configuration } = await verifyRelease()
  console.log(JSON.stringify({ ok: true, source: "site", sourceSha256: actual.sourceSha256, deploySha256: actual.deploySha256, deployFiles: actual.files.filter(file => file.deploy).length, reviewedFiles: actual.files.length, ...configuration }))
} catch (error) {
  console.error(error instanceof ReleaseError ? error.message : "No se pudo verificar la fuente.")
  process.exitCode = 1
}
