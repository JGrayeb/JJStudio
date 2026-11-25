import { lstat, readdir, readFile, realpath } from "node:fs/promises"
import path from "node:path"
import { SITE_ROOT, REVIEW_MANIFEST, RELEASE_TARGET, stageUploadFiles, sha256, verifyRelease, ReleaseError } from "./release-policy.mjs"
const samePath = (left, right) => process.platform === "win32" ? left.toLowerCase() === right.toLowerCase() : left === right

export async function verifyPreparedStage({ sourceRoot = SITE_ROOT, manifestPath = REVIEW_MANIFEST, stagePath } = {}) {
  const { actual } = await verifyRelease({ sourceRoot, manifestPath })
  const workspace = await realpath(path.resolve(sourceRoot, ".."))
  const parent = path.join(workspace, ".release")
  const expected = path.join(parent, "stage-" + actual.sourceSha256.slice(0, 16))
  if (typeof stagePath !== "string" || !samePath(path.resolve(stagePath), expected)) throw new ReleaseError("La preparación no corresponde a la fuente revisada.")
  for (const root of [parent, expected]) {
    if ((await lstat(root)).isSymbolicLink() || !samePath(await realpath(root), root)) throw new ReleaseError("La preparación no puede contener enlaces o junctions.")
  }
  const files = stageUploadFiles(actual)
  const expectedFiles = new Map(files.map(file => [file.path, file]))
  expectedFiles.set(".vercel/project.json", null)
  const seen = new Set()
  async function walk(relative = "") {
    for (const name of (await readdir(path.join(expected, relative))).sort()) {
      const child = path.join(relative, name)
      const absolute = path.join(expected, child)
      const stat = await lstat(absolute)
      if (stat.isSymbolicLink() || !(await realpath(absolute)).startsWith(expected + path.sep)) throw new ReleaseError("Enlace o archivo fuera de preparación.")
      if (stat.isDirectory()) {
        const prefix = child.split(path.sep).join("/") + "/"
        if (![...expectedFiles.keys()].some(file => file.startsWith(prefix))) throw new ReleaseError("Carpeta no revisada dentro de preparación.")
        await walk(child); continue
      }
      const filePath = child.split(path.sep).join("/")
      if (!stat.isFile() || !expectedFiles.has(filePath)) throw new ReleaseError("Archivo no revisado dentro de preparación: " + filePath)
      const bytes = await readFile(absolute)
      const reference = expectedFiles.get(filePath)
      if (reference && (bytes.length !== reference.bytes || sha256(bytes) !== reference.sha256)) throw new ReleaseError("La preparación fue modificada: " + filePath)
      if (!reference) {
        let value
        try { value = JSON.parse(bytes.toString("utf8")) } catch { throw new ReleaseError("Enlace de proyecto inválido.") }
        if (value.projectId !== RELEASE_TARGET.projectId || value.orgId !== RELEASE_TARGET.teamId || Object.keys(value).sort().join(",") !== "orgId,projectId") throw new ReleaseError("El enlace de proyecto no coincide con JJStudio.")
      }
      seen.add(filePath)
    }
  }
  await walk()
  if (seen.size !== expectedFiles.size) throw new ReleaseError("Faltan archivos revisados en la preparación.")
  let receipt
  try { receipt = JSON.parse(await readFile(expected + ".json", "utf8")) } catch { throw new ReleaseError("Falta el comprobante de preparación.") }
  const uploadSha256 = sha256(JSON.stringify(files))
  if (receipt.sourceSha256 !== actual.sourceSha256 || receipt.deploySha256 !== actual.deploySha256 || receipt.uploadSha256 !== uploadSha256 || JSON.stringify(receipt.files) !== JSON.stringify(files) || JSON.stringify(receipt.target) !== JSON.stringify(RELEASE_TARGET)) throw new ReleaseError("El comprobante no coincide con la fuente revisada.")
  return { ok: true, rootDirectory: RELEASE_TARGET.rootDirectory, sourceSha256: actual.sourceSha256, deploySha256: actual.deploySha256, uploadSha256, stage: expected, files: seen.size, published: false }
}
