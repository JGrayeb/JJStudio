import { createHash } from "node:crypto"
import { lstat, readdir, readFile, realpath } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"

export const SITE_ROOT = fileURLToPath(new URL("../", import.meta.url))
export const REVIEW_MANIFEST = path.resolve(SITE_ROOT, "../release/reviewed-source.json")
export const RELEASE_TARGET = Object.freeze({ projectId: "prj_rrKx2yBYJb9Uoo1f2gtzFjnFdePM", teamId: "team_DBehXwhISvWA7AVhQ5CBL7pS", projectName: "jj-studio", teamSlug: "jjs-tudio-s-projects", rootDirectory: "site" })
export const DEPLOY_DIRECTORIES = ["app", "components", "content", "lib", "public"]
export const DEPLOY_ROOT_FILES = [".vercelignore", "jsconfig.json", "next-env.d.ts", "next.config.js", "package-lock.json", "package.json", "postcss.config.js", "tailwind.config.js", "tsconfig.json", "vercel.json"]
// The staging inventory is the authoritative allowlist. Vercel's ignore parser
// does not reliably re-include app/** under a global * exclusion; use exclusions
// here, then compare the real CLI dry-run inventory with the verified stage.
export const VERCEL_IGNORE = ["# Release-stage inventory is the allowlist; these are additional exclusions.", ".env", ".env.*", ".git/", ".vercel/", ".next/", "node_modules/", "tests/", "scripts/", "fixtures/", "snapshots/", "artifacts/", "tmp/", "cache/", "output/", "*.tsbuildinfo", "*.log", "*.csv", "*.xlsx", "*.xls", "*.docx", "**/.env", "**/.env.*", "**/fixtures/**", "**/snapshots/**", "**/*.tsbuildinfo", ""].join("\n")
const forbiddenSegment = /^(?:\.env(?:\..*)?|\.git|\.vercel|node_modules|\.next|artifacts|snapshots|tmp|cache|output|fixtures)$/i
const forbiddenFile = /(?:\.tsbuildinfo|\.log|\.csv|\.xlsx?|\.docx?|\.pem|\.key|\.p12|\.pfx)$/i
const sensitiveFilename = /(?:customer|client|contact|payment|purchase|auth|session)[-_](?:snapshot|export|dump)|(?:credentials|secrets)\./i
const textExtensions = /\.(?:mjs|cjs|js|jsx|ts|tsx|json|css|html|svg|txt|webmanifest)$/i
const secretValue = /(?:\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{18,}|\bwhsec_[A-Za-z0-9]{18,}|\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/
export const sha256 = value => createHash("sha256").update(value).digest("hex")
export class ReleaseError extends Error {}
function fail(message) { throw new ReleaseError(message) }

export function validateTarget(target) {
  if (!target || Object.keys(RELEASE_TARGET).some(key => target[key] !== RELEASE_TARGET[key])) fail("El destino no coincide con JJStudio. No se prepara una publicación.")
}

// Vercel's project root is site/. The upload root is an envelope containing only
// that directory plus a generated ignore file, never the legacy repository root.
export function stageUploadFiles(manifest) {
  validateTarget(manifest?.target)
  const files = manifest.files.filter(file => file.deploy).map(file => {
    assertSafeRuntimePath(file.path)
    return { ...file, path: RELEASE_TARGET.rootDirectory + "/" + file.path }
  })
  files.push({ path: ".vercelignore", bytes: Buffer.byteLength(VERCEL_IGNORE), sha256: sha256(VERCEL_IGNORE), deploy: true })
  return files.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)
}

export function assertSafeRuntimePath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath || relativePath.includes("\\") || relativePath.startsWith("/") || relativePath.split("/").some(part => !part || part === "." || part === "..")) fail("Ruta de publicación inválida.")
  const parts = relativePath.split("/")
  if (parts.some(part => forbiddenSegment.test(part)) || forbiddenFile.test(parts.at(-1)) || sensitiveFilename.test(parts.at(-1))) fail("Archivo privado o generado excluido: " + relativePath)
  if (!DEPLOY_ROOT_FILES.includes(relativePath) && !DEPLOY_DIRECTORIES.includes(parts[0])) fail("Archivo fuera de la lista de publicación: " + relativePath)
}

export function assertSafeRuntimeContent(relativePath, bytes) {
  if (textExtensions.test(relativePath) && secretValue.test(bytes.toString("utf8"))) fail("Posible credencial en archivo: " + relativePath + ". El valor no se muestra.")
}

