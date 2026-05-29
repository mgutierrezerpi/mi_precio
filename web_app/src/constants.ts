// Default values
export const DEFAULT_CURRENCY = 'UYU'

// Available currencies
export const CURRENCIES = [
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'USD', name: 'Dólar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'BRL', name: 'Real', symbol: 'R$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
] as const

export const CURRENCY_SYMBOLS: Record<string, string> = {
  UYU: '$',
  ARS: '$',
  USD: '$',
  EUR: '€',
  BRL: 'R$',
  CLP: '$',
  MXN: '$',
  COP: '$',
  PEN: 'S/',
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || '$'
}
