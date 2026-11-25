import assert from "node:assert/strict"
import test from "node:test"
import { mkdtemp, mkdir, copyFile, readFile, writeFile, symlink, rm, rmdir, realpath } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import {
  SITE_ROOT, REVIEW_MANIFEST, DEPLOY_ROOT_FILES, DEPLOY_DIRECTORIES, RELEASE_TARGET, VERCEL_IGNORE, stageUploadFiles, sha256,
  assertSafeRuntimePath, assertSafeRuntimeContent, buildManifest,
  assertReviewedManifest, validateTarget, verifyConfiguration, verifyRelease,
} from "../scripts/release-policy.mjs"
import { verifyPreparedStage } from "../scripts/release-stage-policy.mjs"

async function fixture(t) {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "jjstudio-release-test-"))
  const resolved = await realpath(workspace)
  const directory = path.join(workspace, "site")
  await mkdir(directory)
  t.after(async () => {
    const parent = await realpath(os.tmpdir())
    assert.ok(resolved.startsWith(parent + path.sep) && path.basename(resolved).startsWith("jjstudio-release-test-"))
    await rm(resolved, { recursive: true })
  })
  for (const file of DEPLOY_ROOT_FILES) await copyFile(path.join(SITE_ROOT, file), path.join(directory, file))
  for (const name of [...DEPLOY_DIRECTORIES, "scripts", "tests"]) await mkdir(path.join(directory, name))
  await writeFile(path.join(directory, "app/page.js"), "export default function Home() { return null }\n")
  await writeFile(path.join(directory, "tests/review.test.mjs"), "export const synthetic = true\n")
  return directory
}

test("release target is the exact JJStudio team and project, never a caller-selected target", () => {
  validateTarget(RELEASE_TARGET)
  assert.equal(RELEASE_TARGET.rootDirectory, "site")
  for (const changed of [{ ...RELEASE_TARGET, projectId: "other" }, { ...RELEASE_TARGET, teamId: "other" }, { ...RELEASE_TARGET, teamSlug: "other" }, { ...RELEASE_TARGET, rootDirectory: "." }, null]) assert.throws(() => validateTarget(changed))
})

test("deploy path allowlist rejects private source, credentials, generated output and traversal", () => {
  for (const name of ["app/page.js", "public/images/studio.webp", "package-lock.json"]) assertSafeRuntimePath(name)
  for (const name of ["../app/page.js", "/app/page.js", "app\\page.js", "app//page.js", "tests/client.test.mjs", "public/snapshots/clients.json", "public/fixtures/data.json", "lib/.env.local", "public/export.csv", "tsconfig.tsbuildinfo", "lib/customer-snapshot.json", ".vercel/project.json", "public/private.key"]) assert.throws(() => assertSafeRuntimePath(name), name)
})

test("runtime credential scan blocks obvious provider secrets without echoing them", () => {
  const secret = "sk_live_" + "X".repeat(26)
  assert.throws(() => assertSafeRuntimeContent("lib/secret.js", Buffer.from('const value = "' + secret + '"')), error => error.message.includes("lib/secret.js") && !error.message.includes(secret))
  assertSafeRuntimeContent("lib/client.js", Buffer.from("const key = process.env.STRIPE_SECRET_KEY"))
})

test("manifest is deterministic, includes validation code and deploys only runtime files", async t => {
  const root = await fixture(t)
  await mkdir(path.join(root, "tests/fixtures"))
  await writeFile(path.join(root, "tests/fixtures/synthetic.json"), '{"fictitious":true}\n')
  await writeFile(path.join(root, ".env.local"), "PRIVATE=not-for-upload")
  const first = await buildManifest(root)
  assert.deepEqual(await buildManifest(root), first)
  assert.equal(first.schemaVersion, 1)
  assert.equal(first.sourcePath, "site")
  assert.match(first.sourceSha256, /^[a-f0-9]{64}$/)
  assert.ok(first.files.some(file => file.path === "tests/fixtures/synthetic.json" && file.deploy === false))
  assert.ok(first.files.some(file => file.path === "app/page.js" && file.deploy === true))
  assert.equal(first.files.some(file => file.path.includes(".env")), false)
  assertReviewedManifest(first, first)
})

test("a changed runtime file or an extra runtime file invalidates the reviewed source", async t => {
  const root = await fixture(t)
  const reviewed = await buildManifest(root)
  await writeFile(path.join(root, "app/page.js"), "export default function Changed() { return null }\n")
  const changed = await buildManifest(root)
  assert.throws(() => assertReviewedManifest(changed, reviewed), /fuente cambió/)
  await writeFile(path.join(root, "app/new.js"), "export const added = true\n")
  assert.throws(() => assertReviewedManifest(changed, { ...changed, files: [] }), /fuente cambió/)
  assert.notEqual((await buildManifest(root)).sourceSha256, changed.sourceSha256)
})

test("changing tests invalidates source review even when runtime files stay equal", async t => {
  const root = await fixture(t)
  const reviewed = await buildManifest(root)
  await writeFile(path.join(root, "tests/review.test.mjs"), "export const changed = true\n")
  const changed = await buildManifest(root)
  assert.equal(changed.deploySha256, reviewed.deploySha256)
  assert.notEqual(changed.sourceSha256, reviewed.sourceSha256)
  assert.throws(() => assertReviewedManifest(changed, reviewed))
})

