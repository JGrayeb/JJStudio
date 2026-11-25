import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import * as identityReview from "../lib/identity-review-domain.mjs"
import * as format from "../components/private-review/review-format.mjs"
import { PRIVATE_REVIEW_FIXTURES } from "./fixtures/private-review-fixtures.mjs"

const require = createRequire(import.meta.url)
const componentSource = name => readFileSync(new URL("../components/private-review/" + name + ".jsx", import.meta.url), "utf8")
const hooks = { ...React, useEffect() {}, useRef(value) { return { current: value } } }

function compile(name, dependencies = {}) {
  const compiled = ts.transpileModule(componentSource(name), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: name + ".jsx",
    reportDiagnostics: true,
  })
  assert.deepEqual(compiled.diagnostics, [])
  const module = { exports: {} }
  runInNewContext(compiled.outputText, {
    module, exports: module.exports,
    require: id => {
      if (id === "react") return hooks
      if (id === "@/lib/identity-review-domain.mjs") return identityReview
      return Object.hasOwn(dependencies, id) ? dependencies[id] : require(id)
    },
  })
  return module.exports.default
}

const Checklist = compile("IdentityReviewChecklist")
const contact = PRIVATE_REVIEW_FIXTURES[0]
const purchase = PRIVATE_REVIEW_FIXTURES[2]
const renderChecklist = record => renderToStaticMarkup(React.createElement(Checklist, { record }))

test("every supported review case renders specific steps without permission to apply changes", () => {
  const records = [
    contact,
    ...["missing_stable_id", "invalid_contact", "possible_duplicate"].map(quarantineCode => ({ ...contact, state: "quarantined", quarantineCode })),
    purchase,
  ]
  for (const record of records) {
    const expected = identityReview.buildIdentityReviewCase(record)
    const html = renderChecklist(record)
    assert.ok(html.includes(expected.title))
    assert.ok(html.includes(expected.summary))
    for (const step of expected.steps) assert.ok(html.includes(step.title))
    assert.match(html, /aria-label="Pasos para revisar este registro"/)
    assert.match(html, /aria-labelledby="review-identity-title"/)
    assert.match(html, /no guarda confirmaciones ni autoriza cambios/)
    assert.doesNotMatch(html, /<(?:button|input|form|textarea|select|a)(?:\s|>)/)
  }
})

test("prepared contact is not presented as a confirmed identity or a web account", () => {
  const html = renderChecklist(contact)
  assert.match(html, /Formato preparado · identidad pendiente/)
  assert.match(html, /No crea cuentas, no vincula compras y no asigna clases/)
  assert.doesNotMatch(html, /Cuenta confirmada|Identidad verificada|Saldo disponible/)
})

test("invalid identity input fails closed rather than showing a normal confirmation guide", () => {
  const html = renderChecklist({ ...contact, id: "not-a-record-id" })
  assert.match(html, /Revisión de identidad no disponible/)
  assert.match(html, /no autorices vínculos ni cambios/)
  assert.doesNotMatch(html, /Pasos para revisar este registro|Formato preparado/)
})

function renderDetail(result) {
  const Detail = compile("ReviewRecordDetail", {
    "./IdentityReviewChecklist": { __esModule: true, default: Checklist },
    "./review-format.mjs": format,
    "./use-review-request": { __esModule: true, default: () => ({ refresh() {}, loading: false, error: "", ...result }) },
  })
  return renderToStaticMarkup(React.createElement(Detail, { recordId: purchase.id, transport() {}, onBack() {} }))
}

test("purchase detail keeps payer and beneficiary distinct before the required review guide", () => {
  const html = renderDetail({ data: { record: purchase } })
  assert.ok(html.includes(purchase.purchase.payerName))
  assert.ok(html.includes(purchase.purchase.beneficiaryName))
  assert.match(html, /Quien pagó/)
  assert.match(html, /Beneficiario indicado/)
  assert.match(html, /Sin confirmar · no asignada/)
  assert.match(html, /Pasos para revisar este registro/)
  assert.ok(html.indexOf("Personas de esta compra") < html.indexOf("Pasos para revisar este registro"))
  const buttonLabels = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map(match => match[1].replace(/<[^>]*>/g, ""))
  assert.deepEqual(buttonLabels, ["Volver al listado", "Actualizar ficha"])
})

test("loading or failed private requests never show a previous record or identity checklist", () => {
  for (const state of [{ loading: true }, { error: "Consulta temporalmente no disponible" }]) {
    const html = renderDetail({ ...state, data: { record: purchase } })
    assert.doesNotMatch(html, /Pasos para revisar este registro|Comprador de prueba|Beneficiaria de prueba/)
  }
})

test("the guidance has no network, persistent draft or source mutation actions", () => {
  const source = componentSource("IdentityReviewChecklist")
  assert.doesNotMatch(source, /\b(?:fetch|localStorage|sessionStorage|indexedDB)\b|\.rpc\(|\.from\(|\.insert\(|\.update\(|\.upsert\(/)
  assert.match(componentSource("ReviewRecordDetail"), /<IdentityReviewChecklist record=\{record\}/)
})
