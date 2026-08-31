import type { TranslationEntry } from './i18nDictionary'

/** Copy for the shop's social links: the fields in Configuración → Marca and
 *  the icon labels in the public footer. Network names are proper nouns and
 *  stay identical across languages; only "website" is really translated. */
export const DICT_SOCIALS: Record<string, TranslationEntry> = {
  'social.title': {
    es: 'Tus redes sociales',
    en: 'Your social networks',
    pt: 'Suas redes sociais',
  },
  'social.subtitle': {
    es:
      'Pegá el link completo de cada perfil. Se muestran como íconos al pie de tu ' +
        'lista pública; las que dejes vacías no aparecen.',
    en:
      'Paste the full link to each profile. They appear as icons at the foot of your ' +
        'public list; the ones you leave empty are not shown.',
    pt:
      'Cole o link completo de cada perfil. Aparecem como ícones no rodapé da sua lista ' +
        'pública; as que ficarem vazias não aparecem.',
  },

  'social.instagram': { es: 'Instagram', en: 'Instagram', pt: 'Instagram' },
  'social.facebook': { es: 'Facebook', en: 'Facebook', pt: 'Facebook' },
  'social.whatsapp': { es: 'WhatsApp', en: 'WhatsApp', pt: 'WhatsApp' },
  'social.tiktok': { es: 'TikTok', en: 'TikTok', pt: 'TikTok' },
  'social.website': { es: 'Sitio web', en: 'Website', pt: 'Site' },

  'social.error.link': {
    es: 'No parece un link válido. Copiá y pegá la dirección completa de tu perfil.',
    en: 'That does not look like a valid link. Copy and paste the full address of your profile.',
    pt: 'Isso não parece um link válido. Copie e cole o endereço completo do seu perfil.',
  },
  'social.error.phone': {
    es: 'Poné el número con código de país, por ejemplo +598 99 123 456.',
    en: 'Enter the number with its country code, for example +598 99 123 456.',
    pt: 'Informe o número com o código do país, por exemplo +598 99 123 456.',
  },
  'social.error.long': {
    es: 'El link es demasiado largo.',
    en: 'That link is too long.',
    pt: 'Esse link é longo demais.',
  },
}