test("unsafe nested source and junctions are rejected before preparing any deployment", async t => {
  const root = await fixture(t)
  await mkdir(path.join(root, "public/.env"))
  await assert.rejects(buildManifest(root), /privada/)
})

test("symlink or junction source cannot escape the canonical tree", async t => {
  const root = await fixture(t)
  const outside = await mkdtemp(path.join(os.tmpdir(), "jjstudio-release-test-"))
  t.after(async () => {
    const resolved = await realpath(outside)
    const parent = await realpath(os.tmpdir())
    assert.ok(resolved.startsWith(parent + path.sep) && path.basename(resolved).startsWith("jjstudio-release-test-"))
    await rm(resolved, { recursive: true })
  })
  try { await symlink(outside, path.join(root, "public/external"), process.platform === "win32" ? "junction" : "dir") }
  catch (error) { if (["EPERM", "EACCES"].includes(error.code)) return t.skip("OS does not permit creating a test symlink"); throw error }
  await assert.rejects(buildManifest(root), /enlaces simbólicos o junctions/)
})

test("production config, locked dependencies and reminder cron are verified locally", async t => {
  const root = await fixture(t)
  assert.equal((await verifyConfiguration(root)).next, "16.2.11")
  await writeFile(path.join(root, "next.config.js"), 'if (process.env.VERCEL_ENV === "production") throw Error("preview only"); module.exports={}\n')
  await assert.rejects(verifyConfiguration(root), /no carga en Production/)
})

test("ignore allowlist drift and missing reviewed manifest fail closed", async t => {
  const root = await fixture(t)
  await assert.rejects(verifyRelease({ sourceRoot: root, manifestPath: path.join(root, "absent.json") }), /Falta el manifiesto/)
  await writeFile(path.join(root, ".vercelignore"), VERCEL_IGNORE + "!tests/**\n")
  await assert.rejects(verifyConfiguration(root), /lista permitida/)
})

test("Vercel ignore uses compatible exclusions instead of a global deny with directory re-inclusions", () => {
  const rules = VERCEL_IGNORE.split("\n").filter(line => line && !line.startsWith("#"))
  assert.equal(rules.includes("*"), false)
  assert.equal(rules.some(line => line.startsWith("!")), false)
  for (const name of ["tests/", "scripts/", ".env", ".env.*", "*.tsbuildinfo", "fixtures/"]) assert.ok(rules.includes(name))
  for (const directory of DEPLOY_DIRECTORIES) assert.equal(rules.includes(directory + "/"), false)
})

test("unreviewed next.config cannot execute before manifest drift rejection", async t => {
  const root = await fixture(t)
  const reviewed = await buildManifest(root)
  const manifestPath = path.join(path.dirname(root), "reviewed.json")
  const sentinel = path.join(path.dirname(root), "must-not-exist.txt")
  await writeFile(manifestPath, JSON.stringify(reviewed))
  await writeFile(path.join(root, "next.config.js"), "require('node:fs').writeFileSync(" + JSON.stringify(sentinel) + ",'executed');module.exports={}\n")
  await assert.rejects(verifyRelease({ sourceRoot: root, manifestPath }), /fuente cambió/)
  await assert.rejects(readFile(sentinel), error => error.code === "ENOENT")
})

async function preparedFixture(t) {
  const sourceRoot = await fixture(t)
  const reviewed = await buildManifest(sourceRoot)
  const workspace = path.dirname(sourceRoot)
  const manifestPath = path.join(workspace, "reviewed.json")
  await writeFile(manifestPath, JSON.stringify(reviewed))
  const stagePath = path.join(workspace, ".release", "stage-" + reviewed.sourceSha256.slice(0, 16))
  await mkdir(stagePath, { recursive: true })
  const files = reviewed.files.filter(file => file.deploy)
  for (const file of files) {
    await mkdir(path.dirname(path.join(stagePath, RELEASE_TARGET.rootDirectory, file.path)), { recursive: true })
    await copyFile(path.join(sourceRoot, file.path), path.join(stagePath, RELEASE_TARGET.rootDirectory, file.path))
  }
  await writeFile(path.join(stagePath, ".vercelignore"), VERCEL_IGNORE)
  await mkdir(path.join(stagePath, ".vercel"))
  await writeFile(path.join(stagePath, ".vercel/project.json"), JSON.stringify({ projectId: RELEASE_TARGET.projectId, orgId: RELEASE_TARGET.teamId }))
  const uploadFiles = stageUploadFiles(reviewed)
  await writeFile(stagePath + ".json", JSON.stringify({ sourceSha256: reviewed.sourceSha256, deploySha256: reviewed.deploySha256, uploadSha256: sha256(JSON.stringify(uploadFiles)), files: uploadFiles, target: RELEASE_TARGET }))
  return { sourceRoot, manifestPath, stagePath }
}

