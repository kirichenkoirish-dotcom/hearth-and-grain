const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Цена хранится в грошах: 1400 → "14.00 zł"
export function formatPrice(grosze: number) {
  return `${priceFormatter.format(grosze / 100)} zł`;
}
