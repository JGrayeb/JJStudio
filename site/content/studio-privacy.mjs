export const STUDIO_PRIVACY_PATH = "/aviso-de-privacidad"
export const STUDIO_PRIVACY_RECEPTION_PATH = "/aviso-videovigilancia.html"
export const STUDIO_PRIVACY_DATE = "2026-11-10"
export const STUDIO_PRIVACY_CONTACT = "administracion@jjstudio.mx"
export const STUDIO_PRIVACY_RESPONSIBLE = "Javier Gustavo García Macías"
export const STUDIO_PRIVACY_ADDRESS = "Plaza Xentric Lomas Norte, piso 2, local 211, La Purísima, C.P. 76146, Santiago de Querétaro, Querétaro, México"

export const studioPrivacyNotice = [
  {
    id: "responsable",
    title: "Quién trata tus datos",
    paragraphs: [
      `${STUDIO_PRIVACY_RESPONSIBLE}, quien opera JJStudio | Lagree Fitness Querétaro, es el responsable del tratamiento de los datos descritos en este aviso. El estudio se ubica en ${STUDIO_PRIVACY_ADDRESS}.`,
      `Para consultas y solicitudes sobre privacidad, escribe a ${STUDIO_PRIVACY_CONTACT}.`,
    ],
  },
  {
    id: "datos-y-finalidades",
    title: "Qué datos usamos y para qué",
    paragraphs: [
      "Los datos que se tratan dependen de si navegas, reservas, compras, creas una cuenta o asistes al estudio. Las finalidades de operación son gestionar tu solicitud y prestar el servicio.",
      "Las comunicaciones promocionales y el uso de tu imagen con fines publicitarios no son necesarios para prestar el servicio. Puedes pedir desde el primer contacto que no usemos tus datos para promociones o que dejemos de usarlos, por el correo indicado en este aviso. Si un uso requiere tu autorización, se solicita por separado.",
    ],
    items: [
      { label: "Identificación, contacto y cuenta", text: "Nombre, correo electrónico, teléfono e identificadores de cuenta o sesión, según el trámite. Permiten gestionar el acceso, responder solicitudes y comunicarnos sobre tu reserva, compra o renovación." },
      { label: "Reservas, compras y asistencia", text: "Nombre de quien tomará clase, datos de contacto del comprador, paquete, importe, referencia y estado de pago, y datos de la reserva o asistencia disponibles para el estudio. Se utilizan para aplicar compras, atender aclaraciones y administrar el servicio. Al pagar por Stripe, ingresas los datos de tarjeta en su pantalla de pago, no en un formulario de JJStudio." },
      { label: "Aceptación de condiciones", text: "En la compra web se registra la aceptación y la versión de los términos aplicables. La aceptación de quien compra no sustituye la de quien asiste. Si corresponde acreditar la autorización de una persona de 14 a 17 años, se necesitan los datos mínimos de la persona participante y de quien autoriza como representante legal." },
      { label: "Consultas e incidentes", text: "Usamos los mensajes y los datos necesarios para responderte, verificar una solicitud o atender y documentar un incidente. No envíes contraseñas, datos completos de tarjeta ni expedientes médicos por WhatsApp." },
    ],
  },
  {
    id: "salud",
    title: "Información de salud y datos sensibles",
    paragraphs: [
      "El dolor, las lesiones y las restricciones médicas que revelen tu estado de salud son datos sensibles. Comparte en privado con tu instructor solo la información necesaria para que pueda orientarte sobre el ejercicio o una adaptación segura. No incluyas diagnósticos ni expedientes en las notas de reserva.",
      "Si es necesario registrar información de salud, se explicará la finalidad y se solicitará por separado el consentimiento expreso y por escrito cuando corresponda. Los datos indispensables para atender una emergencia se tratarán según las excepciones y obligaciones aplicables. Aceptar los términos de clase no autoriza por sí mismo un registro de salud.",
    ],
  },
  {
    id: "camaras-e-imagen",
    title: "Cámaras de seguridad y uso de tu imagen",
    paragraphs: [
      "El estudio cuenta con videovigilancia las 24 horas. Las cámaras captan video sin audio para proteger a las personas y las instalaciones y atender incidentes. Solo el personal autorizado tiene acceso a las grabaciones. Las grabaciones de seguridad no se destinan a promoción.",
      "Las grabaciones se almacenan en la nube. Las ordinarias se eliminan después de 24 horas, salvo que el sistema marque automáticamente una grabación al detectar actividad inusual. Las grabaciones marcadas las revisa una sola persona autorizada.",
      "Si JJStudio desea grabarte o publicar imágenes en las que se te pueda identificar para promocionar el estudio, solicitará autorización expresa y separada. Negarte no afecta tu acceso a clase. Puedes revocar esa autorización para usos futuros por el contacto del estudio. Para la imagen de una persona menor de edad, debe autorizar quien ejerza la patria potestad o la represente, conforme a la ley.",
    ],
  },
  {
    id: "proveedores-y-plataformas",
    title: "Servicios y plataformas que intervienen",
    paragraphs: [
      "La operación digital utiliza servicios de alojamiento, cuenta, pagos, correo y gestión de activaciones. Cada servicio interviene en el flujo que corresponda a tu solicitud; no recibe necesariamente todas las categorías de datos de este aviso.",
      "Al abrir la agenda de Nessty, pagar en Stripe, contactar por WhatsApp o acceder a un mapa u otra plataforma externa, el proveedor también puede recabar información de acuerdo con su propio aviso. Cuando el estudio deba comunicar datos a otra persona o entidad, se limitará a los datos necesarios para la finalidad informada y solicitará tu consentimiento si la ley lo exige. En una emergencia o ante una obligación legal, podrán comunicarse los datos indispensables al servicio de asistencia o a la autoridad correspondiente, según proceda.",
    ],
    items: [
      { label: "Vercel y Supabase", text: "Alojamiento de la web y funciones de cuenta, inicio de sesión, perfil y administración de suscripciones." },
      { label: "Stripe y Nessty", text: "Procesamiento de compras web y suscripciones en Stripe; agenda, reservaciones y activación de paquetes en Nessty." },
      { label: "Google y servicio de correo", text: "Registro administrativo de activaciones cuando se utiliza la integración de Google, mapas de ubicación y envío de mensajes operativos o de renovación mediante el servicio de correo configurado." },
      { label: "WhatsApp", text: "Atención y seguimiento cuando eliges iniciar una conversación con el estudio." },
    ],
  },
  {
    id: "navegacion-y-medicion",
    title: "Almacenamiento del navegador y medición",
    paragraphs: [
      "El sitio usa almacenamiento del navegador para funciones como conservar tu sesión, recordar preferencias de compra y evitar duplicar mediciones. Vercel Analytics y Speed Insights miden visitas y rendimiento. Meta Pixel registra interacciones como páginas consultadas y eventos de contacto o compra para medir campañas. Estos servicios pueden recibir datos técnicos de navegación, eventos de uso y, en las compras, información como el paquete y el importe.",
      "La medición de campañas no es necesaria para tomar clases. Puedes consultar los controles de privacidad, cookies y bloqueo de rastreadores de tu navegador. Limitar el almacenamiento puede afectar funciones como mantener la sesión o recordar preferencias. También puedes pedir al estudio que limite el uso de tus datos para finalidades no necesarias.",
    ],
  },
  {
    id: "derechos-arco",
    title: "Tus derechos y cómo hacer una solicitud",
    paragraphs: [
      "Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos (derechos ARCO). Por los mismos medios puedes pedir que se limite su uso o divulgación, negarte a finalidades no necesarias o revocar un consentimiento para usos futuros. La revocación no es retroactiva y no impide conservar datos que deban mantenerse por una obligación legal.",
      "Escribe a administracion@jjstudio.mx indicando tu nombre, un medio para recibir respuesta, qué derecho deseas ejercer y la información que ayude a ubicar el registro. Si no solicitas acceso, describe los datos a los que se refiere la solicitud. Para rectificar, señala el cambio y su sustento. Para acreditar tu identidad o representación, solicita primero indicaciones sobre cómo presentar la documentación por un medio seguro.",
      "La ley prevé hasta 20 días hábiles desde que se recibe la solicitud para comunicar la determinación. Si procede, se hará efectiva en los 15 días hábiles siguientes a la respuesta. Los plazos pueden ampliarse una sola vez por un periodo igual si se justifica. El ejercicio es gratuito, salvo los costos de reproducción, copia o envío que permita la ley.",
    ],
  },
  {
    id: "conservacion-y-cambios",
    title: "Conservación y cambios del aviso",
    paragraphs: [
      "La conservación se limita al tiempo necesario para la finalidad informada y para atender obligaciones legales o reclamaciones. Una vez cumplidas esas finalidades y el plazo aplicable, los datos se bloquean o suprimen según corresponda.",
      "Los cambios se comunicarán en esta página, identificando la versión aplicable. Si un cambio requiere una nueva autorización, se solicitará por separado antes de aplicar el tratamiento correspondiente.",
    ],
  },
]
