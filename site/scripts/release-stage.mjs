import { copyFile, lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises"
import path from "node:path"
import { SITE_ROOT, RELEASE_TARGET, VERCEL_IGNORE, stageUploadFiles, sha256, verifyRelease, ReleaseError } from "./release-policy.mjs"
try {
  if (process.argv.length !== 2) throw new ReleaseError("Solo se prepara la fuente canónica; no se admiten rutas arbitrarias.")
  const { actual } = await verifyRelease()
  const workspace = await realpath(path.resolve(SITE_ROOT, ".."))
  const outputRoot = path.join(workspace, ".release")
  try { if ((await lstat(outputRoot)).isSymbolicLink()) throw new ReleaseError("La carpeta de preparación no puede ser un enlace.") }
  catch (error) { if (error.code !== "ENOENT") throw error }
  await mkdir(outputRoot, { recursive: true })
  const destination = path.join(outputRoot, "stage-" + actual.sourceSha256.slice(0, 16))
  await mkdir(destination)
  if (!(await realpath(destination)).startsWith(workspace + path.sep)) throw new ReleaseError("Preparación fuera del espacio de trabajo.")
  for (const file of actual.files.filter(file => file.deploy)) {
    const target = path.join(destination, RELEASE_TARGET.rootDirectory, file.path)
    await mkdir(path.dirname(target), { recursive: true })
    await copyFile(path.join(SITE_ROOT, file.path), target)
    const bytes = await readFile(target)
    if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) throw new ReleaseError("La fuente cambió durante la copia. Preparación no válida.")
  }
  await writeFile(path.join(destination, ".vercelignore"), VERCEL_IGNORE)
  await mkdir(path.join(destination, ".vercel"))
  await writeFile(path.join(destination, ".vercel/project.json"), JSON.stringify({ projectId: RELEASE_TARGET.projectId, orgId: RELEASE_TARGET.teamId }) + "\n")
  const uploadFiles = stageUploadFiles(actual)
  const uploadSha256 = sha256(JSON.stringify(uploadFiles))
  await writeFile(path.join(outputRoot, "stage-" + actual.sourceSha256.slice(0, 16) + ".json"), JSON.stringify({ sourceSha256: actual.sourceSha256, deploySha256: actual.deploySha256, uploadSha256, files: uploadFiles, target: RELEASE_TARGET }, null, 2) + "\n")
  console.log(JSON.stringify({ ok: true, stage: destination, rootDirectory: RELEASE_TARGET.rootDirectory, sourceSha256: actual.sourceSha256, deploySha256: actual.deploySha256, uploadSha256, published: false, note: "Preparación local únicamente. Ejecuta Vercel desde esta raíz, con --local-config site/vercel.json. No se cambiaron dominios." }))
} catch (error) {
  console.error(error instanceof ReleaseError ? error.message : error.code === "EEXIST" ? "Esta fuente ya tiene preparación local; no se sobrescribe." : "No se pudo preparar la fuente. No la publiques.")
  process.exitCode = 1
}
