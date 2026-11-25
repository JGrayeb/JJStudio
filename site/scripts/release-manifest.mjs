import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { buildManifest, verifyConfiguration, REVIEW_MANIFEST, ReleaseError } from "./release-policy.mjs"
try {
  if (process.argv.slice(2).join(" ") !== "--reviewed") throw new ReleaseError("Después de revisar los cambios: npm run release:manifest -- --reviewed")
  await verifyConfiguration()
  const manifest = await buildManifest()
  await mkdir(path.dirname(REVIEW_MANIFEST), { recursive: true })
  await writeFile(REVIEW_MANIFEST, JSON.stringify(manifest, null, 2) + "\n", { mode: 0o600 })
  console.log(JSON.stringify({ ok: true, sourceSha256: manifest.sourceSha256, deploySha256: manifest.deploySha256, files: manifest.files.length, manifest: "release/reviewed-source.json", published: false }))
} catch (error) {
  console.error(error instanceof ReleaseError ? error.message : "No se pudo preparar el manifiesto.")
  process.exitCode = 1
}
