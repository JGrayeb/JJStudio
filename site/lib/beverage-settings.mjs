const sectionDefinitions = [
  { id: "matcha", label: "Matcha · 500 ml", source: "matchaGrades" },
  { id: "cold", label: "Bebidas frías · 500 ml", source: "cold" },
  { id: "hot", label: "Bebidas calientes · 300 ml", source: "hot" },
  { id: "extras", label: "Extras", source: "extras" },
]

const normalizePrice = (value, fallback) => {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export function createDefaultBeveragePriceRows(beverages) {
  const rows = sectionDefinitions.flatMap(({ id, source, label }) => beverages[source].map((item, index) => ({
    item_key: `${id}:${item.id}`,
    label: source === "matchaGrades" ? `Matcha ${item.name}` : item.name,
    section: id,
    section_label: label,
    price: item.price,
    display_order: (index + 1) * 10,
  })))

  rows.push({
    item_key: `shake:${beverages.proteinShake.id}`,
    label: beverages.proteinShake.name,
    section: "shake",
    section_label: "Shake",
    price: beverages.proteinShake.price,
    display_order: 10,
  })

  return rows
}

export function mergeBeveragePriceRows(defaultRows, storedRows = []) {
  const storedByKey = new Map(storedRows.map((row) => [row.item_key, row]))
  return defaultRows.filter((row) => row.section !== "discounts" && !row.item_key.startsWith("discount:")).map((row) => ({
    ...row,
    price: normalizePrice(storedByKey.get(row.item_key)?.price, row.price),
    updated_at: storedByKey.get(row.item_key)?.updated_at ?? null,
  }))
}

export function applyBeveragePrices(beverages, storedRows = []) {
  const prices = new Map(storedRows.map((row) => [row.item_key, row.price]))
  const withPrice = (section, item) => ({
    ...item,
    price: normalizePrice(prices.get(`${section}:${item.id}`), item.price),
  })
  // Retired discounts must not return through a stale database row, content
  // snapshot, or saved drink-builder selection. The cup is a preference only.
  const { clientDiscountPercent, ...regularBeverages } = beverages

  return {
    ...regularBeverages,
    ecoDiscount: {
      hot300: 0,
      cold500: 0,
      shake: 0,
    },
    matchaGrades: beverages.matchaGrades.map((item) => withPrice("matcha", item)),
    cold: beverages.cold.map((item) => withPrice("cold", item)),
    hot: beverages.hot.map((item) => withPrice("hot", item)),
    extras: beverages.extras.map((item) => withPrice("extras", item)),
    proteinShake: withPrice("shake", beverages.proteinShake),
  }
}
