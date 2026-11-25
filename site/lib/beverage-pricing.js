function calculateDrinkPrice({
  basePrice,
  extrasTotal = 0,
}) {
  // Legacy callers may still submit a cup/client discount. Never apply it.
  const beverageSubtotal = Math.max(0, basePrice)

  return {
    beverageSubtotal,
    beverageTotal: beverageSubtotal,
    total: beverageSubtotal + extrasTotal,
  }
}

exports.calculateDrinkPrice = calculateDrinkPrice
