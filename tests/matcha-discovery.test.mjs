import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const home = await readFile(new URL("../app/page.js", import.meta.url), "utf8")
const beveragesPage = await readFile(new URL("../app/beverages/page.tsx", import.meta.url), "utf8")
const drinkBuilder = await readFile(new URL("../components/DrinkBuilder.jsx", import.meta.url), "utf8")
const mobileBar = await readFile(new URL("../components/MobileActionBar.jsx", import.meta.url), "utf8")

test("makes the 500 ml matcha builder explicit from the homepage", () => {
  assert.match(home, /Arma tu matcha/)
  assert.match(home, /\/beverages#arma-tu-bebida/)
  assert.match(home, /matcha_cta_clicked/)
})

test("gives the beverage page a direct and understandable matcha start", () => {
  assert.match(beveragesPage, /Arma tu matcha de 500 ml/)
  assert.match(beveragesPage, /MatchaStartButton/)
  assert.match(mobileBar, /Arma matcha/)
})

test("measures when a customer begins configuring a matcha", () => {
  assert.match(drinkBuilder, /matcha_builder_started/)
  assert.match(drinkBuilder, /matchaBuilderStartedRef/)
})
