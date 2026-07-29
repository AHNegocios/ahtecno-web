const normalizePrice = (value) => {
  const price = Number(value)
  return Number.isFinite(price) && price > 0
    ? Math.round(price * 100) / 100
    : null
}

export const hasPriceChanged = (previousValue, nextValue) => {
  const previous = normalizePrice(previousValue)
  const next = normalizePrice(nextValue)
  if (next === null) return false
  if (previous === null) return true
  return previous !== next
}

const isMissingHistoryTable = (error) =>
  ['42P01', 'PGRST205'].includes(String(error?.code || '')) ||
  /product_price_history.*(?:does not exist|schema cache)/i.test(
    String(error?.message || ''),
  )

export const recordPriceHistory = async (
  supabase,
  previousProduct,
  nextProduct,
  changeReason = 'sync',
) => {
  if (!hasPriceChanged(previousProduct?.precio, nextProduct?.precio)) {
    return { recorded: false }
  }

  const { error } = await supabase.from('product_price_history').insert({
    product_id: String(nextProduct.id),
    price: normalizePrice(nextProduct.precio),
    currency_id: String(nextProduct.currency_id || 'ARS'),
    price_source: String(nextProduct.price_source || 'manual'),
    change_reason: String(changeReason || 'sync'),
  })

  if (error && !isMissingHistoryTable(error)) {
    console.error(error)
  }

  return { recorded: !error }
}
