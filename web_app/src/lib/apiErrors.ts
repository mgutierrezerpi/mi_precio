/** Turns an API error body into a sentence a shop owner can act on.
 *
 *  The API answers in three shapes: a plain `detail` string (some in English,
 *  like «Invalid or expired code»), `{ code, message }` for the plan gate, and
 *  FastAPI's 422 list of field errors. The client used to show the English
 *  strings as they came and every 422 as «Error 422». */

const EXACT: Record<string, string> = {
  'Invalid or expired code':
    'El código no es válido o ya venció. Pedí uno nuevo.',
  'Invalid or expired token': 'Tu sesión venció. Volvé a entrar.',
  'Not authenticated': 'Tu sesión venció. Volvé a entrar.',
  'Subdomain already in use':
    'Esa dirección ya la usa otro negocio. Probá con otra.',
  'Subdomain must be at least 3 characters':
    'La dirección tiene que tener al menos 3 caracteres.',
  'Subdomain must be at most 63 characters':
    'La dirección puede tener hasta 63 caracteres.',
  'Subdomain can only contain lowercase letters, numbers, and hyphens':
    'La dirección sólo puede tener letras minúsculas, números y guiones.',
  'Public links must start with http:// or https://':
    'Los links tienen que empezar con http:// o https://.',
  'WhatsApp must be a phone number with its country code':
    'El WhatsApp tiene que ser un número con código de país.',
  'Enter a valid email or phone number': 'Poné un email o un teléfono válido.',
  'Email or phone is required': 'Poné un email o un teléfono.',
  'Name is required': 'Poné un nombre.',
  'Access code required': 'Esta lista pide un código de acceso.',
  'Invalid access code': 'El código de acceso no es correcto.',
  'Access code must be between 4 and 64 characters':
    'El código de acceso tiene que tener entre 4 y 64 caracteres.',
  'Image is too large': 'La imagen es demasiado pesada.',
  'Unsupported image type': 'Ese formato de imagen no está soportado.',
  'Super admin access required': 'No tenés permisos para esta acción.',
  'This version content changed. Reload before saving again.':
    'Alguien más cambió esta lista. Recargá antes de volver a guardar.',
  'No published lists found': 'Este negocio todavía no publicó listas.',
  'Viewer capture is not enabled': 'Esta lista no pide datos a los visitantes.',
}

/** Field names as FastAPI reports them, said in Spanish. */
const FIELDS: Record<string, string> = {
  subdomain: 'la dirección',
  public_slug: 'el link público',
  name: 'el nombre',
  email: 'el email',
  phone: 'el teléfono',
  price: 'el precio',
  currency: 'la moneda',
  code: 'el código',
  sku: 'el SKU',
  description: 'la descripción',
}

const NOT_FOUND = 'No encontramos lo que buscabas. Puede que se haya borrado.'

function translate(message: string): string {
  const text = message.replace(/^Value error, /, '').trim()
  if (EXACT[text]) return EXACT[text]
  if (/^(\w+\s)*not found$/i.test(text) || text === 'No encontrado')
    return NOT_FOUND
  return text
}

interface FieldError {
  loc?: (string | number)[]
  msg?: string
  type?: string
}

function fieldMessage(error: FieldError): string | null {
  // Our own validators raise ValueError, which pydantic prefixes with
  // «Value error, »: those messages are already written for people.
  if (error.type === 'value_error' && error.msg) return translate(error.msg)
  const field = String(error.loc?.at(-1) ?? '')
  const name = FIELDS[field]
  if (error.type === 'missing')
    return name ? `Falta ${name}.` : 'Falta completar un dato.'
  return name
    ? `Revisá ${name}: no es válido.`
    : 'Revisá los datos: hay uno que no es válido.'
}

export function apiErrorMessage(status: number, detail: unknown): string {
  if (typeof detail === 'string') return translate(detail)
  if (Array.isArray(detail)) {
    const first = detail.map((e) => fieldMessage(e as FieldError)).find(Boolean)
    if (first) return first
  }
  if (detail && typeof detail === 'object' && 'message' in detail) {
    const message = (detail as { message?: unknown }).message
    if (typeof message === 'string') return translate(message)
  }
  if (status === 404) return NOT_FOUND
  if (status >= 500)
    return 'Algo falló de nuestro lado. Probá de nuevo en un momento.'
  return 'No se pudo completar la acción. Probá de nuevo.'
}
