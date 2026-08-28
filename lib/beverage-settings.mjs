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

const normalizePercentage = (value, fallback) => {
  const parsed = normalizePrice(value, fallback)
  return parsed <= 100 ? parsed : fallback
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

  rows.push(
    {
      item_key: "discount:eco-cup",
      label: "Descuento Eco-Friendly por llevar termo",
      description: "Se aplica a matcha, bebidas frías y shakes.",
      section: "discounts",
      section_label: "Descuentos",
      unit: "mxn",
      price: beverages.ecoDiscount.cold500,
      display_order: 10,
    },
    {
      item_key: "discount:client-percent",
      label: "Descuento para clientes Nessty/JJ Studio",
      description: "Se calcula después de descontar el termo.",
      section: "discounts",
      section_label: "Descuentos",
      unit: "percent",
      price: beverages.clientDiscountPercent,
      display_order: 20,
    },
  )

  return rows
}

export function mergeBeveragePriceRows(defaultRows, storedRows = []) {
  const storedByKey = new Map(storedRows.map((row) => [row.item_key, row]))
  return defaultRows.map((row) => ({
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
  const ecoCupDiscount = normalizePrice(prices.get("discount:eco-cup"), beverages.ecoDiscount.cold500)
  const clientDiscountPercent = normalizePercentage(prices.get("discount:client-percent"), beverages.clientDiscountPercent)

  return {
    ...beverages,
    ecoDiscount: {
      ...beverages.ecoDiscount,
      cold500: ecoCupDiscount,
      shake: ecoCupDiscount,
    },
    clientDiscountPercent,
    matchaGrades: beverages.matchaGrades.map((item) => withPrice("matcha", item)),
    cold: beverages.cold.map((item) => withPrice("cold", item)),
    hot: beverages.hot.map((item) => withPrice("hot", item)),
    extras: beverages.extras.map((item) => withPrice("extras", item)),
    proteinShake: withPrice("shake", beverages.proteinShake),
  }
}
