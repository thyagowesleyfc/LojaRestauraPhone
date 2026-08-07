export function formatMoneyFromCents(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueInCents / 100);
}

export function centsToInputValue(valueInCents: number) {
  return (valueInCents / 100).toFixed(2);
}
