import test from "node:test"
import assert from "node:assert/strict"
import { RELEASE_TARGET, stageUploadFiles } from "../scripts/release-policy.mjs"
import { validateUploadInventory } from "../scripts/release-upload-policy.mjs"

const manifest = { target: RELEASE_TARGET, sourceSha256: "a".repeat(64), deploySha256: "b".repeat(64), files: [
  { path: "package.json", bytes: 100, deploy: true },
  { path: "app/page.js", bytes: 200, deploy: true },
  { path: "tests/fixture.mjs", bytes: 300, deploy: false },
] }
const upload = { fileCount: 3, files: stageUploadFiles(manifest).map(file => ({ path: file.path, size: file.bytes })) }

test("actual Vercel inventory must include every nested runtime file and no test fixtures", () => {
  assert.deepEqual(upload.files.map(file => file.path), [".vercelignore", "site/app/page.js", "site/package.json"])
  assert.equal(validateUploadInventory(upload, manifest).uploadFiles, 3)
  assert.throws(() => validateUploadInventory({ fileCount: 1, files: [upload.files[0]] }, manifest))
  assert.throws(() => validateUploadInventory({ fileCount: 4, files: [...upload.files, { path: "site/tests/fixture.mjs", size: 300 }] }, manifest))
})
test("duplicate, unexpected, modified, or foreign upload manifests fail closed", () => {
  for (const files of [
    [upload.files[0], upload.files[1], upload.files[1]],
    [upload.files[0], upload.files[1], { path: "site/public/clients.csv", size: 100 }],
    [upload.files[0], upload.files[1], { path: "site/package.json", size: 1 }],
    [upload.files[0], upload.files[1], { path: "site/../package.json", size: 100 }],
    [upload.files[0], upload.files[1], { path: "package.json", size: 100 }],
    [upload.files[0], upload.files[1], { path: "site/site/package.json", size: 100 }],
  ]) assert.throws(() => validateUploadInventory({ fileCount: 3, files }, manifest))
  assert.throws(() => validateUploadInventory(upload, { ...manifest, target: { ...RELEASE_TARGET, projectId: "other" } }))
  assert.throws(() => validateUploadInventory(upload, { ...manifest, target: { ...RELEASE_TARGET, rootDirectory: "." } }))
})
