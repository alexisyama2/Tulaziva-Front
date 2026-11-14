import { LEGAL } from '@/config/legal';

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
  /** Paragraphs shown after the list. */
  after?: string[];
}

export interface LegalDocumentContent {
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
}

type Language = 'es' | 'en';
export type LegalKind = 'terms' | 'privacy';

const { company, contactEmail, address, jurisdiction } = LEGAL;

// NOTE: these texts are a starting point written for a classifieds service operating in Mexico. They must be reviewed by a lawyer
// before the service opens to the public.

const termsEs: LegalDocumentContent = {
  title: 'Términos de uso',
  updated: 'Última actualización: 13 de noviembre de 2026',
  intro: [
    `Estos Términos de uso regulan el uso de ${company} (el «Servicio»), una plataforma de anuncios clasificados donde personas publican y encuentran bienes y servicios de segunda mano. Al crear una cuenta o usar el Servicio declaras que los leíste y los aceptas, junto con nuestro Aviso de privacidad.`,
    'Si no estás de acuerdo con ellos, no crees una cuenta ni uses el Servicio.',
  ],
  sections: [
    {
      title: 'Quién puede usar el Servicio',
      paragraphs: [
        'Debes tener al menos 18 años y capacidad legal para obligarte. El Servicio no está dirigido a menores de edad. Si descubrimos que una cuenta pertenece a un menor, la cerraremos.',
      ],
    },
    {
      title: 'Tu cuenta',
      items: [
        'Debes dar datos verdaderos y mantenerlos al día. Tu correo debe ser tuyo.',
        'Eres responsable de la confidencialidad de tu contraseña y de todo lo que se haga desde tu cuenta. Avísanos de inmediato si crees que alguien más la usa.',
        'No puedes suplantar a otra persona ni crear cuentas para evadir una suspensión o un bloqueo.',
      ],
    },
    {
      title: 'Contenido prohibido',
      paragraphs: [
        'Está prohibido publicar, ofrecer, solicitar o enviar por mensaje cualquier cosa que sea ilegal en los Estados Unidos Mexicanos o en el lugar donde se ofrezca, y en particular:',
      ],
      items: [
        'Material de abuso sexual infantil, o cualquier contenido sexual que involucre a menores de edad, aunque sea simulado o ilustrado. Tolerancia cero: lo reportamos a las autoridades.',
        'Trata de personas en cualquiera de sus formas: explotación sexual o laboral, mendicidad forzada, matrimonio forzado, venta, «renta» o traslado de personas, venta de menores o adopciones ilegales, y tráfico de órganos, tejidos o células.',
        'Armas de fuego, municiones, cartuchos, explosivos, pólvora y sus accesorios regulados, y armas prohibidas, así como su fabricación o conversión (Ley Federal de Armas de Fuego y Explosivos).',
        'Drogas y sustancias ilícitas, precursores químicos, medicamentos controlados o que requieran receta, y productos que prometan curas milagrosas (Ley General de Salud).',
        'Pornografía, contenido sexual explícito, y servicios sexuales o de acompañamiento de carácter sexual.',
        'Bienes robados o de procedencia ilícita, mercancía pirata o falsificada, y cualquier contenido que infrinja derechos de propiedad intelectual de terceros.',
        'Documentos oficiales falsos o alterados (identificaciones, actas, licencias, títulos, comprobantes), y datos personales, cuentas o tarjetas obtenidos sin autorización.',
        'Especies de fauna o flora silvestre protegidas, sus partes o productos, y madera o productos forestales de origen ilegal (Ley General de Vida Silvestre).',
        'Fraudes y engaños: esquemas piramidales, falsos préstamos o inversiones, cobros por adelantado de bienes inexistentes, lavado de dinero, extorsión y cobranza abusiva.',
        'Servicios de violencia o delito: sicariato, secuestro, amenazas, hackeo o acceso ilícito a sistemas, creación o venta de malware.',
        'Contenido que promueva el odio, la discriminación, la violencia o el acoso; que amenace a alguien; que revele datos personales de terceros (doxing); o que muestre a otras personas sin su consentimiento.',
        'Publicidad no solicitada (spam), enlaces engañosos y cualquier cosa que busque llevar a los usuarios fuera del Servicio para estafarlos.',
      ],
      after: [
        'La lista es ilustrativa, no limita lo prohibido. Si dudas de si algo está permitido, no lo publiques.',
      ],
    },
    {
      title: 'Reglas de conducta',
      items: [
        'Trata con respeto a los demás usuarios en los anuncios y en el chat.',
        'No uses el Servicio para acosar, engañar o presionar a nadie.',
        'No extraigas datos del Servicio de forma automatizada, no interfieras con su funcionamiento y no intentes acceder a cuentas o datos que no son tuyos.',
        'No manipules las búsquedas ni los anuncios destacados con anuncios repetidos o engañosos.',
        'Publica fotos y descripciones que correspondan al artículo real y a su estado.',
      ],
    },
    {
      title: 'Denuncias, moderación y autoridades',
      paragraphs: [
        'Cualquier usuario puede denunciar un anuncio desde el botón «Denunciar». Podemos revisar el contenido, retirar anuncios, bloquear mensajes y suspender o cerrar cuentas, con o sin aviso previo, cuando creamos que se violan estos Términos o la ley.',
        'Cooperamos con las autoridades competentes. Podemos conservar y entregar la información que nos requieran conforme a la ley, incluyendo datos de la cuenta, anuncios y mensajes, y denunciar por iniciativa propia los delitos de los que tengamos conocimiento, en especial los que involucren a menores y la trata de personas.',
      ],
    },
    {
      title: 'Operaciones entre usuarios',
      paragraphs: [
        `${company} solo pone en contacto a quienes publican y a quienes buscan. No somos parte de la compraventa, no revisamos los artículos, no garantizamos su calidad, legalidad ni existencia, ni la identidad o solvencia de los usuarios. Cualquier trato es entre ustedes y bajo su responsabilidad.`,
        'Recomendaciones: reúnete en lugares públicos y concurridos, revisa el artículo antes de pagar, no adelantes dinero a quien no conoces, desconfía de precios demasiado buenos y de quien te pide salir de la plataforma, y no compartas contraseñas ni códigos.',
      ],
    },
    {
      title: 'Anuncios destacados',
      paragraphs: [
        'Un anuncio destacado aparece primero en las búsquedas durante el tiempo elegido. Destacar no es una recomendación ni una verificación del anuncio. Si en el futuro se cobra por destacar, el precio y las condiciones se mostrarán antes de confirmar.',
      ],
    },
    {
      title: 'El contenido que publicas',
      paragraphs: [
        'Sigues siendo dueño de tus anuncios, fotos y textos. Nos das una licencia gratuita, no exclusiva y limitada para almacenarlos y mostrarlos dentro del Servicio mientras estén publicados, y para operar, proteger y mejorar el Servicio. Eres responsable de tener los derechos sobre lo que publicas.',
        'Los anuncios vencen a los 30 días y puedes renovarlos o eliminarlos cuando quieras.',
      ],
    },
    {
      title: 'Propiedad intelectual del Servicio',
      paragraphs: [
        `El Servicio, su diseño, su código y la marca ${company} son de sus titulares y están protegidos por la ley. No se te concede ningún derecho sobre ellos más allá de usar el Servicio conforme a estos Términos.`,
      ],
    },
    {
      title: 'Disponibilidad y límite de responsabilidad',
      paragraphs: [
        'El Servicio se ofrece «tal cual». Procuramos que funcione sin interrupciones, pero no garantizamos que esté siempre disponible ni libre de errores. En la medida que la ley lo permita, no somos responsables por daños derivados de las operaciones entre usuarios, del contenido publicado por terceros, de fraudes cometidos por usuarios, ni de pérdidas por interrupciones del Servicio. Nada de esto limita los derechos que la ley te reconoce como consumidor.',
      ],
    },
    {
      title: 'Cerrar tu cuenta',
      paragraphs: [
        'Puedes eliminar tu cuenta desde tu perfil en cualquier momento. Se borran tus anuncios, favoritos y foto; tus conversaciones se conservan para la otra persona con tu cuenta marcada como eliminada. Podemos suspender o cerrar una cuenta que incumpla estos Términos.',
      ],
    },
    {
      title: 'Cambios a estos Términos',
      paragraphs: [
        'Podemos actualizar estos Términos. Publicaremos la nueva versión con su fecha y, si el cambio es importante, te pediremos aceptarla de nuevo. Si sigues usando el Servicio después del cambio, entenderemos que lo aceptas.',
      ],
    },
    {
      title: 'Ley aplicable y jurisdicción',
      paragraphs: [
        `Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los tribunales competentes de ${jurisdiction}, sin perjuicio de los derechos que la ley otorga al consumidor.`,
      ],
    },
    {
      title: 'Contacto',
      paragraphs: [`Para dudas, denuncias o avisos legales escribe a ${contactEmail}.`],
    },
  ],
};

