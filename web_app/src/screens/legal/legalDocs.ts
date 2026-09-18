// Legal pages content. Written against what the app actually does (data model,
// third parties, cookies) — keep it in sync when any of those change.
// The owner's legal identity isn't set up yet: every [COMPLETAR] must be filled
// before these pages go to production.

export type LegalSlug = 'terminos' | 'privacidad' | 'cookies'

export type LegalBlock = string | { list: string[] }

export interface LegalSection {
  title: string
  body: LegalBlock[]
}

export interface LegalDoc {
  slug: LegalSlug
  navLabel: string
  title: string
  intro: string
  sections: LegalSection[]
}

export const LEGAL_UPDATED_AT = '18 de septiembre de 2026'
export const LEGAL_CONTACT_EMAIL = 'soporte@miprecio.app'

const OWNER =
  '[COMPLETAR: nombre o razón social], RUT [COMPLETAR], con domicilio en [COMPLETAR], Uruguay'

const terminos: LegalDoc = {
  slug: 'terminos',
  navLabel: 'Términos y condiciones',
  title: 'Términos y condiciones',
  intro:
    'Estos términos regulan el uso de MiPrecio. Al crear una cuenta o usar el servicio aceptás estas condiciones. Si no estás de acuerdo, no uses el servicio.',
  sections: [
    {
      title: '1. Quiénes somos',
      body: [
        `MiPrecio es un servicio prestado por ${OWNER} (en adelante, “MiPrecio”, “nosotros”). Podés escribirnos a ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
    {
      title: '2. Qué es el servicio',
      body: [
        'MiPrecio es una plataforma para que comercios carguen sus productos y precios y los compartan con sus clientes a través de un link, un código QR o un catálogo público. Incluye un panel de administración, listas públicas o privadas, registro de consultas de clientes y, según el plan, funciones adicionales.',
        'Las funciones disponibles dependen del plan contratado y pueden cambiar con el tiempo. Cuando un cambio reduzca funciones de un plan pago vigente, te avisaremos con anticipación razonable.',
      ],
    },
    {
      title: '3. Tu cuenta',
      body: [
        {
          list: [
            'El servicio está pensado para comercios y profesionales. Tenés que ser mayor de 18 años y tener capacidad para contratar en nombre del comercio que registrás.',
            'Ingresás con tu email y un código de un solo uso que te enviamos. Sos responsable de mantener seguro el acceso a tu casilla de correo y de toda actividad que ocurra en tu cuenta.',
            'Podés invitar a otras personas a tu equipo y asignarles un rol. El titular de la cuenta es responsable de lo que hagan los miembros que invita.',
            'Tenés que darnos información veraz y mantenerla actualizada.',
          ],
        },
      ],
    },
    {
      title: '4. Planes, prueba gratis y pagos',
      body: [
        'Los precios vigentes de cada plan se publican en nuestra web. Los planes pagos se cobran por adelantado y se renuevan automáticamente cada período hasta que los canceles.',
        'Los planes pagos incluyen una prueba gratis de 14 días. Para iniciarla se pide un medio de pago; si no cancelás antes de que termine la prueba, se cobra el primer período.',
        'Los pagos los procesa Lemon Squeezy, que actúa como revendedor autorizado (merchant of record) y emite el comprobante correspondiente. Los datos de tu tarjeta los maneja Lemon Squeezy; nosotros sólo vemos la marca y los últimos cuatro dígitos.',
        'Podemos cambiar los precios. Si lo hacemos, te avisaremos antes de que el nuevo precio se aplique a tu próxima renovación.',
      ],
    },
    {
      title: '5. Cancelación y cambios de plan',
      body: [
        'Podés cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. La cancelación rige al final del período ya pagado: hasta esa fecha conservás el plan y podés reanudarlo. No se hacen reintegros parciales por el tiempo restante del período en curso, salvo que la ley aplicable disponga lo contrario.',
        'Si tu plan vence o pasás a uno con menos capacidad, tus listas no se borran: las que excedan el nuevo límite dejan de mostrarse al público hasta que vuelvas a tener capacidad para ellas.',
      ],
    },
    {
      title: '6. Tu contenido',
      body: [
        'Todo lo que cargás en MiPrecio (productos, precios, imágenes, logos, textos) sigue siendo tuyo. Nos das una licencia no exclusiva, gratuita y limitada para alojarlo, procesarlo y mostrarlo en la medida necesaria para prestarte el servicio, por ejemplo en tus listas públicas y en el catálogo de comercios.',
        'Sos el único responsable de ese contenido: de que los precios y descripciones sean correctos, de cumplir con las normas de defensa del consumidor y de publicidad que te apliquen, y de tener los derechos sobre las imágenes y marcas que subís.',
        'La importación automática de menús usa inteligencia artificial y puede cometer errores. Revisá siempre los productos y precios importados antes de publicarlos.',
      ],
    },
    {
      title: '7. Datos de tus clientes',
      body: [
        'Si usás MiPrecio para recibir consultas o registrar datos de tus propios clientes (por ejemplo nombre, email o teléfono de quien consulta desde tu lista), vos sos el responsable de esa base de datos y MiPrecio actúa como encargado del tratamiento: la tratamos sólo para prestarte el servicio y según tus instrucciones.',
        'Te comprometés a tener una base legal para tratar esos datos y a informar a tus clientes como exige la Ley 18.331. El detalle está en nuestra Política de privacidad.',
      ],
    },
    {
      title: '8. Uso aceptable',
      body: [
        'No podés usar MiPrecio para:',
        {
          list: [
            'publicar contenido ilegal, engañoso, que infrinja derechos de terceros o que ofrezca productos cuya venta esté prohibida;',
            'enviar spam o recolectar datos de personas sin su consentimiento;',
            'intentar acceder a cuentas o datos ajenos, vulnerar la seguridad del servicio o sobrecargarlo;',
            'revender o sublicenciar el servicio sin nuestra autorización por escrito.',
          ],
        },
        'Si incumplís estos términos podemos retirar el contenido afectado, suspender o cerrar tu cuenta. Salvo casos graves o urgentes, te avisaremos antes y te daremos la oportunidad de corregirlo.',
      ],
    },
    {
      title: '9. Disponibilidad del servicio',
      body: [
        'Trabajamos para que MiPrecio esté disponible y funcione bien, pero el servicio se presta “tal como está”. Puede haber interrupciones por mantenimiento, fallas técnicas o causas ajenas a nosotros, y no garantizamos que esté libre de errores.',
        'Te recomendamos conservar tu propia copia de la información importante de tu comercio.',
      ],
    },
    {
      title: '10. Responsabilidad',
      body: [
        'En la medida en que la ley lo permita, MiPrecio no responde por daños indirectos, lucro cesante o pérdida de datos derivados del uso o de la imposibilidad de usar el servicio, ni por errores en el contenido que publicás. Nuestra responsabilidad total frente a vos se limita al monto que hayas pagado por el servicio en los 12 meses anteriores al hecho que la origine.',
        'Nada de lo anterior limita los derechos que la legislación de defensa del consumidor te reconozca y que no puedan renunciarse.',
      ],
    },
    {
      title: '11. Baja de la cuenta',
      body: [
        'Podés eliminar tu comercio desde la configuración de la cuenta. Es una acción permanente: se borran los productos, listas, clientes, consultas y demás información asociada, y no se puede recuperar. Antes de eliminarlo, cancelá tu suscripción si tenés una activa.',
      ],
    },
    {
      title: '12. Cambios en estos términos',
      body: [
        'Podemos actualizar estos términos. Si el cambio es relevante, te avisaremos por email o dentro de la aplicación antes de que entre en vigor. Si seguís usando el servicio después de esa fecha, se entiende que aceptás la nueva versión.',
      ],
    },
    {
      title: '13. Ley aplicable y jurisdicción',
      body: [
        'Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier controversia se someterá a los tribunales competentes de la ciudad de Montevideo, sin perjuicio de los fueros que la ley reconozca a los consumidores.',
      ],
    },
  ],
}

const privacidad: LegalDoc = {
  slug: 'privacidad',
  navLabel: 'Política de privacidad',
  title: 'Política de privacidad',
  intro:
    'Esta política explica qué datos personales tratamos en MiPrecio, para qué, con quién los compartimos y cómo podés ejercer tus derechos, de acuerdo con la Ley 18.331 de Protección de Datos Personales y su Decreto reglamentario 414/009.',
  sections: [
    {
      title: '1. Responsable',
      body: [
        `El responsable de las bases de datos de MiPrecio es ${OWNER}. Para cualquier consulta sobre privacidad escribinos a ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
    {
      title: '2. Dos roles distintos',
      body: [
        {
          list: [
            'Responsable: sobre los datos de quienes usan MiPrecio para administrar su comercio (titulares y miembros del equipo). Decidimos cómo y para qué se tratan.',
            'Encargado: sobre los datos que cada comercio registra de sus propios clientes y visitantes (por ejemplo, quien deja su nombre y teléfono para consultar una lista). Ahí el responsable es el comercio; nosotros sólo guardamos y procesamos esos datos para prestarle el servicio. Si sos cliente de un comercio y querés ejercer tus derechos, contactá primero al comercio; también podés escribirnos y le trasladaremos tu pedido.',
          ],
        },
      ],
    },
    {
      title: '3. Qué datos tratamos',
      body: [
        'De quienes usan el panel:',
        {
          list: [
            'Cuenta: email, nombre, rol dentro del comercio y fecha de último acceso.',
            'Comercio: nombre, dirección web, moneda, logo y colores, redes sociales, WhatsApp y, si los completás, razón social, RUT y domicilio fiscal. Si activás el catálogo de comercios, la ubicación aproximada que elijas.',
            'Facturación: plan, estado de la suscripción, fechas de renovación, y marca y últimos cuatro dígitos de la tarjeta. No guardamos el número completo de la tarjeta.',
            'Actividad: un registro de las acciones hechas en el panel (quién cambió qué y cuándo), para que el equipo pueda seguir los cambios.',
            'Notificaciones: si las activás, el identificador que el navegador genera para enviarte notificaciones push.',
            'Soporte: lo que nos escribas al abrir un pedido de ayuda.',
          ],
        },
        'De los clientes y visitantes de cada comercio (como encargado):',
        {
          list: [
            'Clientes que el comercio carga: nombre, RUT, email, teléfono, notas y pedidos.',
            'Consultas enviadas desde una lista: nombre, teléfono, email y mensaje.',
            'Visitantes que se identifican para ver una lista: nombre, email o teléfono, dirección IP, cantidad de visitas y fecha de la última.',
            'Estadísticas de visitas a las listas: cuándo se abrió una lista y si fue por link o por QR. Estas estadísticas no guardan IP ni datos del dispositivo.',
          ],
        },
      ],
    },
    {
      title: '4. Para qué los usamos',
      body: [
        {
          list: [
            'Prestar el servicio: crear tu cuenta, dejarte ingresar, mostrar tus listas y registrar las consultas que recibís.',
            'Cobrar la suscripción y gestionar la prueba gratis, renovaciones y cancelaciones.',
            'Enviarte emails necesarios del servicio: códigos de acceso, invitaciones a un equipo y avisos sobre tu suscripción.',
            'Darte soporte cuando lo pedís.',
            'Medir de forma agregada cómo se usa el sitio para mejorarlo, y detectar y corregir errores.',
            'Cumplir obligaciones legales.',
          ],
        },
        'No vendemos tus datos ni los usamos para publicidad de terceros.',
      ],
    },
    {
      title: '5. Con quién los compartimos',
      body: [
        'Para funcionar usamos proveedores que tratan datos por cuenta nuestra, sólo en lo necesario para cada tarea:',
        {
          list: [
            'Fly.io: alojamiento de la aplicación, la base de datos y las imágenes (servidores en Brasil).',
            'Lemon Squeezy: cobro de suscripciones. Recibe tu email, nombre y el plan elegido; los datos de la tarjeta los ingresás directamente en su sistema.',
            'SendGrid (Twilio): envío de emails transaccionales. Recibe tu email y el contenido del mensaje.',
            'Zoho Desk: gestión de pedidos de soporte. Recibe tu nombre, email y el contenido de tu consulta.',
            'OpenAI: sólo si usás la importación automática de menús, recibe el texto o las imágenes del menú que importás.',
            'Outscraper: sólo si importás desde un link de Google Maps, consulta los datos públicos de ese local.',
            'Servicios de notificaciones push del navegador (Google, Apple, Mozilla, Microsoft): reciben el título y el texto de cada notificación que activás.',
            'Google Fonts: sirve las tipografías del sitio, por lo que tu navegador se conecta a sus servidores al cargar la página.',
          ],
        },
        'También podemos revelar datos si una autoridad competente lo exige conforme a la ley.',
      ],
    },
    {
      title: '6. Transferencias internacionales',
      body: [
        'Varios de estos proveedores están fuera de Uruguay (principalmente en Estados Unidos y Brasil). Al usar el servicio consentís esas transferencias, que se hacen a proveedores que asumen obligaciones de confidencialidad y seguridad sobre los datos, conforme al artículo 23 de la Ley 18.331.',
      ],
    },
    {
      title: '7. Cuánto tiempo los guardamos',
      body: [
        {
          list: [
            'Los datos de tu cuenta y de tu comercio, mientras la cuenta esté activa. Al eliminar el comercio se borran de nuestra base de datos.',
            'Los códigos de acceso vencen a los 10 minutos y se eliminan automáticamente.',
            'Los datos de clientes, consultas y visitantes se conservan hasta que el comercio los elimina o elimina su cuenta.',
            'Los datos de facturación que conserva Lemon Squeezy se rigen por sus propias obligaciones legales.',
          ],
        },
      ],
    },
    {
      title: '8. Seguridad',
      body: [
        'Usamos conexiones cifradas (HTTPS), ingreso sin contraseñas mediante códigos de un solo uso, códigos de acceso a listas privadas guardados de forma que no se pueden leer y permisos por rol dentro de cada comercio. Ningún sistema es infalible, pero aplicamos medidas razonables para proteger la información.',
      ],
    },
    {
      title: '9. Tus derechos',
      body: [
        'Podés pedir acceso a tus datos, su rectificación, actualización, inclusión o supresión, y oponerte a su tratamiento. Escribinos a ' +
          LEGAL_CONTACT_EMAIL +
          ' desde el email de tu cuenta. El acceso es gratuito y te respondemos dentro de los plazos que fija la ley (5 días hábiles para el acceso y la rectificación o supresión).',
        'Muchos de tus datos los podés corregir directamente desde la configuración de tu cuenta, y podés eliminar tu comercio desde allí mismo.',
        'Si considerás que no respetamos tus derechos, podés presentar una denuncia ante la Unidad Reguladora y de Control de Datos Personales (URCDP), www.gub.uy/urcdp.',
      ],
    },
    {
      title: '10. Menores de edad',
      body: [
        'MiPrecio está dirigido a comercios y no está pensado para menores de 18 años. No recolectamos a sabiendas datos de menores.',
      ],
    },
    {
      title: '11. Cambios en esta política',
      body: [
        'Si hacemos cambios relevantes te avisaremos por email o dentro de la aplicación. La fecha de la última actualización figura al principio de esta página.',
      ],
    },
  ],
}

const cookies: LegalDoc = {
  slug: 'cookies',
  navLabel: 'Política de cookies',
  title: 'Política de cookies',
  intro:
    'MiPrecio usa muy poco almacenamiento en tu navegador y todo es necesario para que el servicio funcione o recuerde tus preferencias. No usamos cookies de publicidad ni de seguimiento entre sitios.',
  sections: [
    {
      title: '1. Qué son',
      body: [
        'Las cookies y el almacenamiento local (localStorage) son pequeños archivos o datos que un sitio guarda en tu navegador para recordar información entre una visita y otra.',
      ],
    },
    {
      title: '2. Cookies que usamos',
      body: [
        {
          list: [
            'miprecio_viewer (propia, necesaria, dura 1 año): se guarda cuando te identificás para ver la lista de un comercio o desbloqueás una lista privada, para no pedirte los datos en cada visita. No es accesible desde JavaScript.',
          ],
        },
      ],
    },
    {
      title: '3. Almacenamiento local',
      body: [
        'Cuando usás el panel de administración guardamos en tu navegador:',
        {
          list: [
            'Tu sesión (token de acceso y datos básicos de tu cuenta y comercio), para que no tengas que ingresar cada vez. La sesión dura 30 días.',
            'Preferencias de la interfaz: densidad de las tablas, cantidad de productos por página y color elegido para el código QR.',
            'El avance del recorrido de bienvenida y de la lista de primeros pasos, para no volver a mostrártelos.',
            'Durante el pago, el plan que elegiste, hasta que se completa la compra.',
          ],
        },
        'La aplicación también puede instalarse como app (PWA) y guarda en caché sus propios archivos para cargar más rápido.',
      ],
    },
    {
      title: '4. Analítica',
      body: [
        'Para medir de forma agregada cuántas personas visitan el sitio usamos Umami, una herramienta de analítica alojada por nosotros que no usa cookies ni identifica a las personas.',
      ],
    },
    {
      title: '5. Servicios de terceros',
      body: [
        'Al cargar el sitio tu navegador se conecta a Google Fonts para descargar las tipografías. Al pagar una suscripción entrás al checkout de Lemon Squeezy, que usa sus propias cookies según su política.',
      ],
    },
    {
      title: '6. Cómo controlarlas',
      body: [
        'Podés borrar las cookies y el almacenamiento local desde la configuración de tu navegador. Si lo hacés, se cerrará tu sesión y se perderán tus preferencias, y los comercios con listas privadas te volverán a pedir tus datos o el código de acceso.',
        `Si tenés dudas escribinos a ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
}

export const LEGAL_DOCS: LegalDoc[] = [terminos, privacidad, cookies]
