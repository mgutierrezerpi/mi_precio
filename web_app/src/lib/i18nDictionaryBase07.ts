import type { TranslationEntry } from './i18nTypes'

export const DICT_BASE_07: Record<string, TranslationEntry> = {
  'top.fullView': {
    es: 'Vista completa',
    en: 'Full view',
    pt: 'Visão completa',
  },

  'notif.title': {
    es: 'Notificaciones',
    en: 'Notifications',
    pt: 'Notificações',
  },
  'notif.live': { es: 'En vivo', en: 'Live', pt: 'Ao vivo' },
  'notif.empty': {
    es: 'No hay notificaciones todavía.',
    en: 'No notifications yet.',
    pt: 'Nenhuma notificação ainda.',
  },
  'notif.prefs': {
    es: 'Preferencias de notificaciones',
    en: 'Notification preferences',
    pt: 'Preferências de notificações',
  },

  // ── Activity feed (rebuilt client-side from action + meta; falls back to the
  //    stored Spanish summary for pre-i18n rows or unknown actions) ──────────
  'activity.product.created': {
    es: 'Agregó el producto «{name}»',
    en: 'Added product “{name}”',
    pt: 'Adicionou o produto «{name}»',
  },
  'activity.product.deleted': {
    es: 'Eliminó el producto «{name}»',
    en: 'Deleted product “{name}”',
    pt: 'Excluiu o produto «{name}»',
  },
  'activity.list.created': {
    es: 'Creó la lista «{name}»',
    en: 'Created list “{name}”',
    pt: 'Criou a lista «{name}»',
  },
  'activity.list.published': {
    es: 'Publicó la lista «{name}»',
    en: 'Published list “{name}”',
    pt: 'Publicou a lista «{name}»',
  },
  'activity.customer.created': {
    es: 'Agregó el cliente «{name}»',
    en: 'Added customer “{name}”',
    pt: 'Adicionou o cliente «{name}»',
  },
  'activity.order.created': {
    es: 'Registró una compra de «{customer}» por {currency} {total}',
    en: 'Recorded a purchase from “{customer}” for {currency} {total}',
    pt: 'Registrou uma compra de «{customer}» por {currency} {total}',
  },
  'activity.member.invited': {
    es: 'Invitó a «{email}» como {role}',
    en: 'Invited “{email}” as {role}',
    pt: 'Convidou «{email}» como {role}',
  },
  'activity.member.role_changed': {
    es: 'Cambió el rol de «{email}» a {role}',
    en: 'Changed “{email}” role to {role}',
    pt: 'Alterou a função de «{email}» para {role}',
  },
  'activity.member.removed': {
    es: 'Quitó a «{email}» del equipo',
    en: 'Removed “{email}” from the team',
    pt: 'Removeu «{email}» da equipe',
  },
  'activity.plan.changed': {
    es: 'Cambió el plan a {plan}',
    en: 'Changed plan to {plan}',
    pt: 'Alterou o plano para {plan}',
  },
  'activity.billing.manual_sync': {
    es: 'Sincronizó el plan {plan} ({status})',
    en: 'Synced plan {plan} ({status})',
    pt: 'Sincronizou o plano {plan} ({status})',
  },
  // `event` + `plan` are localized from meta (billingEvent.*/plan). Rows without
  // meta.event fall back to the stored summary (see activityText).
  'activity.billing.webhook': {
    es: '{event} · plan {plan}',
    en: '{event} · {plan} plan',
    pt: '{event} · plano {plan}',
  },
  // Lemon Squeezy event labels.
  'billingEvent.subscription_created': {
    es: 'Suscripción iniciada',
    en: 'Subscription started',
    pt: 'Assinatura iniciada',
  },
  'billingEvent.subscription_updated': {
    es: 'Suscripción actualizada',
    en: 'Subscription updated',
    pt: 'Assinatura atualizada',
  },
  'billingEvent.subscription_cancelled': {
    es: 'Suscripción cancelada',
    en: 'Subscription cancelled',
    pt: 'Assinatura cancelada',
  },
  'billingEvent.subscription_resumed': {
    es: 'Suscripción reanudada',
    en: 'Subscription resumed',
    pt: 'Assinatura retomada',
  },
  'billingEvent.subscription_expired': {
    es: 'Suscripción vencida',
    en: 'Subscription expired',
    pt: 'Assinatura expirada',
  },
  'billingEvent.subscription_paused': {
    es: 'Suscripción pausada',
    en: 'Subscription paused',
    pt: 'Assinatura pausada',
  },
  'billingEvent.subscription_unpaused': {
    es: 'Suscripción reactivada',
    en: 'Subscription unpaused',
    pt: 'Assinatura reativada',
  },
  'billingEvent.subscription_payment_success': {
    es: 'Pago confirmado',
    en: 'Payment confirmed',
    pt: 'Pagamento confirmado',
  },
  'billingEvent.subscription_payment_failed': {
    es: 'Pago rechazado',
    en: 'Payment failed',
    pt: 'Pagamento recusado',
  },
  'billingEvent.subscription_payment_recovered': {
    es: 'Pago recuperado',
    en: 'Payment recovered',
    pt: 'Pagamento recuperado',
  },
}