const privacyEs: LegalDocumentContent = {
  title: 'Aviso de privacidad',
  updated: 'Última actualización: 13 de noviembre de 2026',
  intro: [
    `${company} (el «responsable») es responsable del tratamiento de tus datos personales, con domicilio en ${address}. Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su normativa.`,
  ],
  sections: [
    {
      title: 'Datos que recabamos',
      items: [
        'Cuenta: nombre para mostrar, correo electrónico e idioma. Tu contraseña se guarda cifrada de forma irreversible (nunca en texto legible).',
        'Ubicación aproximada: solo si lo autorizas al registrarte o desde tu perfil, o al publicar un anuncio. Puedes negarte y usar el Servicio sin ella.',
        'Foto de perfil: opcional.',
        'Contenido que publicas: anuncios (título, descripción, precio, fotos, ubicación), mensajes y archivos del chat, favoritos y denuncias que presentas.',
        'Datos técnicos y de seguridad: dirección IP, fecha y hora de acceso y registros de errores, usados para limitar abusos y proteger el Servicio.',
        'Aceptación de estos documentos: la fecha y la versión de los Términos y del Aviso que aceptaste.',
      ],
      after: [
        'No solicitamos datos personales sensibles (salud, origen étnico, religión, vida sexual, etc.). Te pedimos no publicarlos en tus anuncios ni compartirlos innecesariamente en el chat.',
      ],
    },
    {
      title: 'Para qué usamos tus datos',
      paragraphs: ['Finalidades necesarias para el Servicio:'],
      items: [
        'Crear y administrar tu cuenta y verificar tu correo.',
        'Publicar tus anuncios y mostrarlos en las búsquedas, ordenados por cercanía si lo pides.',
        'Permitir la mensajería entre usuarios y avisarte de mensajes nuevos.',
        'Enviarte correos del servicio: verificación, recuperación de contraseña, cambio de correo y avisos de seguridad.',
        'Prevenir fraudes y abusos, moderar contenido, atender denuncias y hacer cumplir los Términos de uso.',
        'Cumplir obligaciones legales y atender requerimientos de autoridades competentes.',
      ],
      after: [
        'Hoy no usamos tus datos para publicidad ni los compartimos para fines comerciales. Si algún día lo hiciéramos, te lo diríamos antes y te pediríamos tu consentimiento.',
      ],
    },
    {
      title: 'Qué ven los demás',
      items: [
        'Es público: tu nombre para mostrar, tu foto de perfil y tus anuncios (con una zona aproximada en el mapa, no el punto exacto).',
        'Es privado: tu correo, tu contraseña, tu ubicación de registro y tus favoritos.',
        'Tus mensajes solo los ven las dos personas de la conversación. Los administradores no leen el texto de las conversaciones; pueden revisar los archivos adjuntos con fines de moderación.',
      ],
    },
    {
      title: 'Con quién compartimos tus datos',
      paragraphs: [
        'No vendemos tus datos. Podemos remitirlos a proveedores que nos prestan servicios (alojamiento, envío de correos) y que solo pueden usarlos para eso. Los mapas se cargan desde OpenStreetMap, por lo que ese servicio recibe la dirección IP de tu navegador cuando abres un mapa.',
        'Podemos entregar información a autoridades cuando una ley o una orden de autoridad competente lo exija, o para proteger a personas, en especial menores, frente a delitos.',
      ],
    },
    {
      title: 'Tus derechos (ARCO) y cómo ejercerlos',
      paragraphs: [
        'Tienes derecho a Acceder a tus datos, Rectificarlos, Cancelarlos y Oponerte a su tratamiento, así como a revocar tu consentimiento y a limitar su uso.',
      ],
      items: [
        'Rectificar: edita tu nombre, idioma, ubicación y correo desde tu perfil.',
        'Cancelar: elimina tu cuenta desde tu perfil. Se borran tus anuncios, favoritos y foto, y tus datos de cuenta quedan anonimizados.',
        'Ubicación: puedes quitar o cambiar tu ubicación en cualquier momento.',
        `Para cualquier otra solicitud, escribe a ${contactEmail} indicando tu nombre, el correo de tu cuenta y qué quieres hacer. Responderemos en los plazos que marca la ley.`,
      ],
      after: [
        'Si consideras que se vulneraron tus derechos, puedes acudir ante la autoridad de protección de datos personales competente conforme a la ley vigente.',
      ],
    },
    {
      title: 'Cuánto tiempo conservamos tus datos',
      paragraphs: [
        'Mientras tu cuenta esté activa. Al eliminarla borramos o anonimizamos tus datos de cuenta. Las conversaciones se conservan para la otra persona, mostrándote como usuario eliminado, y podemos conservar denuncias y registros de seguridad durante el tiempo necesario para cumplir obligaciones legales o defender derechos.',
      ],
    },
    {
      title: 'Almacenamiento en tu navegador',
      paragraphs: [
        'Guardamos en tu navegador lo necesario para mantener tu sesión y tus preferencias (idioma y modo oscuro). No usamos cookies de publicidad ni de seguimiento.',
      ],
    },
    {
      title: 'Seguridad',
      paragraphs: [
        'Aplicamos medidas técnicas y administrativas razonables: contraseñas cifradas, enlaces de un solo uso con caducidad, límites ante abusos y control de acceso a los datos. Ningún sistema es infalible; protege tu contraseña y no la compartas.',
      ],
    },
    {
      title: 'Menores de edad',
      paragraphs: ['El Servicio es solo para mayores de 18 años. No recabamos datos de menores de forma intencional.'],
    },
    {
      title: 'Cambios a este aviso',
      paragraphs: [
        'Si cambiamos este aviso publicaremos la nueva versión con su fecha y, cuando el cambio sea importante, te lo notificaremos.',
      ],
    },
  ],
};

