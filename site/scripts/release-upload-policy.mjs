import { RELEASE_TARGET, ReleaseError, assertSafeRuntimePath, stageUploadFiles, sha256 } from "./release-policy.mjs"

// Validate the CLI's real upload inventory, not an approximation of ignore rules.
export function validateUploadInventory(upload, manifest) {
  const files = stageUploadFiles(manifest)
  const expected = new Map(files.map(file => [file.path, file.bytes]))
  if (!Array.isArray(upload?.files) || upload.fileCount !== files.length || upload.files.length !== files.length) throw new ReleaseError("Vercel no incluiría todos los archivos revisados. No publiques.")
  const seen = new Set()
  for (const file of upload.files) {
    if (file.path !== ".vercelignore") {
      const prefix = RELEASE_TARGET.rootDirectory + "/"
      if (typeof file.path !== "string" || !file.path.startsWith(prefix)) throw new ReleaseError("Vercel debe recibir solo la aplicación dentro de site/.")
      assertSafeRuntimePath(file.path.slice(prefix.length))
    }
    if (seen.has(file.path) || !expected.has(file.path) || file.size !== expected.get(file.path)) throw new ReleaseError("El inventario real de Vercel no coincide con la revisión. No publiques.")
    seen.add(file.path)
  }
  return { ok: true, rootDirectory: RELEASE_TARGET.rootDirectory, uploadFiles: seen.size, sourceSha256: manifest.sourceSha256, deploySha256: manifest.deploySha256, uploadSha256: sha256(JSON.stringify(files)), published: false }
}