async function sourceEntry(root, relativePath, deploy) {
  const absolute = path.join(root, relativePath)
  const stat = await lstat(absolute)
  if (stat.isSymbolicLink()) fail("No se permiten enlaces simbólicos o junctions: " + relativePath)
  const resolved = await realpath(absolute)
  if (resolved !== root && !resolved.startsWith(root + path.sep)) fail("Archivo fuera de la fuente canónica.")
  if (stat.isDirectory()) {
    if (deploy && forbiddenSegment.test(path.basename(absolute))) fail("Carpeta privada dentro de fuente: " + relativePath)
    const all = []
    for (const name of (await readdir(absolute)).sort()) all.push(...await sourceEntry(root, path.join(relativePath, name), deploy))
    return all
  }
  if (!stat.isFile()) fail("Tipo de archivo no admitido.")
  const relative = relativePath.split(path.sep).join("/")
  if (deploy) assertSafeRuntimePath(relative)
  const bytes = await readFile(absolute)
  if (deploy) assertSafeRuntimeContent(relative, bytes)
  return [{ path: relative, bytes: bytes.length, sha256: sha256(bytes), deploy }]
}

export async function buildManifest(sourceRoot = SITE_ROOT) {
  if ((await lstat(sourceRoot)).isSymbolicLink()) fail("La fuente canónica no puede ser un enlace.")
  const root = await realpath(sourceRoot)
  const files = []
  for (const name of DEPLOY_ROOT_FILES) files.push(...await sourceEntry(root, name, true))
  for (const directory of [...DEPLOY_DIRECTORIES, "scripts", "tests"]) {
    try { files.push(...await sourceEntry(root, directory, DEPLOY_DIRECTORIES.includes(directory))) }
    catch (error) { if (error.code !== "ENOENT" || DEPLOY_DIRECTORIES.includes(directory)) throw error }
  }
  files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
  return { schemaVersion: 1, sourcePath: "site", target: { ...RELEASE_TARGET }, sourceSha256: sha256(JSON.stringify(files)), deploySha256: sha256(JSON.stringify(files.filter(file => file.deploy))), files }
}

export function assertReviewedManifest(actual, reviewed) {
  validateTarget(reviewed?.target)
  if (reviewed.schemaVersion !== 1 || reviewed.sourcePath !== "site" || actual.sourceSha256 !== reviewed.sourceSha256 || actual.deploySha256 !== reviewed.deploySha256 || JSON.stringify(actual.files) !== JSON.stringify(reviewed.files)) fail("La fuente cambió desde la revisión. Revisa los cambios y genera un manifiesto nuevo.")
}

export async function verifyConfiguration(sourceRoot = SITE_ROOT) {
  const packageJson = JSON.parse(await readFile(path.join(sourceRoot, "package.json"), "utf8"))
  const lock = JSON.parse(await readFile(path.join(sourceRoot, "package-lock.json"), "utf8"))
  for (const category of ["dependencies", "devDependencies"]) {
    if (JSON.stringify(packageJson[category]) !== JSON.stringify(lock.packages?.[""]?.[category])) fail("package.json y el lockfile no coinciden.")
    for (const name of Object.keys(packageJson[category] || {})) {
      const entry = lock.packages?.["node_modules/" + name]
      if (!entry?.version || !entry?.integrity) fail("Dependencia sin versión e integridad bloqueadas: " + name)
    }
  }
  if (lock.packages["node_modules/next"].version !== "16.2.11") fail("La versión de Next cambió: requiere revisión.")
  if (packageJson.scripts?.build !== "next build") fail("El comando build cambió: requiere revisión.")
  if ((await readFile(path.join(sourceRoot, ".vercelignore"), "utf8")).replace(/\r\n/g, "\n") !== VERCEL_IGNORE) fail("La lista permitida de Vercel cambió.")
  const vercel = JSON.parse(await readFile(path.join(sourceRoot, "vercel.json"), "utf8"))
  if (vercel.crons?.find(item => item.path === "/api/subscriptions/reminders")?.schedule !== "0 12 * * *") fail("La programación de avisos cambió.")
  try {
    execFileSync(process.execPath, ["--eval", "require(" + JSON.stringify(path.join(sourceRoot, "next.config.js")) + ")"], { env: { PATH: process.env.PATH || "", SystemRoot: process.env.SystemRoot || "", NODE_ENV: "production", VERCEL_ENV: "production" }, timeout: 5000, stdio: "pipe" })
  } catch { fail("next.config.js no carga en Production. No se prepara una versión que falle al promover.") }
  return { next: lock.packages["node_modules/next"].version, nodeMajor: 24 }
}

export async function verifyRelease({ sourceRoot = SITE_ROOT, manifestPath = REVIEW_MANIFEST } = {}) {
  if (Number(process.versions.node.split(".")[0]) !== 24) fail("Usa Node.js 24, igual que Vercel.")
  const actual = await buildManifest(sourceRoot)
  let reviewed
  try { reviewed = JSON.parse(await readFile(manifestPath, "utf8")) }
  catch { fail("Falta el manifiesto de fuente revisada.") }
  assertReviewedManifest(actual, reviewed)
  // Compare bytes before executing next.config.js or any reviewed project code.
  const configuration = await verifyConfiguration(sourceRoot)
  return { actual, configuration }
}