const termsEn: LegalDocumentContent = {
  title: 'Terms of use',
  updated: 'Last updated: November 13, 2026',
  intro: [
    `These Terms of use govern the use of ${company} (the "Service"), a classified ads platform where people post and find second-hand goods and services. By creating an account or using the Service you declare that you have read and accept them, together with our Privacy notice.`,
    'If you do not agree, do not create an account or use the Service.',
  ],
  sections: [
    {
      title: 'Who can use the Service',
      paragraphs: [
        'You must be at least 18 years old and have the legal capacity to enter into agreements. The Service is not meant for minors. If we find that an account belongs to a minor, we will close it.',
      ],
    },
    {
      title: 'Your account',
      items: [
        'You must give true information and keep it up to date. Your email must be yours.',
        'You are responsible for keeping your password confidential and for everything done from your account. Tell us at once if you think someone else is using it.',
        'You may not impersonate another person or create accounts to avoid a suspension or a block.',
      ],
    },
    {
      title: 'Prohibited content',
      paragraphs: [
        'It is forbidden to post, offer, request or send by message anything that is illegal in the United Mexican States or in the place where it is offered, and in particular:',
      ],
      items: [
        'Child sexual abuse material, or any sexual content involving minors, even if simulated or drawn. Zero tolerance: we report it to the authorities.',
        'Human trafficking in any form: sexual or labor exploitation, forced begging, forced marriage, sale, "rental" or transfer of people, sale of minors or illegal adoptions, and trafficking of organs, tissues or cells.',
        'Firearms, ammunition, cartridges, explosives, gunpowder and their regulated accessories, and prohibited weapons, as well as their manufacture or conversion (Federal Law on Firearms and Explosives).',
        'Illegal drugs and substances, chemical precursors, controlled or prescription-only medicines, and products promising miracle cures (General Health Law).',
        'Pornography, explicit sexual content, and sexual or sexual-companionship services.',
        'Stolen goods or goods of unlawful origin, pirated or counterfeit goods, and any content that infringes the intellectual property rights of others.',
        'Forged or altered official documents (IDs, certificates, licenses, degrees, proofs), and personal data, accounts or cards obtained without authorization.',
        'Protected wild fauna or flora species, their parts or products, and timber or forest products of illegal origin (General Wildlife Law).',
        'Fraud and deception: pyramid schemes, fake loans or investments, advance payments for goods that do not exist, money laundering, extortion and abusive debt collection.',
        'Violence or crime services: contract killing, kidnapping, threats, hacking or unlawful access to systems, creating or selling malware.',
        'Content that promotes hatred, discrimination, violence or harassment; that threatens someone; that reveals personal data of others (doxing); or that shows other people without their consent.',
        'Unsolicited advertising (spam), deceptive links and anything meant to take users off the Service in order to scam them.',
      ],
      after: ['The list is illustrative and does not limit what is prohibited. If you are unsure whether something is allowed, do not post it.'],
    },
    {
      title: 'Rules of conduct',
      items: [
        'Treat other users with respect in ads and in the chat.',
        'Do not use the Service to harass, deceive or pressure anyone.',
        'Do not extract data from the Service by automated means, interfere with how it works, or try to access accounts or data that are not yours.',
        'Do not manipulate searches or featured ads with repeated or misleading ads.',
        'Post photos and descriptions that match the real item and its condition.',
      ],
    },
    {
      title: 'Reports, moderation and authorities',
      paragraphs: [
        'Any user can report an ad with the "Report" button. We may review content, remove ads, block messages and suspend or close accounts, with or without prior notice, when we believe these Terms or the law are being violated.',
        'We cooperate with the competent authorities. We may keep and hand over the information they require under the law, including account data, ads and messages, and report on our own initiative the crimes we become aware of, especially those involving minors and human trafficking.',
      ],
    },
    {
      title: 'Dealings between users',
      paragraphs: [
        `${company} only puts people who post in touch with people who search. We are not a party to the sale, we do not inspect the items, and we do not guarantee their quality, legality or existence, or the identity or solvency of users. Any deal is between you and at your own risk.`,
        'Recommendations: meet in public, busy places, inspect the item before paying, do not send money in advance to someone you do not know, be wary of prices that are too good and of anyone who asks you to leave the platform, and never share passwords or codes.',
      ],
    },
    {
      title: 'Featured ads',
      paragraphs: [
        'A featured ad appears first in searches for the chosen time. Featuring is not a recommendation or a verification of the ad. If featuring is ever charged for, the price and conditions will be shown before you confirm.',
      ],
    },
    {
      title: 'The content you post',
      paragraphs: [
        'You remain the owner of your ads, photos and texts. You grant us a free, non-exclusive, limited license to store and display them within the Service while they are posted, and to operate, protect and improve the Service. You are responsible for having the rights to what you post.',
        'Ads expire after 30 days and you can renew or delete them whenever you want.',
      ],
    },
    {
      title: 'Intellectual property of the Service',
      paragraphs: [
        `The Service, its design, its code and the ${company} brand belong to their owners and are protected by law. You are granted no right over them beyond using the Service under these Terms.`,
      ],
    },
    {
      title: 'Availability and limit of liability',
      paragraphs: [
        'The Service is provided "as is". We try to keep it running without interruption, but we do not guarantee that it will always be available or error-free. To the extent the law allows, we are not liable for damages arising from dealings between users, from content posted by third parties, from fraud committed by users, or from losses caused by interruptions of the Service. None of this limits the rights the law gives you as a consumer.',
      ],
    },
    {
      title: 'Closing your account',
      paragraphs: [
        'You can delete your account from your profile at any time. Your ads, favorites and photo are removed; your conversations are kept for the other person with your account shown as deleted. We may suspend or close an account that breaks these Terms.',
      ],
    },
    {
      title: 'Changes to these Terms',
      paragraphs: [
        'We may update these Terms. We will publish the new version with its date and, if the change is important, ask you to accept it again. If you keep using the Service after the change, we will understand that you accept it.',
      ],
    },
    {
      title: 'Governing law and jurisdiction',
      paragraphs: [
        `These Terms are governed by the laws of the United Mexican States. For any dispute, the parties submit to the competent courts of ${jurisdiction}, without prejudice to the rights the law gives to consumers.`,
      ],
    },
    {
      title: 'Contact',
      paragraphs: [`For questions, reports or legal notices write to ${contactEmail}.`],
    },
  ],
};

