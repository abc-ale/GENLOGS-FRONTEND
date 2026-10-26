const ALIAS_MONEDA: Record<string, string> = {
  'S/': 'PEN', 'S/.': 'PEN', 'SOL': 'PEN', 'SOLES': 'PEN', 'NUEVO SOL': 'PEN', 'NUEVOS SOLES': 'PEN',
  '$': 'USD', 'US$': 'USD', 'DOLAR': 'USD', 'DÓLAR': 'USD', 'DOLARES': 'USD', 'DÓLARES': 'USD',
  '€': 'EUR', 'EURO': 'EUR', 'EUROS': 'EUR',
}

/** Convierte símbolos de BD (S/, $, €) o nombres a código ISO (PEN, USD, EUR). Vacío => PEN. */
export function normalizarCodigoMoneda(valor?: string | null): string {
  const v = (valor ?? '').trim().toUpperCase()
  if (!v) return 'PEN'
  return ALIAS_MONEDA[v] ?? v
}

/** Siempre muestra el código ISO (PEN 10,404.30 / USD 61.83) en vez del símbolo (S/). */
export function formatCurrency(amount: number, currency = "PEN", locale = "es-PE"): string {
  const codigo = normalizarCodigoMoneda(currency)
  const monto = Number.isFinite(amount) ? amount : 0
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: codigo,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monto)
  } catch {
    // Código no válido recibido de la API: no debe tumbar la pantalla.
    return `${codigo} ${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto)}`
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PE").format(value)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}