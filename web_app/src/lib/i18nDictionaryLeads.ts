import type { TranslationEntry } from './i18nDictionary'

/** Copy for lead capture: the form a customer sees on the public list, and the
 *  CRM's Leads inbox. */
export const DICT_LEADS: Record<string, TranslationEntry> = {
  /* ── The public form ───────────────────────────────────────────── */
  'lead.title': {
    es: '¿Querés que te contactemos?',
    en: 'Want us to get in touch?',
    pt: 'Quer que a gente entre em contato?',
  },
  'lead.subtitle': {
    es: 'Dejanos tus datos y te escribimos.',
    en: 'Leave your details and we will write to you.',
    pt: 'Deixe seus dados e a gente te escreve.',
  },
  'lead.name': { es: 'Tu nombre', en: 'Your name', pt: 'Seu nome' },
  'lead.phone': {
    es: 'Teléfono o WhatsApp',
    en: 'Phone or WhatsApp',
    pt: 'Telefone ou WhatsApp',
  },
  'lead.email': {
    es: 'Email (opcional)',
    en: 'Email (optional)',
    pt: 'E-mail (opcional)',
  },
  'lead.message': {
    es: 'Contanos qué necesitás (opcional)',
    en: 'Tell us what you need (optional)',
    pt: 'Conte o que você precisa (opcional)',
  },
  'lead.submit': { es: 'Enviar', en: 'Send', pt: 'Enviar' },
  'lead.sending': { es: 'Enviando…', en: 'Sending…', pt: 'Enviando…' },
  'lead.thanksTitle': { es: '¡Gracias!', en: 'Thank you!', pt: 'Obrigado!' },
  'lead.thanksBody': {
    es: 'Recibimos tus datos y te vamos a contactar.',
    en: 'We got your details and will be in touch.',
    pt: 'Recebemos seus dados e entraremos em contato.',
  },

  /* ── The CRM inbox ─────────────────────────────────────────────── */
  'leads.title': { es: 'Leads', en: 'Leads', pt: 'Leads' },
  'leads.subtitle': {
    es: 'Gente que dejó sus datos en tus listas.',
    en: 'People who left their details on your lists.',
    pt: 'Pessoas que deixaram seus dados nas suas listas.',
  },
  'leads.empty': {
    es: 'Todavía no llegó ningún lead.',
    en: 'No leads yet.',
    pt: 'Nenhum lead ainda.',
  },
  'leads.emptyHelp': {
    es: 'Prendé el formulario en Configuración → Marca para empezar a recibirlos.',
    en: 'Turn the form on in Settings → Brand to start receiving them.',
    pt: 'Ative o formulário em Configurações → Marca para começar a recebê-los.',
  },
  'leads.column.contact': { es: 'Contacto', en: 'Contact', pt: 'Contato' },
  'leads.column.list': { es: 'Lista', en: 'List', pt: 'Lista' },
  'leads.column.status': { es: 'Estado', en: 'Status', pt: 'Status' },
  'leads.column.date': { es: 'Llegó', en: 'Received', pt: 'Chegou' },
  'leads.status.new': { es: 'Nuevo', en: 'New', pt: 'Novo' },
  'leads.status.contacted': {
    es: 'Contactado',
    en: 'Contacted',
    pt: 'Contatado',
  },
  'leads.status.converted': { es: 'Cliente', en: 'Customer', pt: 'Cliente' },
  'leads.status.discarded': {
    es: 'Descartado',
    en: 'Discarded',
    pt: 'Descartado',
  },
  'leads.source.form': { es: 'Formulario', en: 'Form', pt: 'Formulário' },
  'leads.source.cart': { es: 'Carrito', en: 'Cart', pt: 'Carrinho' },
  'leads.action.whatsapp': {
    es: 'Escribir por WhatsApp',
    en: 'Message on WhatsApp',
    pt: 'Falar no WhatsApp',
  },
  'leads.action.contacted': {
    es: 'Marcar contactado',
    en: 'Mark contacted',
    pt: 'Marcar contatado',
  },
  'leads.action.convert': {
    es: 'Pasar a clientes',
    en: 'Make a customer',
    pt: 'Tornar cliente',
  },
  'leads.action.discard': { es: 'Descartar', en: 'Discard', pt: 'Descartar' },
  'leads.tab.all': { es: 'Todos', en: 'All', pt: 'Todos' },
  'leads.upsellTitle': {
    es: 'Los leads vienen con Plus y Pro',
    en: 'Leads come with Plus and Pro',
    pt: 'Os leads vêm com Plus e Pro',
  },
  'leads.upsellBody': {
    es: 'Sumá un formulario a tus listas públicas y recibí los contactos acá.',
    en: 'Add a form to your public lists and collect the contacts here.',
    pt: 'Adicione um formulário às suas listas públicas e receba os contatos aqui.',
  },
  'leads.upsellCta': { es: 'Ver planes', en: 'See plans', pt: 'Ver planos' },

  /* ── The settings toggle ───────────────────────────────────────── */
  'set.leads.title': {
    es: 'Formulario de contacto',
    en: 'Contact form',
    pt: 'Formulário de contato',
  },
  'set.leads.help': {
    es: 'Muestra un formulario al pie de tus listas públicas. Los contactos llegan a la pestaña Leads.',
    en: 'Shows a form at the foot of your public lists. Contacts land in the Leads tab.',
    pt: 'Mostra um formulário no rodapé das suas listas públicas. Os contatos chegam na aba Leads.',
  },
  'set.leads.locked': {
    es: 'Disponible en los planes Plus y Pro.',
    en: 'Available on the Plus and Pro plans.',
    pt: 'Disponível nos planos Plus e Pro.',
  },
  'notif.leads': { es: 'Leads', en: 'Leads', pt: 'Leads' },
  'notif.leadsDesc': {
    es: 'Cuando alguien deja sus datos en una lista.',
    en: 'When someone leaves their details on a list.',
    pt: 'Quando alguém deixa seus dados em uma lista.',
  },
}
