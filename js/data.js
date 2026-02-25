/* =========================================
   BASE DE DATOS DE PREGUNTAS (Phishing Simulation)
   ========================================= */
// Array que contiene toda la información de los niveles y preguntas.
// Cada objeto representa un reto distinto.
const questionsDB = [
    // --- NIVEL 1: FÁCIL (Errores obvios, remites extraños) ---
    {
        id: 101, level: 1, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> soporte@paypa1-support.com<br>
                <strong>Asunto:</strong> ALERTA: Cuenta Suspendida
            </div>
            <p>Estimado usuario, su cuenta ha sido limitada temporalmente.</p>
            <p><span class="mock-link">Haga clic aquí para reactivar</span></p>`,
        explanation: "Fíjate bien: 'paypa1' tiene un número 1 en vez de la 'l'. Es un intento claro de suplantación."
    },
    {
        id: 102, level: 1, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://www.google.com/accounts/login
            </div>
            <p>Iniciando sesión en tu cuenta de Google...</p>`,
        explanation: "Legítimo. El dominio es correcto (google.com) y usa protocolo seguro (HTTPS)."
    },
    {
        id: 103, level: 1, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> loteria@premio-ganador-xyz.net<br>
                <strong>Asunto:</strong> ¡FELICIDADES GANADOR!
            </div>
            <p>Has ganado 1.000.000€ en la lotería internacional.</p>
            <p>Envíanos tus datos bancarios para depositar el premio.</p>`,
        explanation: "Nadie regala dinero por email. Si suena demasiado bueno para ser verdad, es phishing."
    },
    {
        id: 104, level: 1, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> http://bancociudad.com.login-seguro.tk
            </div>
            <p>Bienvenido a tu Banca Online.</p>`,
        explanation: "El dominio real es lo que está justo antes de la extensión final (.tk). Aquí es 'login-seguro.tk', NO 'bancociudad.com'."
    },
    {
        id: 105, level: 1, type: 'email', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> no-reply@amazon.es<br>
                <strong>Asunto:</strong> Tu pedido ha sido enviado
            </div>
            <p>Tu paquete llegará mañana. Puedes seguir el envío desde tu cuenta.</p>`,
        explanation: "El remitente 'amazon.es' es correcto y el mensaje es informativo, típico de una compra real."
    },
    {
        id: 106, level: 1, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> seguridad@faceb00k-login.com<br>
                <strong>Asunto:</strong> Alguien entró en tu cuenta
            </div>
            <p>Hemos detectado un acceso inusual. Confirma tu identidad aquí.</p>`,
        explanation: "Nuevamente, mira el remitente: 'faceb00k' con ceros. Es una imitación burda."
    },
    {
        id: 107, level: 1, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://es.wikipedia.org/wiki/Phishing
            </div>
            <p>Wikipedia: La enciclopedia libre.</p>`,
        explanation: "Wikipedia es un sitio seguro y el dominio es correcto (wikipedia.org)."
    },
    {
        id: 108, level: 1, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> premio@te-ha-tocado.com<br>
                <strong>Asunto:</strong> ¡RECLAMA TU IPHONE GRATIS!
            </div>
            <p>Has sido seleccionado al azar para ganar un iPhone 15 Pro. Paga solo el envío.</p>`,
        explanation: "Los regalos 'gratis' que piden un pago pequeño por envío son una estafa clásica para robar tu tarjeta."
    },

    // --- NIVEL 2: MEDIO (Contexto laboral, Urgencia simulada) ---
    {
        id: 201, level: 2, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> ceo.urgente@gmail.com<br>
                <strong>Asunto:</strong> Transferencia Inmediata
            </div>
            <p>Hola, estoy en una reunión y no puedo hablar. Necesito que hagas una transferencia urgente a este proveedor.</p>`,
        explanation: "El CEO de una empresa no usaría una cuenta personal (@gmail) para asuntos corporativos urgentes. Se llama 'Fraude del CEO'."
    },
    {
        id: 202, level: 2, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> facturacion@tu-proveedor.net<br>
                <strong>Asunto:</strong> Factura Pendiente
            </div>
            <p>Adjunto la factura vencida. Por favor pagar hoy.</p>
            <p>Adjunto: <code>factura_pendiente.js</code></p>`,
        explanation: "¡Cuidado con la extensión! Un archivo .js es un script de código, nunca una factura legítima PDF o Excel."
    },
    {
        id: 203, level: 2, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://www.agenciatributaria.gob.es/sede
            </div>
            <p>Sede Electrónica - Trámites destacados</p>`,
        explanation: "Sitio oficial correcto (.gob.es indica gobierno de España). Es seguro."
    },
    {
        id: 204, level: 2, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> soporte@nefflix-verify.com<br>
                <strong>Asunto:</strong> Problema con tu pago
            </div>
            <p>Tu suscripción ha caducado. Actualiza tu tarjeta aquí.</p>`,
        explanation: "El dominio 'nefflix-verify.com' no tiene nada que ver con Netflix oficial. Crean dominios parecidos para confundir."
    },
    {
        id: 205, level: 2, type: 'email', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> newsletter@boletin-seguridad.com<br>
                <strong>Asunto:</strong> Novedades Semanales
            </div>
            <p>Aquí tienes las noticias de ciberseguridad de la semana. Para darte de baja, pulsa aquí.</p>`,
        explanation: "Parece un boletín legítimo al que te has suscrito. No pide datos sensibles ni dinero."
    },
    {
        id: 206, level: 2, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> admin@dropbox-share-file.com<br>
                <strong>Asunto:</strong> Documento compartido contigo
            </div>
            <p>Alguien ha compartido 'Nóminas_2025.pdf' contigo.</p>`,
        explanation: "Cuidado con los servicios de archivos falsos. El dominio real es 'dropbox.com', no 'dropbox-share-file.com'."
    },
    {
        id: 207, level: 2, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://www.linkedin.com/in/usuario
            </div>
            <p>Perfil profesional de LinkedIn.</p>`,
        explanation: "LinkedIn es una red segura. Verifica siempre que sea 'linkedin.com' y tenga HTTPS."
    },
    {
        id: 208, level: 2, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> servicio.tecnico@wifi-gratis.net<br>
                <strong>Asunto:</strong> Actualice su router
            </div>
            <p>Su router tiene un virus. Descargue este parche para limpiarlo.</p>
            <p>Adjunto: <code>parche_seguridad.exe</code></p>`,
        explanation: "Nunca descargues ejecutables (.exe) enviados por correo no solicitado. Es malware casi seguro."
    },

    // --- NIVEL 3: DIFÍCIL (Homógrafos, Spear Phishing) ---
    {
        id: 301, level: 3, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://www.micrnsaft.com/login
            </div>
            <p>Iniciar sesión con Microsoft 365.</p>`,
        explanation: "Ataque Homográfico: Dice 'micrnsaft' en vez de 'microsoft'. Una 'o' cambiada por una 'n' y una 'a' es muy difícil de ver rápido."
    },
    {
        id: 302, level: 3, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> it-support@compania-interna.com<br>
                <strong>Asunto:</strong> Cambio de contraseña obligatorio
            </div>
            <p>Según la nueva política de seguridad, debes cambiar tu contraseña.</p>
            <p><span class="mock-link">http://portal-seguro-interno.ip-43-22.net</span></p>`,
        explanation: "Aunque parece interno, el enlace lleva a un dominio externo extraño (.net con IP simulada) y no usa HTTPS."
    },
    {
        id: 303, level: 3, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://subdomain.example-company.com/auth
            </div>
            <p>Portal de autenticación corporativo.</p>`,
        explanation: "Los subdominios (subdomain.) son legítimos si la parte principal (example-company.com) es correcta y fiable."
    },
    {
        id: 304, level: 3, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> recursos.humanos@empresa.com<br>
                <strong>Asunto:</strong> Datos bancarios nómina
            </div>
            <p>Hola, necesitamos que confirmes tu cuenta bancaria respondiendo a este correo con tu usuario y clave web.</p>`,
        explanation: "NUNCA debes dar contraseñas por correo, ni siquiera a RRHH. Un departamento real te pediría entrar al portal oficial, no responder con claves."
    },
    {
        id: 305, level: 3, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> data:text/html;base64,PHNjcmlwdD5hbGVydCgnSG9sYScpPC9zY3JpcHQ+
            </div>
            <p>Página en blanco cargando...</p>`,
        explanation: "Las URLs que empiezan por 'data:' pueden contener código malicioso incrustado directamente. Nunca abras enlaces así."
    },
    {
        id: 306, level: 3, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> soporte@microsoft.com.verificacion-cuenta.co<br>
                <strong>Asunto:</strong> Actividad inusual
            </div>
            <p>Detectamos actividad extraña. Inicie sesión para revisar.</p>`,
        explanation: "Esto es 'Subdomain spoofing'. El dominio real es '.co' (Colombia) o un dominio barato, y 'microsoft.com' es solo un subdominio falso."
    },
    {
        id: 307, level: 3, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://accounts.google.com/ServiceLogin?service=mail
            </div>
            <p>Ir a Gmail</p>`,
        explanation: "La estructura de la URL es correcta para el login de Google."
    },
    {
        id: 308, level: 3, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> no-reply@banco-santander.com<br>
                <strong>Asunto:</strong> Firma digital requerida [URGENTE]
            </div>
            <p style="font-family: 'Times New Roman';">Estimado cliente, su firma digital ha caducado.</p>`,
        explanation: "A veces el formato del correo delata el phishing. Bancos modernos raramente usan fuentes anticuadas o formatos rotos, además de la urgencia injustificada."
    },

    // --- NIVEL 4: EXPERTO (Smishing, QR Code, Redes Sociales) ---
    {
        id: 401, level: 4, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>SMS / Mensaje:</strong> 600-123-456<br>
                <strong>Texto:</strong> "Su paquete ES-9912 está retenido en aduanas. Pague tasas (2,99€) aquí: http://correos-aduanas-track.com/pago"
            </div>
            <p>(Mensaje de Texto recibido en el móvil)</p>`,
        explanation: "Smishing (SMS Phishing). Correos nunca pide pagos por SMS con enlaces a dominios no oficiales (.com en vez de .es)."
    },
    {
        id: 402, level: 4, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>QR Code escaneado:</strong><br>
                Lleva a: https://menu.restaurante-seguro.com/carta.pdf
            </div>
            <p>Escaneando carta en restaurante...</p>`,
        explanation: "QR legítimo. El dominio coincide con el restaurante y usa HTTPS."
    },
    {
        id: 403, level: 4, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> instagram-support@security-alerts.net<br>
                <strong>Asunto:</strong> Infracción de Copyright
            </div>
            <p>Tu cuenta será borrada en 24h por copyright. Apela la decisión aquí si crees que es un error.</p>`,
        explanation: "Táctica de urgencia y miedo común en redes sociales. El dominio 'security-alerts.net' no pertenece a Instagram/Meta."
    },
    {
        id: 404, level: 4, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> http://192.168.1.55/login
            </div>
            <p>Página de inicio de sesión desconocida enviada por WhatsApp.</p>`,
        explanation: "Nunca confíes en IPs directas o enlaces HTTP sin dominio claro enviados por mensajería instantánea."
    },
    {
        id: 405, level: 4, type: 'email', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> avisos@seguridad-social.gob.es<br>
                <strong>Asunto:</strong> Vida Laboral
            </div>
            <p>Su informe de vida laboral solicitado está disponible en la Sede Electrónica.</p>`,
        explanation: "Dominio gubernamental correcto (.gob.es). Es una notificación informativa legítima."
    },
    {
        id: 406, level: 4, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> oferta@amazon-prime-days.shop<br>
                <strong>Asunto:</strong> ¡Oferta exclusiva 90% OFF!
            </div>
            <p>Solo hoy: PlayStation 5 por 50€.</p>`,
        explanation: "Demasiado bueno para ser verdad. El dominio termina en .shop (barato) y no es amazon.es o amazon.com."
    },

    // --- NIVEL 5: MAESTRO (Ataques dirigidos, Browser-in-Browser, Deepfake context) ---
    {
        id: 501, level: 5, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>Pop-up Ventana:</strong> Iniciar sesión con Google<br>
                <strong>URL (barra falsa):</strong> https://accounts.google.com
            </div>
            <p>Aparece una ventana emergente sobre la web, pero no puedes arrastrarla fuera de la pestaña del navegador.</p>`,
        explanation: "Ataque 'Browser-in-the-Browser'. Dibujan una ventana falsa DENTRO de la página web. Si no sale de la pestaña, es falsa."
    },
    {
        id: 502, level: 5, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> director.general@tuempresa.com<br>
                <strong>Asunto:</strong> Proyecto confidencial
            </div>
            <p>Te envío un audio con instrucciones para una transferencia confidencial. Por favor, sé discreto.</p>
            <p>Adjunto: <code>audio_instrucciones.wav.exe</code></p>`,
        explanation: "Doble extensión (.wav.exe). Parece un audio, pero es un programa ejecutable. Además, apela a la confidencialidad para evitar que preguntes."
    },
    {
        id: 503, level: 5, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://github.com/login/oauth/authorize
            </div>
            <p>Autorizar aplicación externa para acceder a tu cuenta pública.</p>`,
        explanation: "OAuth legítimo en GitHub. Es común y seguro si confías en la aplicación que pide permiso."
    },
    {
        id: 504, level: 5, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> soporte@blockchaín.com<br>
                <strong>Asunto:</strong> Seguridad de Billetera
            </div>
            <p>Tu clave privada está en riesgo. Verifica tu frase semilla aquí.</p>`,
        explanation: "Ataque IDN (caracteres especiales). La 'í' con tilde en 'blockchaín' es diferente a la 'i' normal. NUNCA compartas tu frase semilla."
    },
    {
        id: 505, level: 5, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://www.paypal.com@192.168.0.1
            </div>
            <p>Redireccionando a pago...</p>`,
        explanation: "Truco de la arroba (@). El navegador ignorará todo lo anterior a la @ y te llevará a la IP o dominio que está DESPUÉS (el sitio del atacante)."
    },
    {
        id: 506, level: 5, type: 'email', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> alertas@banco.com<br>
                <strong>Asunto:</strong> Nuevo dispositivo detectado
            </div>
            <p>Se accedió desde un iPhone 15. Si fuiste tú, ignora este mensaje. Si no, llama al 900...</p>`,
        explanation: "Aviso de seguridad legítimo. No hay enlaces sospechosos, solo información y un teléfono oficial."
    },

    // --- NIVEL 6: PHISHING INVISIBLE (Ataques de cadena de suministro e inyecciones) ---
    {
        id: 601, level: 6, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> notificaciones@github.com<br>
                <strong>Asunto:</strong> [Dependabot] Vulnerabilidad Crítica Detectada
            </div>
            <p>Actualización requerida en tu repositorio. Ejecuta este comando en terminal para parchear:</p>
            <code>npm install malicious-package-patch-1.0.1</code>`,
        explanation: "Supply Chain Attack: El correo parece legítimo e induce pánico, pero te está pidiendo instalar un paquete malicioso manualmente, simulando un aviso automático de Github."
    },
    {
        id: 602, level: 6, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://raw.githubusercontent.com/microsoft/vscode/main/README.md
            </div>
            <p>Mostrando archivo en texto plano desde el repositorio oficial.</p>`,
        explanation: "Es seguro. Los CDNs de raw data de Github ('raw.githubusercontent.com') son la forma oficial de alojar y leer código directo."
    },
    {
        id: 603, level: 6, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> billing@awss-support.com<br>
                <strong>Asunto:</strong> Suspensión de Instancias EC2
            </div>
            <p>Su tarjeta ha expirado. Entrege su tarjeta temporal aquí para evitar el borrado de sus servidores.</p>`,
        explanation: "El remitente tiene doble 's' (awss) a diferencia del servicio real de Amazon Web Services (AWS)."
    },
    {
        id: 604, level: 6, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> soporte@tu-banco.es<br>
                <strong>Asunto:</strong> Verificación de 2 Pasos (2FA) requerida
            </div>
            <p>Responda a este correo indicando el PIN de 6 dígitos que acaba de recibir en su teléfono por SMS.</p>`,
        explanation: "El banco NUNCA te pide un código 2FA de esta forma. Atacantes inician sesión con tu contraseña filtrada y lanzan este email para que tú mismo les des el código."
    },
    {
        id: 605, level: 6, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://www.google.com.search.q.login-secure.xyz/auth
            </div>
            <p>Portal de verificación de cuenta de Google.</p>`,
        explanation: "Uso abusivo de subdominios largos para esconder el dominio real que es 'login-secure.xyz' al final a la derecha."
    },

    // --- NIVEL 7: DIOS HACKER (Ingeniería Social Avanzada) ---
    {
        id: 701, level: 7, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> l.perez@proveedor-habitual.com<br>
                <strong>Asunto:</strong> RE: Fwd: Presupuesto Q3 modificado
            </div>
            <p>Hola, hemos cambiado de banco. Por favor abonar las facturas de este trimestre a la nueva cuenta IBAN que adjunto a continuación.</p>
            <p>Atentamente, Laura Pérez - Facturación.</p>`,
        explanation: "Ataque BEC (Business Email Compromise). El atacante ha secuestrado el correo real de un proveedor y está interceptando las cadenas de mensajes pidiendo desvío de pagos a su cuenta."
    },
    {
        id: 702, level: 7, type: 'url', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> https://myaccount.google.com/security
            </div>
            <p>Revisión de Seguridad oficial de Google. No hay enlaces extraños.</p>`,
        explanation: "URL directa oficial y segura de las opciones de cuenta."
    },
    {
        id: 703, level: 7, type: 'email', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> noreply@tu-hosting.com<br>
                <strong>Asunto:</strong> Certificado SSL a punto de expirar en 2 h
            </div>
            <p>Evite penalizaciones de SEO. Renueve gratuitamente su SSL haciendo clic en el parche urgente a continuación.</p>
            <p><span class="mock-link">Renovar Automaticamente</span></p>`,
        explanation: "Engaño dirigido a administradores y webmasters usando tácticas de terror sobre SEO y certificados."
    },
    {
        id: 704, level: 7, type: 'url', isPhishing: true,
        content: `
            <div class="mock-email-header">
                <strong>URL:</strong> view-source:https://login.banco.com<script src='//malware.cc/hook.js'></script>
            </div>
            <p>Inspección de elementos visualizando errores del sistema del banco local.</p>`,
        explanation: "La inyección directa de script al final (XSS) mediante URLs alteradas busca robar cookies al cargar scripts externos."
    },
    {
        id: 705, level: 7, type: 'email', isPhishing: false,
        content: `
            <div class="mock-email-header">
                <strong>De:</strong> ceo@empresa.com<br>
                <strong>Asunto:</strong> Comunicado Interno: Horarios Verano
            </div>
            <p>Estimado equipo. Los viernes de julio la jornada laboral acabará a las 14:00h según lo acordado. Saludos.</p>`,
        explanation: "Mensaje inofensivo interno estándar. No todas las directivas de rango alto son estafas del CEO si no piden dinero/datos."
    }
];