test("prepared source is fully rehashed; edited files, extra files and wrong links are rejected", async t => {
  const options = await preparedFixture(t)
  assert.equal((await verifyPreparedStage(options)).published, false)
  await writeFile(path.join(options.stagePath, "site/app/page.js"), "changed")
  await assert.rejects(verifyPreparedStage(options), /preparación fue modificada/)
})

test("monorepo envelope accepts only reviewed site source, never root legacy or site/site copies", async t => {
  const options = await preparedFixture(t)
  const verified = await verifyPreparedStage(options)
  assert.equal(verified.rootDirectory, "site")
  assert.match(verified.uploadSha256, /^[a-f0-9]{64}$/)
  await assert.rejects(readFile(path.join(options.stagePath, "package.json")), error => error.code === "ENOENT")
  await mkdir(path.join(options.stagePath, "app"))
  await assert.rejects(verifyPreparedStage(options), /Carpeta no revisada/)
  await rmdir(path.join(options.stagePath, "app"))
  await mkdir(path.join(options.stagePath, "site/site"))
  await assert.rejects(verifyPreparedStage(options), /Carpeta no revisada/)
})

test("generated envelope ignore file is verified and cannot be replaced after staging", async t => {
  const options = await preparedFixture(t)
  await writeFile(path.join(options.stagePath, ".vercelignore"), "*\n")
  await assert.rejects(verifyPreparedStage(options), /preparación fue modificada/)
})

test("a stage cannot sneak in private files, point at a different project or use another directory", async t => {
  const options = await preparedFixture(t)
  await writeFile(path.join(options.stagePath, ".env.local"), "not-for-upload")
  await assert.rejects(verifyPreparedStage(options), /Archivo no revisado/)
  await rm(path.join(options.stagePath, ".env.local"))
  await writeFile(path.join(options.stagePath, ".vercel/project.json"), JSON.stringify({ projectId: "wrong", orgId: RELEASE_TARGET.teamId }))
  await assert.rejects(verifyPreparedStage(options), /enlace de proyecto/)
  await assert.rejects(verifyPreparedStage({ ...options, stagePath: path.dirname(options.stagePath) }), /no corresponde/)
})

test("stage verifier CLI exits unsuccessfully when its verification fails", async () => {
  const source = await readFile(new URL("../scripts/release-verify-stage.mjs", import.meta.url), "utf8")
  assert.match(source, /verifyPreparedStage/)
  assert.match(source, /process\.exitCode = 1/)
  assert.doesNotMatch(source, /child_process|fetch\(|--prod|promote/)
})

test("staging command prepares local source only and cannot execute Vercel or overwrite old stages", async () => {
  const source = await readFile(new URL("../scripts/release-stage.mjs", import.meta.url), "utf8")
  assert.doesNotMatch(source, /child_process|spawn|execFile|fetch\(|https\.|--prod|promote/)
  assert.match(source, /await mkdir\(destination\)/)
  assert.match(source, /files\.filter\(file => file\.deploy\)/)
  assert.match(source, /published: false/)
  assert.match(source, /projectId: RELEASE_TARGET\.projectId, orgId: RELEASE_TARGET\.teamId/)
})

test("CI validates only the canonical site with pinned actions and no deployment credentials", async () => {
  const workflow = await readFile(new URL("../../.github/workflows/site-validation.yml", import.meta.url), "utf8")
  const caller = await readFile(new URL("../../.github/workflows/ci.yml", import.meta.url), "utf8")
  assert.match(workflow, /workflow_call:/)
  assert.doesNotMatch(workflow, /(?:^|\n)\s+(?:pull_request|push):/)
  assert.match(workflow, /working-directory: site/)
  assert.match(REVIEW_MANIFEST.replaceAll("\\", "/"), /\/release\/reviewed-source\.json$/)
  assert.equal([...workflow.matchAll(/run: node scripts\/release-check\.mjs/g)].length, 2)
  assert.ok(workflow.indexOf("run: node scripts/release-check.mjs") < workflow.indexOf("run: npm ci"))
  assert.match(workflow, /node-version: "24\.16\.0"/)
  assert.match(workflow, /persist-credentials: false/)
  assert.doesNotMatch(workflow, /pull_request_target|secrets\.|VERCEL_TOKEN|vercel deploy|vercel promote|supabase db push/)
  for (const action of workflow.matchAll(/uses:\s+(\S+)/g)) assert.match(action[1], /@[a-f0-9]{40}$/)
  assert.match(caller, /uses: \.\/\.github\/workflows\/site-validation\.yml/)
  assert.match(caller, /name: verify/)
  assert.match(caller, /needs: canonical/)
  assert.match(caller, /if: \$\{\{ always\(\) \}\}/)
  assert.match(caller, /VALIDATION_RESULT: \$\{\{ needs\.canonical\.result \}\}/)
  assert.match(caller, /\[ "\$VALIDATION_RESULT" != "success" \]/)
  assert.match(caller, /exit 1/)
  assert.doesNotMatch(caller, /working-directory: \.(?:\s|$)|node-version: 22|run: npm|pull_request_target|secrets\.|VERCEL_TOKEN|vercel deploy|vercel promote|supabase db push/)
})