const privacyEn: LegalDocumentContent = {
  title: 'Privacy notice',
  updated: 'Last updated: November 13, 2026',
  intro: [
    `${company} (the "controller") is responsible for the processing of your personal data, with address at ${address}. This notice is issued under the Mexican Federal Law on the Protection of Personal Data Held by Private Parties and its regulations.`,
  ],
  sections: [
    {
      title: 'Data we collect',
      items: [
        'Account: display name, email and language. Your password is stored irreversibly encrypted (never in readable text).',
        'Approximate location: only if you allow it when signing up, from your profile, or when posting an ad. You can refuse and use the Service without it.',
        'Profile photo: optional.',
        'Content you post: ads (title, description, price, photos, location), chat messages and files, favorites and reports you file.',
        'Technical and security data: IP address, date and time of access and error logs, used to limit abuse and protect the Service.',
        'Acceptance of these documents: the date and version of the Terms and Notice you accepted.',
      ],
      after: [
        'We do not ask for sensitive personal data (health, ethnic origin, religion, sex life, etc.). Please do not post it in your ads or share it needlessly in the chat.',
      ],
    },
    {
      title: 'What we use your data for',
      paragraphs: ['Purposes needed for the Service:'],
      items: [
        'Create and manage your account and verify your email.',
        'Publish your ads and show them in searches, ordered by distance if you ask.',
        'Allow messaging between users and notify you of new messages.',
        'Send you service emails: verification, password recovery, email change and security notices.',
        'Prevent fraud and abuse, moderate content, handle reports and enforce the Terms of use.',
        'Comply with legal obligations and answer requests from competent authorities.',
      ],
      after: [
        'Today we do not use your data for advertising or share it for commercial purposes. If we ever did, we would tell you first and ask for your consent.',
      ],
    },
    {
      title: 'What others can see',
      items: [
        'Public: your display name, your profile photo and your ads (with an approximate area on the map, not the exact point).',
        'Private: your email, your password, your sign-up location and your favorites.',
        'Your messages are only seen by the two people in the conversation. Administrators do not read the text of conversations; they may review attached files for moderation.',
      ],
    },
    {
      title: 'Who we share your data with',
      paragraphs: [
        'We do not sell your data. We may pass it to providers that give us services (hosting, email delivery) and that may only use it for that. Maps are loaded from OpenStreetMap, so that service receives your browser’s IP address when you open a map.',
        'We may hand over information to authorities when a law or an order from a competent authority requires it, or to protect people, especially minors, from crimes.',
      ],
    },
    {
      title: 'Your rights (ARCO) and how to use them',
      paragraphs: [
        'You have the right to Access your data, Rectify it, Cancel it and Object to its processing, and to withdraw your consent and limit its use.',
      ],
      items: [
        'Rectify: edit your name, language, location and email from your profile.',
        'Cancel: delete your account from your profile. Your ads, favorites and photo are removed, and your account data is anonymized.',
        'Location: you can remove or change your location at any time.',
        `For any other request, write to ${contactEmail} with your name, the email of your account and what you want to do. We will answer within the deadlines the law sets.`,
      ],
      after: [
        'If you believe your rights were violated, you can go to the competent personal data protection authority under the law in force.',
      ],
    },
    {
      title: 'How long we keep your data',
      paragraphs: [
        'While your account is active. When you delete it we erase or anonymize your account data. Conversations are kept for the other person, showing you as a deleted user, and we may keep reports and security logs for as long as needed to meet legal obligations or defend rights.',
      ],
    },
    {
      title: 'Storage in your browser',
      paragraphs: [
        'We store in your browser what is needed to keep your session and your preferences (language and dark mode). We do not use advertising or tracking cookies.',
      ],
    },
    {
      title: 'Security',
      paragraphs: [
        'We apply reasonable technical and administrative measures: encrypted passwords, single-use links that expire, limits against abuse and access control to data. No system is infallible; protect your password and do not share it.',
      ],
    },
    {
      title: 'Minors',
      paragraphs: ['The Service is only for people over 18. We do not intentionally collect data from minors.'],
    },
    {
      title: 'Changes to this notice',
      paragraphs: [
        'If we change this notice we will publish the new version with its date and, when the change is important, notify you.',
      ],
    },
  ],
};

const CONTENT: Record<Language, Record<LegalKind, LegalDocumentContent>> = {
  es: { terms: termsEs, privacy: privacyEs },
  en: { terms: termsEn, privacy: privacyEn },
};

export function legalContent(kind: LegalKind, language: string | undefined): LegalDocumentContent {
  return CONTENT[(language ?? 'es').startsWith('en') ? 'en' : 'es'][kind];
}
