import type { TranslationEntry } from './i18nDictionary'

export const DICT_SECURITY: Record<string, TranslationEntry> = {
  'set.region.deliverySub': {
    es: 'Si está desactivado, el carrito solo muestra retiro en el local.',
    en: 'When off, the cart only offers in-store pickup.',
    pt: 'Quando desativado, o carrinho só oferece retirada na loja.',
  },
  'set.security.subtitle': {
    es: 'Tu acceso a la cuenta.',
    en: 'Your account access.',
    pt: 'Seu acesso à conta.',
  },
  'set.security.passwordless': {
    es: 'Tu cuenta usa acceso sin contraseña: ingresás con un código que enviamos a tu email.',
    en: 'Your account uses passwordless access: you log in with a code we send to your email.',
    pt: 'Sua conta usa acesso sem senha: você entra com um código que enviamos ao seu e-mail.',
  },
  'set.security.email': { es: 'Email de acceso', en: 'Login email', pt: 'E-mail de acesso' },
  'set.security.role': { es: 'Rol', en: 'Role', pt: 'Função' },
  'set.security.logout': { es: 'Cerrar sesión', en: 'Log out', pt: 'Sair' },
}
