function calculateDrinkPrice({
  basePrice,
  cupDiscount = 0,
  clientDiscountPercent = 0,
  extrasTotal = 0,
}) {
  const beverageSubtotal = Math.max(0, basePrice - cupDiscount)
  const clientDiscount = beverageSubtotal * (clientDiscountPercent / 100)
  const beverageTotal = beverageSubtotal - clientDiscount

  return {
    beverageSubtotal,
    clientDiscount,
    beverageTotal,
    total: beverageTotal + extrasTotal,
  }
}

exports.calculateDrinkPrice = calculateDrinkPrice
