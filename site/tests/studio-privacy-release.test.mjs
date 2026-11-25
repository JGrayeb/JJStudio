import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import * as privacy from "../content/studio-privacy.mjs"
import * as terms from "../lib/studio-terms.mjs"

const require = createRequire(import.meta.url)
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

function renderPrivacy() {
  const source = read("app/aviso-de-privacidad/page.js")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  })
  const exports = {}
  runInNewContext(outputText, {
    exports,
    require: (id) => ({
      "@/content/studio-privacy.mjs": privacy,
      "@/lib/studio-terms.mjs": terms,
    })[id] ?? require(id),
  })
  return { html: renderToStaticMarkup(React.createElement(exports.default)), metadata: exports.metadata }
}

test("the published notice has accessible anchors, the confirmed camera policy and no consent form", () => {
  const { html, metadata } = renderPrivacy()
  assert.equal(metadata.alternates.canonical, privacy.STUDIO_PRIVACY_PATH)
  assert.match(html, /<h1[^>]*>Aviso de privacidad<\/h1>/)
  assert.doesNotMatch(html, /Borrador|<form|type="checkbox"/)
  assert.match(html, /videovigilancia las 24 horas.*video sin audio/)
  assert.match(html, /almacenan en la nube.*eliminan después de 24 horas.*una sola persona autorizada/)
  for (const section of privacy.studioPrivacyNotice) {
    assert.match(html, new RegExp(`href="#${section.id}"`))
    assert.equal(html.split(`id="${section.id}"`).length - 1, 1)
  }
  assert.ok(html.includes(`href="mailto:${privacy.STUDIO_PRIVACY_CONTACT}"`))
  assert.ok(html.includes(`href="${privacy.STUDIO_PRIVACY_RECEPTION_PATH}"`))
  assert.ok(html.includes(`href="${terms.STUDIO_TERMS_PATH}"`))
})

test("the one-page reception sign matches the integral notice and is printable without scripts", () => {
  const sign = read(`public${privacy.STUDIO_PRIVACY_RECEPTION_PATH}`)
  assert.ok(sign.includes(privacy.STUDIO_PRIVACY_RESPONSIBLE))
  assert.ok(sign.includes(privacy.STUDIO_PRIVACY_ADDRESS))
  assert.ok(sign.includes(`href="${privacy.STUDIO_PRIVACY_PATH}"`))
  assert.ok(sign.includes(`mailto:${privacy.STUDIO_PRIVACY_CONTACT}`))
  assert.match(sign, /@media print/)
  assert.doesNotMatch(sign, /<script|<form|<iframe/i)
})
