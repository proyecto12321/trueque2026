/* =====================================================================
   TRUEQUEA PE — Motor completo (sin servidor)
   Todo se guarda en el navegador con localStorage.
   ===================================================================== */
'use strict';

const LLAVE = 'truequea_pe_v8';

/* Reservas Premium: máximo UNA HORA. Mientras dura, solo el Premium que
   reservó puede interactuar; los demás ven la publicación pero bloqueada. */
const RESERVA_MAX_MIN  = 60;
const RESERVA_OPCIONES = [15, 30, 45, 60];

/* Categoría exclusiva: solo los Premium publican y proponen aquí */
const CATEGORIAS_VIP = [
  ['Laptops', '💻'], ['iPhones', '📱'], ['PlayStation / Xbox', '🎮'],
  ['Cámaras', '📷'], ['Accesorios de auto', '🚗'], ['Celulares gama alta', '📲'],
];

/* Referencias del sistema para el análisis del trueque.
   NO son precios de venta: solo sirven para comparar si el cambio es parejo. */
const REFERENCIA = {
  1:[80, 1200], 2:[20, 120], 3:[30, 300], 4:[40, 500], 5:[10, 60], 6:[300, 6000],
  7:[30, 400], 8:[20, 200], 9:[25, 350], 10:[30, 300], 11:[20, 200], 12:[20, 150],
};
const REF_VIP = { 'Laptops':[900, 3500], 'iPhones':[800, 4000], 'PlayStation / Xbox':[700, 2600],
  'Cámaras':[500, 3000], 'Accesorios de auto':[100, 900], 'Celulares gama alta':[600, 2800] };
const PESO_CONDICION = { nuevo:1, como_nuevo:.82, usado:.6, para_reparar:.32 };

/* Impulso: la publicación sube al primer lugar por horas */
const IMPULSO_OPCIONES = [24, 48];

/* Frases rápidas del chat Premium */
const FRASES_PRO = [
  'Hola, me interesa tu artículo. ¿Sigue disponible?',
  '¿Podemos vernos en una zona segura?',
  'Te propongo cambiarlo por lo que tengo publicado.',
  '¿A qué hora te queda bien hoy?',
  'Perfecto, cerramos el trueque 👍',
];

const CATEGORIAS = [
  ['Electrónica','💻'], ['Ropa y Accesorios','👕'], ['Hogar','🏠'], ['Deportes','⚽'],
  ['Libros','📖'], ['Vehículos','🚗'], ['Arte','🎨'], ['Juguetes','🎮'],
  ['Herramientas','🔧'], ['Servicios','💼'], ['Mascotas','🐾'], ['Otros','📦'],
];

/* Ciudades con coordenadas reales para pintar el mapa */
const CIUDADES = {
  'Chincha Alta':  [-13.4098, -76.1322],
  'Chincha Baja':  [-13.4497, -76.1706],
  'Sunampe':       [-13.4310, -76.1550],
  'Pueblo Nuevo':  [-13.4020, -76.1180],
  'Grocio Prado':  [-13.4180, -76.1620],
  'Tambo de Mora': [-13.4650, -76.1880],
  'El Carmen':     [-13.4980, -76.0790],
  'San Ignacio':   [-13.4700, -76.0500],
  'Alto Larán':    [-13.4550, -76.0900],
  'Ica':           [-14.0678, -75.7286],
  'Pisco':         [-13.7100, -76.2036],
  'Nasca':         [-14.8290, -74.9370],
  'Lima':          [-12.0464, -77.0428],
  'Callao':        [-12.0566, -77.1181],
};
const LISTA_CIUDADES = Object.keys(CIUDADES);

const ZONAS_SEGURAS = [
  { nombre:'Comisaría PNP Chincha Alta', ciudad:'Chincha Alta', lat:-13.4105, lon:-76.1340, tipo:'Comisaría' },
  { nombre:'Plaza de Armas de Chincha',  ciudad:'Chincha Alta', lat:-13.4090, lon:-76.1300, tipo:'Plaza' },
  { nombre:'Municipalidad de Chincha',   ciudad:'Chincha Alta', lat:-13.4120, lon:-76.1280, tipo:'Municipalidad' },
  { nombre:'Comisaría de Sunampe',       ciudad:'Sunampe',      lat:-13.4320, lon:-76.1560, tipo:'Comisaría' },
  { nombre:'Plaza Vea Ica',              ciudad:'Ica',          lat:-14.0700, lon:-75.7300, tipo:'Centro comercial' },
  { nombre:'Comisaría de Pisco',         ciudad:'Pisco',        lat:-13.7110, lon:-76.2040, tipo:'Comisaría' },
];

const CONDICIONES = { nuevo:'Nuevo', como_nuevo:'Como nuevo', usado:'Usado', para_reparar:'Para reparar' };
const LIMITE_GRATIS = 20;

/* Imagen de reemplazo cuando un artículo no tiene foto */
const SIN_FOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
  '<rect width="100%" height="100%" fill="#e9edf5"/>' +
  '<text x="50%" y="46%" font-family="sans-serif" font-size="46" fill="#b3bccd" text-anchor="middle">📦</text>' +
  '<text x="50%" y="60%" font-family="sans-serif" font-size="16" fill="#9aa4b8" text-anchor="middle">Sin foto</text></svg>');

/* Logo por defecto de Truequea PE */
const LOGO_DEFECTO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0%" stop-color="#ffc24d"/><stop offset="100%" stop-color="#c9922a"/></linearGradient></defs>' +
  '<rect width="120" height="120" rx="30" fill="url(#g)"/>' +
  '<g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M30 46h44"/><path d="M62 34l12 12-12 12"/>' +
  '<path d="M90 74H46"/><path d="M58 86 46 74l12-12"/></g></svg>');

/* Patrón e ilustración de la portada */
const PATRON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270">' +
  '<g fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity=".55">' +
  '<g transform="translate(30,34)"><path d="M2 12a16 16 0 0 1 27-11"/><path d="M29 -5v6h-6"/>' +
  '<path d="M32 20a16 16 0 0 1-27 11"/><path d="M5 37v-6h6"/></g>' +
  '<g transform="translate(170,190)"><path d="M2 12a16 16 0 0 1 27-11"/><path d="M29 -5v6h-6"/>' +
  '<path d="M32 20a16 16 0 0 1-27 11"/><path d="M5 37v-6h6"/></g>' +
  '<g transform="translate(120,24)"><path d="M0 8 14 0l14 8v16l-14 8-14-8z"/><path d="M0 8l14 8 14-8M14 16v16"/></g>' +
  '<g transform="translate(40,180)"><path d="M0 8 14 0l14 8v16l-14 8-14-8z"/><path d="M0 8l14 8 14-8M14 16v16"/></g>' +
  '<g transform="translate(210,60)"><path d="M14 0H4a4 4 0 0 0-4 4v10l16 16 12-12z"/><circle cx="7" cy="7" r="2.2"/></g>' +
  '<g transform="translate(96,120)"><path d="M14 0H4a4 4 0 0 0-4 4v10l16 16 12-12z"/><circle cx="7" cy="7" r="2.2"/></g>' +
  '<g transform="translate(150,230)"><path d="M10 26S0 16 0 9a10 10 0 0 1 20 0c0 7-10 17-10 17z"/><circle cx="10" cy="9" r="3.4"/></g>' +
  '</g></svg>');

const ILUSTRACION = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" fill="none">' +
  '<g stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".62">' +
  '<circle cx="450" cy="300" r="240" opacity=".4"/><circle cx="450" cy="300" r="186" stroke-dasharray="9 13" opacity=".5"/>' +
  '<g transform="translate(240,215)"><circle cx="46" cy="30" r="30"/><path d="M6 156c0-30 18-52 40-52s40 22 40 52"/>' +
  '<path d="M86 120l52-16"/><g transform="translate(130,70)"><path d="M0 22 38 0l38 22v44L38 88 0 66z"/>' +
  '<path d="M0 22l38 22 38-22M38 44v44"/></g></g>' +
  '<g transform="translate(570,215) scale(-1,1)"><circle cx="46" cy="30" r="30"/>' +
  '<path d="M6 156c0-30 18-52 40-52s40 22 40 52"/><path d="M86 120l52-16"/>' +
  '<g transform="translate(130,70)"><path d="M0 22 38 0l38 22v44L38 88 0 66z"/><path d="M0 22l38 22 38-22M38 44v44"/></g></g>' +
  '</g><g stroke="#f5c451" stroke-width="3.4" stroke-linecap="round" opacity=".8" transform="translate(405,286)">' +
  '<path d="M0 12h70"/><path d="M56 0l14 12-14 12"/><path d="M84 44h-70"/><path d="M28 56 14 44l14-12"/></g></svg>');

/* ---------------------------------------------------------------
   Base de datos local
   --------------------------------------------------------------- */
let BD = null;

function hace(dias = 0, hora = 10) {
  const f = new Date();
  f.setDate(f.getDate() - dias); f.setHours(hora, 0, 0, 0);
  return f.toISOString();
}

function semilla() {
  const usuarios = [
    { id:1, nombre:'Administrador', email:'admin@truequea.pe', pass:'admin123', rol:'admin',
      ciudad:'Chincha Alta', avatar:null, telefono:'956000000', bio:'', ref:'',
      lat:-13.4098, lon:-76.1322, premium:true, premiumHasta:null, puntos:0, nivel:1,
      estado:'activo', creado:hace(300), verificado:true },
    { id:2, nombre:'María Quispe', email:'maria@gmail.com', pass:'Maria123', rol:'usuario',
      ciudad:'Chincha Baja', avatar:null, telefono:'956111222', bio:'Me gusta intercambiar cosas de cocina.',
      ref:'Frente al mercado', lat:-13.4497, lon:-76.1706, premium:true, premiumHasta:hace(-25),
      puntos:320, nivel:3, estado:'activo', creado:hace(150), verificado:true },
    { id:3, nombre:'Jhonel Ramos', email:'jhonel@gmail.com', pass:'Jhonel123', rol:'usuario',
      ciudad:'Ica', avatar:null, telefono:'956333444', bio:'Cambio herramientas y repuestos.',
      ref:'', lat:-14.0678, lon:-75.7286, premium:false, premiumHasta:null,
      puntos:140, nivel:2, estado:'activo', creado:hace(80), verificado:true },
    { id:4, nombre:'Camila Rojas', email:'camila@gmail.com', pass:'Camila123', rol:'usuario',
      ciudad:'Sunampe', avatar:null, telefono:null, bio:'', ref:'', lat:-13.4310, lon:-76.1550,
      premium:false, premiumHasta:null, puntos:95, nivel:2, estado:'activo', creado:hace(60), verificado:false },
  ];

  /* Código de respaldo: sirve para recuperar la cuenta sin correos ni servidores */
  usuarios.forEach((u, i) => {
    u.codigo = 'TRUEQUEA-' + (1000 + i * 137);
    u.avisos = true;
    u.pin = String(1234 + i * 1111).slice(0, 4);   // entrada rápida con 4 números
    u.impulsosGratis = u.premium ? 3 : 0;          // regalo mensual del Premium
    u.impulsosMes = new Date().toISOString().slice(0, 7);
  });

  const base = [
    ['Set de tazas de cerámica', 3, 'Sartén antiadherente o utensilios', 'Chincha Baja', 2, 'nuevo', 45,
     'Juego de 4 tazas, sin desportilladuras. Me regalaron otro juego.', true],
    ['Cinta métrica Stanley 5m', 9, 'Taladro inalámbrico o destornilladores', 'Ica', 3, 'usado', 35,
     'Funciona el freno y el retorno, la uso poco.', false],
    ['Bicicleta rodado 26', 4, 'Bicicleta más pequeña o herramientas', 'Ica', 3, 'para_reparar', 280,
     'Necesita cambio de frenos, todo lo demás funciona bien.', false],
    ['Teclado bluetooth para tablet', 1, 'Audífonos o mouse inalámbrico', 'Chincha Alta', 2, 'usado', 80,
     'Compatible con Android e iPad, la batería dura varios días.', false],
    ['Libro de comedia peruana', 5, 'Otros libros o revistas', 'Chincha Baja', 2, 'como_nuevo', 30,
     'Tapa blanda, leído una sola vez.', false],
    ['Rompecabezas 1000 piezas', 8, 'Juegos de mesa', 'Sunampe', 4, 'como_nuevo', 40,
     'Completo, armado una sola vez.', false],
    ['Parlante bluetooth', 1, 'Audífonos o memoria USB', 'Sunampe', 4, 'usado', 65,
     'Suena fuerte, batería dura 5 horas.', false],
    ['Mochila escolar', 2, 'Cartuchera o útiles', 'Pisco', 3, 'usado', 25,
     'Sin roturas, cierre en buen estado.', false],
  ];

  const articulos = base.map((a, i) => {
    const dueno = usuarios.find(u => u.id === a[4]);
    const c = CIUDADES[a[3]] || CIUDADES['Chincha Alta'];
    return {
      id: i + 1, titulo: a[0], categoria: a[1], busca: a[2], ciudad: a[3], usuario: a[4],
      condicion: a[5], desc: a[7], destacado: a[8],
      estado: 'disponible', fotos: [], vistas: 8 + i * 4, favs: i % 3, reserva: null,
      vip: null, impulso: null,
      lat: c[0] + (Math.random() - .5) * .02, lon: c[1] + (Math.random() - .5) * .02,
      creado: hace(i, 9 + (i % 8)),
    };
  });

  /* Dos ejemplos de la categoría exclusiva 💎 TRUEQUES VIP */
  articulos.push({
    id: articulos.length + 1, titulo: 'Laptop Lenovo IdeaPad i5', categoria: 1,
    busca: 'PlayStation 5 o laptop gamer', ciudad: 'Chincha Alta', usuario: 2,
    condicion: 'como_nuevo', desc: '16 GB de RAM, SSD de 512 GB, con cargador y funda.',
    destacado: true, estado: 'disponible', fotos: [], vistas: 96, favs: 7, reserva: null,
    vip: 'Laptops', impulso: null, lat: -13.4102, lon: -76.1330, creado: hace(2, 11),
  });
  articulos.push({
    id: articulos.length + 1, titulo: 'iPhone 12 de 128 GB', categoria: 1,
    busca: 'Laptop i5 o cámara réflex', ciudad: 'Ica', usuario: 3,
    condicion: 'usado', desc: 'Batería al 86%, libre de operador, con caja.',
    destacado: false, estado: 'disponible', fotos: [], vistas: 143, favs: 11, reserva: null,
    vip: 'iPhones', impulso: null, lat: -14.0681, lon: -75.7290, creado: hace(1, 16),
  });

  /* Historial: trueques ya cerrados, para que el ranking y los gráficos
     tengan algo real que mostrar desde el primer día */
  const historicos = [
    ['Plancha a vapor', 3, 'Chincha Alta', 2], ['Audífonos inalámbricos', 1, 'Ica', 3],
    ['Juego de llaves', 9, 'Sunampe', 4], ['Coche de bebé', 3, 'Chincha Baja', 2],
    ['Guitarra acústica', 7, 'Ica', 3], ['Microondas', 3, 'Chincha Alta', 4],
  ].map((h, i) => ({
    id: articulos.length + 1 + i, titulo: h[0], categoria: h[1], busca: 'Ya intercambiado',
    ciudad: h[2], usuario: h[3], condicion: 'usado', desc: '', destacado: false,
    estado: 'intercambiado', fotos: [], vistas: 30 + i * 7, favs: 1, reserva: null,
    vip: null, impulso: null,
    lat: (CIUDADES[h[2]] || CIUDADES['Chincha Alta'])[0], lon: (CIUDADES[h[2]] || CIUDADES['Chincha Alta'])[1],
    creado: hace(40 - i * 5, 12),
  }));
  articulos.push(...historicos);

  const base0 = historicos[0].id;
  const cerrados = [
    [3, 2, base0,     base0 + 1, 4],   // Jhonel ⇄ María
    [4, 3, base0 + 1, base0 + 2, 11],  // Camila ⇄ Jhonel
    [2, 4, base0 + 3, base0 + 5, 18],  // María ⇄ Camila
    [3, 2, base0 + 4, base0 + 3, 26],  // Jhonel ⇄ María
  ];
  const intercambios = cerrados.map((c, i) => ({
    id: 200 + i, de: c[0], para: c[1], pido: c[2], ofrezco: c[3],
    mensaje: '', estado: 'completado', checkA: true, checkB: true,
    lugar: ZONAS_SEGURAS[i % ZONAS_SEGURAS.length].nombre, fecha: '',
    creado: hace(c[4] + 2, 10), completado: hace(c[4], 18),
  }));
  const resenas = [];
  intercambios.forEach((x, i) => {
    [[x.de, x.para], [x.para, x.de]].forEach(([de, para], k) => {
      resenas.push({ id: 300 + i * 2 + k, trueque: x.id, de, para,
        puntaje: 5 - ((i + k) % 2), comentario: ['Todo puntual y como quedamos.',
          'Buena persona, el artículo estaba tal cual la foto.',
          'Cumplió con lo acordado, recomendado.'][(i + k) % 3],
        creado: x.completado });
    });
  });

  /* visitas de ejemplo de los últimos 14 días */
  const visitas = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    visitas.push({ dia: d.toISOString().slice(0, 10),
      total: 3 + ((i * 7) % 9), usuarios: [2, 3, 4].slice(0, 1 + (i % 3)) });
  }

  return {
    version: 8,
    usuarios, articulos,
    anuncios: [
      { id:1, titulo:'Ferretería El Martillo', desc:'20% de descuento presentando este anuncio. Av. Benavides 340, Chincha Alta.',
        empresa:'Publicidad local', img:null, tel:'956 700 800', wa:'https://wa.me/qr/Z6T6N7FJTXCNH1',
        web:'', destacado:true, activo:true, estado:'aprobado', solicitante:'', vistas:210, clics:14, creado:hace(4) },
      { id:2, titulo:'Panadería Doña Rosa', desc:'Delivery gratis en Chincha Alta por compras desde S/20.',
        empresa:'Publicidad local', img:null, tel:'956 900 100', wa:'', web:'',
        destacado:false, activo:true, estado:'aprobado', solicitante:'', vistas:180, clics:7, creado:hace(2) },
      { id:3, titulo:'Vidriería Chincha Glass', desc:'Instalación de mamparas y ventanas. Trabajo garantizado.',
        empresa:'Solicitud recibida por WhatsApp', img:null, tel:'956 480 220', wa:'', web:'',
        destacado:false, activo:true, estado:'pendiente', solicitante:'Luis Béjar', vistas:0, clics:0, creado:hace(1) },
    ],
    intercambios, chats: [], mensajes: [], notis: [], favoritos: [], resenas, pagos: [],
    visitas,
    /* "Quiero esto": pedidos de los Premium */
    deseos: [
      { id:11, usuario:2, titulo:'PlayStation 5', palabras:'ps5 playstation play 5 consola',
        categoria:8, vip:'PlayStation / Xbox', ofrezco:'Redmi Note 13 + accesorios',
        adicional:300, activo:true, avisados:[], creado:hace(3) },
    ],
    /* Trueque Seguro contratado */
    seguros: [],
    config: {
      nombre:'Truequea PE', lema:'Trueque justo y cercano — aquí no se compra, se cambia',
      logo:null, color:'#0b63d6', tema:'claro',
      yapeQr:null, yapeNombre:'Angel Levano', yapeNumero:'', precioPremium:3,
      precioImpulso:1, precioSeguro:1,
      /* Lectura automática del comprobante de Yape */
      autoYape:true, yapeMinimo:3, yapeCodigos:[],
      /* Contacto que se muestra en la sección "Anúnciate en TRUEQUEA.PE" */
      contacto: {
        nombre:'Angel Levano', cargo:'Administrador de Truequea PE',
        telefono:'956 000 000', email:'contacto@truequea.pe',
        wa:'https://wa.me/qr/Z6T6N7FJTXCNH1',
        horario:'Lunes a sábado · 9:00 a 20:00',
        texto:'¿Tienes un negocio en Chincha o Ica? Escríbeme y publicamos tu anuncio en la portada.',
      },
      /* Avisar al WhatsApp del administrador cada vez que hay un interesado */
      avisoWhatsApp: true,
    },
    sesion: null,
    seq: 100,
  };
}

function cargarBD() {
  if (BD) return BD;
  try {
    const txt = localStorage.getItem(LLAVE);
    BD = txt ? JSON.parse(txt) : semilla();
    if (!BD.version || BD.version < 8) BD = semilla();
  } catch { BD = semilla(); }
  if (!BD.visitas) BD.visitas = [];
  if (!BD.deseos)  BD.deseos = [];
  if (!BD.seguros) BD.seguros = [];
  return BD;
}

/* Registra un ingreso al sistema (sirve para el gráfico del administrador) */
function registrarVisita(uid) {
  const b = cargarBD();
  const hoy = new Date().toISOString().slice(0, 10);
  const v = b.visitas.find(x => x.dia === hoy);
  if (v) { v.total++; if (uid && !v.usuarios.includes(uid)) v.usuarios.push(uid); }
  else b.visitas.push({ dia: hoy, total: 1, usuarios: uid ? [uid] : [] });
  if (b.visitas.length > 120) b.visitas = b.visitas.slice(-120);
  guardar();
}

/* Enlace de WhatsApp listo para abrir con el mensaje escrito */
function linkWA(numero, texto) {
  const n = String(numero || '').replace(/\D/g, '');
  const num = n.length === 9 ? '51' + n : n;
  return 'https://wa.me/' + num + '?text=' + encodeURIComponent(texto || '');
}
/* WhatsApp del administrador (para avisos de interesados) */
function waAdmin(texto) {
  const c = (cargarBD().config.contacto) || {};
  if (c.telefono && String(c.telefono).replace(/\D/g, '').length >= 9) return linkWA(c.telefono, texto);
  return c.wa || 'https://wa.me/qr/Z6T6N7FJTXCNH1';
}

/* Las reservas Premium se sueltan solas cuando vence el plazo */
function liberarReservas() {
  const b = cargarBD();
  let cambio = false;
  b.articulos.forEach(a => {
    if (a.reserva && new Date(a.reserva.hasta) < new Date()) {
      if (a.estado === 'reservado') a.estado = 'disponible';
      a.reserva = null; cambio = true;
    }
  });
  if (cambio) guardar();
}
function reservaActiva(a) {
  return a && a.reserva && new Date(a.reserva.hasta) > new Date() ? a.reserva : null;
}
function restanteTxt(iso) {
  const ms = new Date(iso) - Date.now();
  if (ms <= 0) return 'vencida';
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h) return `${h} h ${m} min`;
  return m ? `${m} min` : `${s} s`;
}

/* --- Impulso: la publicación sube al primer lugar por horas pagadas --- */
function impulsoActivo(a) {
  return a && a.impulso && new Date(a.impulso.hasta) > new Date() ? a.impulso : null;
}
function vencerImpulsos() {
  const b = cargarBD();
  let cambio = false;
  b.articulos.forEach(a => {
    if (a.impulso && new Date(a.impulso.hasta) < new Date()) { a.impulso = null; cambio = true; }
  });
  if (cambio) guardar();
}

/* --- Bloqueo por reserva ---
   Mientras un Premium tiene reservada una publicación, el resto la VE
   pero no puede proponer, escribir ni marcar interés. */
function bloqueadoPorReserva(a, u) {
  const r = reservaActiva(a);
  if (!r) return false;
  if (!u) return true;
  return u.id !== r.por && u.id !== a.usuario && u.rol !== 'admin';
}

/* --- Nivel Premium: sube según los trueques cerrados --- */
const NIVELES_PRO = [
  { min:0,  nombre:'Bronce',   emo:'\u{1F949}', color:'#c98a3d' },
  { min:5,  nombre:'Plata',    emo:'\u{1F948}', color:'#b9c2cf' },
  { min:15, nombre:'Oro',      emo:'\u{1F947}', color:'#ffd76a' },
  { min:30, nombre:'Diamante', emo:'\u{1F48E}', color:'#8fe8ff' },
];
function nivelPro(u) {
  const n = u ? truequesDe(u.id) : 0;
  let nivel = NIVELES_PRO[0];
  NIVELES_PRO.forEach(x => { if (n >= x.min) nivel = x; });
  const sig = NIVELES_PRO.find(x => x.min > n);
  return { ...nivel, trueques: n, siguiente: sig, faltan: sig ? sig.min - n : 0 };
}

/* --- Impulsos de regalo del Premium: 3 cada mes --- */
function impulsosDisponibles(u) {
  if (!u || !u.premium) return 0;
  const mes = new Date().toISOString().slice(0, 7);
  /* al hacerse Premium, y luego cada mes, se le regalan 3 impulsos */
  if (u.proMes !== mes) { u.proMes = mes; u.impulsosGratis = 3; guardar(); }
  return u.impulsosGratis || 0;
}

/* --- VIP: solo los Premium participan en esa categoría --- */
function bloqueadoPorVip(a, u) {
  return !!(a && a.vip) && !(u && (u.premium || u.rol === 'admin'));
}
function guardar() {
  try { localStorage.setItem(LLAVE, JSON.stringify(BD)); }
  catch (e) { avisar('No se pudo guardar: el almacenamiento del navegador está lleno.', 'err'); }
}
function nuevoId() { BD.seq = (BD.seq || 100) + 1; guardar(); return BD.seq; }

/* Sesión: se guarda el id del usuario y se restaura al abrir la página */
function yo() {
  const b = cargarBD();
  if (!b.sesion) return null;
  const u = b.usuarios.find(x => x.id === b.sesion);
  if (!u || u.estado !== 'activo') { b.sesion = null; guardar(); return null; }
  // el premium vence solo
  if (u.premium && u.premiumHasta && new Date(u.premiumHasta) < new Date()) {
    u.premium = false; u.premiumHasta = null; guardar();
  }
  return u;
}
function entrar(u) { BD.sesion = u.id; guardar(); }
function salir()   { BD.sesion = null; guardar(); }


/* =====================================================================
   Interfaz: utilidades, render y eventos
   ===================================================================== */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = t => String(t ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const App = { filtros:{ q:'', cat:'', ciudad:'', cond:'', orden:'recientes' },
              fotos:[], fotoAnuncio:null, fotoYape:null, fotoLogo:null, fotoPago:null,
              fotoSolicitud:null, chat:null, puntaje:0, confirmar:null, modoAuth:'login',
              filtroVip:'', pagoTipo:'premium', pagoDatos:null, pagoArt:null, publicandoVip:false };

function avisar(msg, tipo = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast on ' + tipo;
  clearTimeout(window._t);
  window._t = setTimeout(() => t.className = 'toast', 3200);
}
function fechaTxt(iso) {
  if (!iso) return '';
  const d = new Date(iso), p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function relativo(iso) {
  if (!iso) return '';
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}
function estrellas(n) { const v = Math.round(n || 0); return '★'.repeat(v) + '☆'.repeat(5 - v); }
function foto(a) { return (a && a.fotos && a.fotos[0]) ? a.fotos[0] : SIN_FOTO; }
function avatarHTML(u, clase = 'mini-av') {
  if (!u) return `<div class="${clase}">?</div>`;
  return u.avatar ? `<div class="${clase}"><img src="${u.avatar}" alt=""></div>`
                  : `<div class="${clase}">${esc(u.nombre[0].toUpperCase())}</div>`;
}
function usuario(id) { return BD.usuarios.find(u => u.id === id); }
function reputacion(id) {
  const r = BD.resenas.filter(x => x.para === id);
  if (!r.length) return { prom: 5, total: 0 };
  return { prom: r.reduce((s, x) => s + x.puntaje, 0) / r.length, total: r.length };
}
/* Distancia real en kilómetros entre dos coordenadas (fórmula del semiverseno) */
function distanciaKm(la1, lo1, la2, lo2) {
  if ([la1, lo1, la2, lo2].some(v => typeof v !== 'number' || isNaN(v))) return null;
  const R = 6371, r = Math.PI / 180;
  const dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
  const x = Math.sin(dLa / 2) ** 2 +
            Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function distanciaDeMi(a) {
  const u = yo();
  if (!u || !u.lat || !a.lat) return 1e9;
  const d = distanciaKm(u.lat, u.lon, a.lat, a.lon);
  return d === null ? 1e9 : d;
}
function distanciaTxt(km) {
  if (km === null || km >= 1e8) return '';
  return km < 1 ? `a ${Math.round(km * 1000)} m` : `a ${km.toFixed(1)} km`;
}
function truequesDe(id) {
  return BD.intercambios.filter(x => (x.de === id || x.para === id) && x.estado === 'completado').length;
}
function abrir(id) { $('#' + id).classList.add('on'); }
function cerrar(id) { $('#' + id).classList.remove('on'); }
function cerrarTodo() { $$('.capa').forEach(c => c.classList.remove('on')); }
function confirmar(titulo, texto, cb, etiqueta = 'Sí, continuar', extra = '') {
  $('#confTitulo').textContent = titulo;
  $('#confTexto').textContent = texto;
  $('#confSi').textContent = etiqueta;
  $('#confExtra').innerHTML = extra;
  App.confirmar = cb;
  abrir('mConfirmar');
}
function leerArchivo(file, cb) {
  const fr = new FileReader();
  fr.onload = () => cb(fr.result);
  fr.readAsDataURL(file);
}
function notificar(uid, titulo, cuerpo) {
  BD.notis.unshift({ id: nuevoId(), usuario: uid, titulo, cuerpo, leida: false, creado: new Date().toISOString() });
  guardar();
}

/* La web cambia de traje: azul y naranja para todos, negro y dorado
   para las cuentas Premium. */
function aplicarPlan() {
  const u = yo();
  const pro = !!(u && u.premium);
  const antes = document.documentElement.dataset.plan;
  document.documentElement.dataset.plan = pro ? 'pro' : 'free';
  if (antes !== document.documentElement.dataset.plan) aplicarMarca();
  const nota = document.getElementById('planNota');
  if (nota) nota.textContent = pro ? '👑 Modo Premium activo' : '';
}

/* ---------------- tema y marca ---------------- */
function aplicarTema(t) {
  document.documentElement.dataset.tema = t;
  BD.config.tema = t; guardar();
}
function aplicarMarca() {
  const c = BD.config;
  const logo = c.logo || LOGO_DEFECTO;
  $('#logoNav').src = logo; $('#logoPie').src = logo; $('#logoAuth').src = logo;
  const partes = (c.nombre || 'Truequea PE').split(' ');
  const html = partes.length > 1
    ? `${esc(partes.slice(0, -1).join(' '))}<b>${esc(partes.at(-1))}</b>` : esc(c.nombre);
  $('#nombreNav').innerHTML = html; $('#nombrePie').innerHTML = html;
  $('#cinta').textContent = c.lema || '';
  /* el color elegido manda en la cuenta gratis; en Premium manda el dorado */
  if (document.documentElement.dataset.plan === 'pro') {
    document.documentElement.style.removeProperty('--azul');
  } else if (/^#[0-9a-f]{6}$/i.test(c.color || '')) {
    document.documentElement.style.setProperty('--azul', c.color);
  }
  document.title = (c.nombre || 'Truequea PE') + ' — Intercambia lo que tienes por lo que necesitas';
  $('#patronPortada').style.backgroundImage = `url("${PATRON}")`;
  $('#ilusPortada').style.backgroundImage = `url("${ILUSTRACION}")`;
}

/* ---------------- navegación ---------------- */
function irA(v) {
  $$('.vista').forEach(x => x.classList.remove('on'));
  $('#v-' + v)?.classList.add('on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (v === 'admin')   pintarAdmin();
  if (v === 'cuenta')  pintarCuenta();
  if (v === 'premium') pintarPremium();
}
function irListado() { $('#listado').scrollIntoView({ behavior: 'smooth' }); }

/* ---------------- barra superior ---------------- */
function pintarNav() {
  const u = yo(), cont = $('#navDer');
  aplicarPlan();
  if (!u) {
    cont.innerHTML = `<button class="btn suave sm" data-accion="publicar">Publicar</button>
      <button class="btn pri sm" data-accion="entrar">Entrar</button>`;
    return;
  }
  const noLeidas = BD.notis.filter(n => n.usuario === u.id && !n.leida).length;
  const msgs = BD.mensajes.filter(m => {
    const c = BD.chats.find(x => x.id === m.chat);
    return c && c.usuarios.includes(u.id) && m.de !== u.id && !m.leido;
  }).length;
  const props = BD.intercambios.filter(x => x.para === u.id && x.estado === 'pendiente').length;
  const rep = reputacion(u.id);

  cont.innerHTML = `
    <button class="btn pri sm" data-accion="publicar">+ Publicar</button>
    <button class="ico-btn" data-accion="mensajes" title="Mensajes">💬${msgs ? `<span class="globo">${msgs}</span>` : ''}</button>
    <button class="ico-btn" data-accion="notis" title="Notificaciones">🔔${noLeidas ? `<span class="globo">${noLeidas}</span>` : ''}</button>
    <div class="menu">
      <div class="avatar ${u.premium ? 'pro' : ''}" data-accion="menu">${u.avatar ? `<img src="${u.avatar}" alt="">` : esc(u.nombre[0].toUpperCase())}</div>
      <div class="menu-caja" id="menuCaja">
        <div class="menu-cab">
          <b>${esc(u.nombre)} ${u.premium ? `<span class="pro-badge">👑 ${esc(nivelPro(u).nombre)}</span>` : ''}</b>
          <small>${esc(u.email)}</small>
          <div class="estrellas" style="margin-top:4px">${estrellas(rep.prom)}
            <span class="n">${rep.prom.toFixed(1)} · ${truequesDe(u.id)} trueques</span></div>
        </div>
        <button data-ir="cuenta">📦 Mi cuenta ${props ? `<span class="mini-glob">${props}</span>` : ''}</button>
        <button data-accion="mensajes">💬 Mis mensajes</button>
        ${!u.premium ? '<button data-accion="premium">⭐ Hazte Premium — S/ 1</button>' : ''}
        ${u.rol === 'admin' ? '<button data-ir="admin">🛠️ Administración</button>' : ''}
        <button data-accion="tema">🌗 Cambiar tema</button>
        <button class="rojo" data-accion="salir">↪ Cerrar sesión</button>
      </div>
    </div>`;
}

/* ---------------- categorías ---------------- */
function pintarCategorias() {
  $('#categorias').innerHTML = CATEGORIAS.map((c, i) => {
    const n = BD.articulos.filter(a => a.categoria === i + 1 && a.estado === 'disponible').length;
    return `<button class="cat" data-cat="${i + 1}" aria-pressed="${App.filtros.cat == i + 1}">
      <span class="emo">${c[1]}</span><span class="nom">${c[0]}</span>
      <span class="num">${n} artículo${n === 1 ? '' : 's'}</span></button>`;
  }).join('');
  const ops = CATEGORIAS.map((c, i) => `<option value="${i + 1}">${c[1]} ${c[0]}</option>`).join('');
  $('#fCat').innerHTML = '<option value="">Todas</option>' + ops;
  $('#fCat').value = App.filtros.cat;
  $('#pubCat').innerHTML = '<option value="">Elige una categoría</option>' + ops;
  flechasCat();
}
function flechasCat() {
  const c = $('#categorias');
  if (!c) return;
  const max = c.scrollWidth - c.clientWidth - 4;
  $('#catIzq').disabled = c.scrollLeft <= 2;
  $('#catDer').disabled = c.scrollLeft >= max;
}
function pintarCiudades() {
  const ops = LISTA_CIUDADES.map(c => `<option value="${c}">${c}</option>`).join('');
  $('#fCiudad').innerHTML = '<option value="">Todas</option>' + ops;
  ['#pubCiudad', '#aCiudad', '#gCiudad', '#pfCiudad'].forEach(s => { if ($(s)) $(s).innerHTML = ops; });
}

/* ---------------- listado ---------------- */
function filtrar() {
  vencerImpulsos();
  let l = BD.articulos.filter(a => a.estado !== 'oculto' && !a.vip);
  const f = App.filtros;
  if (f.q) {
    const q = f.q.toLowerCase();
    l = l.filter(a => (a.titulo + ' ' + a.busca + ' ' + a.ciudad + ' ' + (a.desc || '')).toLowerCase().includes(q));
  }
  if (f.cat)    l = l.filter(a => a.categoria == f.cat);
  if (f.ciudad) l = l.filter(a => a.ciudad === f.ciudad);
  if (f.cond)   l = l.filter(a => a.condicion === f.cond);

  const rep = a => reputacion(a.usuario).prom;
  const ord = {
    recientes: (a, b) => new Date(b.creado) - new Date(a.creado),
    antiguos:  (a, b) => new Date(a.creado) - new Date(b.creado),
    reputacion:(a, b) => rep(b) - rep(a),
    cerca:     (a, b) => distanciaDeMi(a) - distanciaDeMi(b),
  }[f.orden] || ((a, b) => new Date(b.creado) - new Date(a.creado));
  /* primero lo impulsado (pagado), después lo destacado de Premium */
  return l.sort((a, b) =>
    (impulsoActivo(b) ? 1 : 0) - (impulsoActivo(a) ? 1 : 0) ||
    (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) || ord(a, b));
}

function tarjeta(a, candado = false) {
  const d = usuario(a.usuario), r = reputacion(a.usuario);
  const u = yo();
  const fav = u && BD.favoritos.some(f => f.usuario === u.id && f.articulo === a.id);
  const res = reservaActiva(a);
  const imp = impulsoActivo(a);
  const bloq = bloqueadoPorReserva(a, u);
  const sello = imp ? '<span class="sello azulf">🚀 Impulsado</span>'
    : res ? '<span class="sello mora">🔒 Apartado por Premium</span>'
    : a.destacado ? '<span class="sello oro">⭐ Destacado</span>'
    : a.estado === 'intercambiado' ? '<span class="sello verde">✓ Intercambiado</span>' : '';
  const km = u && u.lat && a.lat ? distanciaTxt(distanciaKm(u.lat, u.lon, a.lat, a.lon)) : '';
  const conf = confianza(d);
  return `<article class="art ${bloq ? 'bloqueada' : ''} ${a.vip ? 'esvip' : ''}" data-art="${a.id}">
    <div class="art-foto">
      <img src="${foto(a)}" alt="${esc(a.titulo)}" loading="lazy">
      ${sello}
      ${a.vip ? `<span class="sello vip">💎 VIP</span>` : ''}
      ${candado ? `<div class="capa-candado"><span>🔒</span><b>Solo Premium</b></div>` : ''}
      ${u && !candado ? `<button class="fav ${fav ? 'on' : ''}" data-fav="${a.id}" aria-label="Favorito">${fav ? '❤️' : '🤍'}</button>` : ''}
    </div>
    <div class="art-cuerpo">
      <span class="art-cat">${a.vip ? '💎 ' + esc(a.vip) : CATEGORIAS[a.categoria - 1][1] + ' ' + CATEGORIAS[a.categoria - 1][0]}</span>
      <h3 class="art-tit">${esc(a.titulo)}</h3>
      <p class="art-dato">🔁 ${esc(a.busca)}</p>
      <p class="art-dato">📍 ${esc(a.ciudad)}${km ? ' · ' + km : ''} · ${CONDICIONES[a.condicion]}</p>
      <p class="art-dato">🕓 ${fechaTxt(a.creado)}</p>
      ${res ? `<p class="art-dato blo">🔒 Apartado · quedan ${restanteTxt(res.hasta)}</p>` : ''}
      ${(a.favs || 0) ? `<p class="art-dato">❤️ ${a.favs} interesado${a.favs === 1 ? '' : 's'}</p>` : ''}
      <div class="art-pie">
        <span class="mini-user" title="${esc(conf.etiqueta)}">${avatarHTML(d)}${esc(d ? d.nombre : '—')}${d && d.premium ? ' 👑' : ''}
          <i class="punto ${conf.nivel}"></i></span>
        <span class="estrellas">${estrellas(r.prom)}<span class="n">${r.prom.toFixed(1)}</span></span>
      </div>
    </div></article>`;
}

function tarjetaAnuncio(ad) {
  return `<article class="anuncio" data-anuncio="${ad.id}" tabindex="0">
    <div class="cara">
      <div class="anuncio-foto">
        <img src="${ad.img || SIN_FOTO}" alt="${esc(ad.titulo)}" loading="lazy">
        <div class="anuncio-brillo"></div>
      </div>
      <div class="anuncio-cuerpo">
        <span class="marca-pub">PUBLICIDAD</span>
        <h4>${esc(ad.titulo)}</h4>
        <p>${esc(ad.desc)}</p>
        ${ad.tel ? `<p style="font-size:13px;margin-top:7px;font-weight:700">📞 ${esc(ad.tel)}</p>` : ''}
        <p style="font-size:12px;margin-top:8px;color:var(--sub)">Toca para ver la información 👆</p>
      </div>
    </div></article>`;
}

/* Solo salen al público los anuncios aprobados y activos */
function anunciosPublicos() {
  return BD.anuncios.filter(a => a.activo && a.estado === 'aprobado');
}

/* --- Sección "Anúnciate en TRUEQUEA.PE" --- */
function pintarVitrina() {
  const ads = anunciosPublicos();
  const hueco = `<div class="hueco-pub" data-accion="anunciate">
      <span class="em">📣</span><b>Tu anuncio puede ir aquí</b>
      <span>Toca para dejar tus datos</span></div>`;
  $('#vitrinaPub').innerHTML = ads.length
    ? ads.slice(0, 7).map(tarjetaAnuncio).join('') + hueco
    : `<div class="vitrina-vacia">Todavía no hay anuncios publicados.<br>
        <b>Este espacio puede ser el de tu negocio.</b></div>` + hueco;
  activar3D();
  pintarContacto();
}
function pintarContacto() {
  const c = BD.config.contacto || {};
  const tel = String(c.telefono || '').replace(/\D/g, '');
  const wa = tel.length >= 9 ? linkWA(tel, `Hola ${c.nombre || ''}, quiero publicar un anuncio en Truequea PE.`)
                             : (c.wa || 'https://wa.me/qr/Z6T6N7FJTXCNH1');
  $('#contactoCaja').innerHTML = `
    <div class="sello-marca">📣</div>
    <div class="quien">
      <h3>${esc(c.nombre || 'Angel Levano')}</h3>
      <p class="cargo">${esc(c.cargo || 'Administrador de Truequea PE')}</p>
      <div class="contacto-datos">
        ${c.telefono ? `<a href="tel:${esc(String(c.telefono).replace(/\s/g, ''))}">📞 ${esc(c.telefono)}</a>` : ''}
        ${c.email ? `<a href="mailto:${esc(c.email)}">✉️ ${esc(c.email)}</a>` : ''}
        ${c.horario ? `<span>🕓 ${esc(c.horario)}</span>` : ''}
      </div>
      ${c.texto ? `<p style="font-size:14px;color:var(--sub);margin-top:12px;max-width:430px">${esc(c.texto)}</p>` : ''}
    </div>
    <div class="contacto-acc">
      <a class="wa" target="_blank" rel="noopener" href="${esc(wa)}">💬 Escribir por WhatsApp</a>
      <button class="btn pri" data-accion="anunciate">📣 Quiero mi anuncio aquí</button>
    </div>`;
}

function pintarLista() {
  liberarReservas();
  const l = filtrar(), u = yo();
  $('#conteo').textContent = `${l.length} ${l.length === 1 ? 'artículo' : 'artículos'}`;
  pintarChips();

  const cont = $('#lista');
  if (!l.length) {
    cont.innerHTML = `<div class="vacio"><div class="em">🔍</div><p>No hay artículos con esos filtros.</p>
      <button class="btn suave sm" style="margin-top:12px" onclick="limpiarFiltros()">Quitar filtros</button></div>`;
    return;
  }
  // los usuarios Premium no ven publicidad
  const ads = (u && u.premium) ? [] : anunciosPublicos().filter(a => !a.destacado);
  let html = '', k = 0;
  l.forEach((a, i) => {
    html += tarjeta(a);
    if ((i + 1) % 4 === 0 && ads.length) { html += tarjetaAnuncio(ads[k % ads.length]); k++; }
  });
  cont.innerHTML = html;
  activar3D();

  const dest = (u && u.premium) ? null : anunciosPublicos().find(a => a.destacado);
  $('#bannerPub').innerHTML = dest ? `
    <div class="banner-pub" data-anuncio="${dest.id}">
      <img src="${dest.img || SIN_FOTO}" alt="">
      <div style="flex:1;min-width:200px">
        <span class="marca-pub">PUBLICIDAD</span>
        <h3>${esc(dest.titulo)}</h3><p>${esc(dest.desc)}</p>
      </div>
      ${dest.wa ? `<span class="wa">💬 WhatsApp</span>` : ''}
    </div>` : '';
  if (dest) { dest.vistas = (dest.vistas || 0) + 1; guardar(); }
  pintarVitrina();
  pintarVip();
  pintarRanking();
  if (typeof mapaRealInicio === 'function') mapaRealInicio();
}

/* efecto 3D de los anuncios al mover el mouse */
function activar3D() {
  $$('.anuncio').forEach(el => {
    const cara = el.querySelector('.cara');
    const brillo = el.querySelector('.anuncio-brillo');
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      cara.style.transform = `rotateY(${(px - .5) * 16}deg) rotateX(${(.5 - py) * 16}deg) scale(1.02)`;
      if (brillo) { brillo.style.setProperty('--bx', px * 100 + '%'); brillo.style.setProperty('--by', py * 100 + '%'); }
    });
    el.addEventListener('mouseleave', () => { cara.style.transform = ''; });
  });
}

function pintarChips() {
  const f = App.filtros, chips = [];
  if (f.q)      chips.push(['q', '🔍 ' + f.q]);
  if (f.cat)    chips.push(['cat', CATEGORIAS[f.cat - 1][1] + ' ' + CATEGORIAS[f.cat - 1][0]]);
  if (f.ciudad) chips.push(['ciudad', '📍 ' + f.ciudad]);
  if (f.cond)   chips.push(['cond', CONDICIONES[f.cond]]);
  $('#chips').innerHTML = chips.map(([k, t]) =>
    `<span class="chip">${esc(t)}<button data-quitar="${k}">✕</button></span>`).join('');
}
function limpiarFiltros() {
  App.filtros = { q:'', cat:'', ciudad:'', cond:'', orden:'recientes' };
  $('#buscador').value = ''; $('#fCat').value = ''; $('#fCiudad').value = '';
  $('#fCond').value = ''; $('#fOrden').value = 'recientes';
  pintarCategorias(); pintarLista(); pintarMapa();
}

/* ---------------- MAPA ---------------- */
const MAPA = { w:800, h:420, minLat:-14.95, maxLat:-11.95, minLon:-77.25, maxLon:-74.85 };

/* El mapa se acerca solo a la zona donde hay artículos */
function calcularZoom(puntos) {
  if (!puntos.length) { Object.assign(MAPA, { minLat:-14.4, maxLat:-13.2, minLon:-76.5, maxLon:-75.5 }); return; }
  let minLa = 90, maxLa = -90, minLo = 180, maxLo = -180;
  puntos.forEach(p => {
    minLa = Math.min(minLa, p.lat); maxLa = Math.max(maxLa, p.lat);
    minLo = Math.min(minLo, p.lon); maxLo = Math.max(maxLo, p.lon);
  });
  // margen mínimo para que un solo punto no quede pegado al borde
  const mLa = Math.max((maxLa - minLa) * 0.35, 0.14);
  const mLo = Math.max((maxLo - minLo) * 0.25, 0.22);
  minLa -= mLa; maxLa += mLa; minLo -= mLo; maxLo += mLo;
  // respetar la proporción del lienzo para que no se deforme
  const propLienzo = MAPA.w / MAPA.h;
  const anchoLo = maxLo - minLo, altoLa = maxLa - minLa;
  if (anchoLo / altoLa < propLienzo) {
    const nuevo = altoLa * propLienzo, c = (minLo + maxLo) / 2;
    minLo = c - nuevo / 2; maxLo = c + nuevo / 2;
  } else {
    const nuevo = anchoLo / propLienzo, c = (minLa + maxLa) / 2;
    minLa = c - nuevo / 2; maxLa = c + nuevo / 2;
  }
  Object.assign(MAPA, { minLat: minLa, maxLat: maxLa, minLon: minLo, maxLon: maxLo });
}
function proyectar(lat, lon) {
  const x = ((lon - MAPA.minLon) / (MAPA.maxLon - MAPA.minLon)) * MAPA.w;
  const y = ((MAPA.maxLat - lat) / (MAPA.maxLat - MAPA.minLat)) * MAPA.h;
  return [x, y];
}
function dentro(x, y) { return x > -30 && x < MAPA.w + 30 && y > -30 && y < MAPA.h + 30; }

function pintarMapa() {
  const svg = $('#mapa');
  const oscuro = document.documentElement.dataset.tema === 'oscuro';
  const tierra = oscuro ? '#1b2534' : '#e9f1e6';
  const mar    = oscuro ? '#0d1826' : '#cfe3f7';
  const linea  = oscuro ? '#33415a' : '#bcd0b8';
  const texto  = oscuro ? '#93a0b5' : '#6f7b8c';

  const u = yo();
  const arts = filtrar().filter(a => a.estado !== 'oculto' && a.lat && a.lon);
  const puntos = [...arts];
  if (u && u.lat) puntos.push({ lat: u.lat, lon: u.lon });
  calcularZoom(puntos);

  // costa aproximada del litoral (Lima sur → Nasca)
  const costa = [[-11.95,-77.15],[-12.20,-77.10],[-12.60,-76.85],[-13.10,-76.55],
                 [-13.45,-76.30],[-13.75,-76.28],[-14.10,-76.10],[-14.50,-75.90],
                 [-14.95,-75.55]].map(c => proyectar(c[0], c[1]));
  const linCosta = costa.map((c, i) => (i ? 'L' : 'M') + c[0].toFixed(1) + ',' + c[1].toFixed(1)).join(' ');

  let capas = `
    <rect width="${MAPA.w}" height="${MAPA.h}" fill="${mar}"/>
    <path d="${linCosta} L${MAPA.w + 200},${MAPA.h + 200} L${MAPA.w + 200},-200 Z" fill="${tierra}"/>
    <path d="${linCosta}" fill="none" stroke="${linea}" stroke-width="2.5"/>
    <g opacity="${oscuro ? .1 : .16}" stroke="${linea}" stroke-width="1">
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${i * 52}" x2="${MAPA.w}" y2="${i * 52}"/>`).join('')}
      ${[...Array(12)].map((_, i) => `<line x1="${i * 70}" y1="0" x2="${i * 70}" y2="${MAPA.h}"/>`).join('')}
    </g>`;

  // etiquetas de ciudad: una por zona, sin encimarse con otra etiqueta
  const puestas = [];
  capas += [...new Set(arts.map(a => a.ciudad))].map(c => {
    if (!CIUDADES[c]) return '';
    let [x, y] = proyectar(CIUDADES[c][0], CIUDADES[c][1]);
    y = Math.min(Math.max(y + 34, 18), MAPA.h - 10);   // debajo del pin, dentro del lienzo
    if (!dentro(x, y)) return '';
    if (puestas.some(p => Math.hypot(p[0] - x, p[1] - y) < 62)) return '';   // ya hay una etiqueta cerca
    puestas.push([x, y]);
    return `<text x="${x}" y="${y}" font-size="12.5" font-weight="700" font-family="sans-serif"
      text-anchor="middle" fill="${texto}"
      style="paint-order:stroke;stroke:${oscuro ? '#0d1826' : '#ffffff'};stroke-width:4">${esc(c)}</text>`;
  }).join('');

  // zonas seguras
  capas += ZONAS_SEGURAS.map(z => {
    const [x, y] = proyectar(z.lat, z.lon);
    if (!dentro(x, y)) return '';
    return `<g class="pin"><circle cx="${x}" cy="${y}" r="8" fill="#12703c" opacity=".92"/>
      <text x="${x}" y="${y + 4}" font-size="9" text-anchor="middle" fill="#fff">🛡</text>
      <title>Zona segura: ${esc(z.nombre)}</title></g>`;
  }).join('');

  // artículos (separando los que caen en el mismo punto)
  const usados = [];
  capas += arts.map(a => {
    let [x, y] = proyectar(a.lat, a.lon);
    let intentos = 0;
    while (usados.some(p => Math.hypot(p[0] - x, p[1] - y) < 26) && intentos < 14) {
      const ang = intentos * 1.2, rad = 26 + intentos * 3;
      x += Math.cos(ang) * rad * .5; y += Math.sin(ang) * rad * .5; intentos++;
    }
    usados.push([x, y]);
    if (!dentro(x, y)) return '';
    const color = a.destacado ? '#d99a1f' : '#0a5fc4';
    return `<g class="pin" data-pin="${a.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <ellipse cx="0" cy="7" rx="7" ry="2.6" fill="rgba(0,0,0,.22)"/>
      <path d="M0 6 C-9 -6 -11 -13 -6 -18 C-1 -23 6 -21 8 -15 C10 -9 6 -1 0 6 Z"
        fill="${color}" stroke="#fff" stroke-width="1.8"/>
      <circle cx="1" cy="-14" r="3.6" fill="#fff"/>
      <title>${esc(a.titulo)} · ${esc(a.ciudad)}</title></g>`;
  }).join('');

  // mi ubicación
  if (u && u.lat && u.lon) {
    const [x, y] = proyectar(u.lat, u.lon);
    if (dentro(x, y)) {
      capas += `<g><circle cx="${x}" cy="${y}" r="15" fill="#0a5fc4" opacity=".16"/>
        <circle cx="${x}" cy="${y}" r="6.5" fill="#0a5fc4" stroke="#fff" stroke-width="2.5"/>
        <text x="${x}" y="${y - 14}" font-size="12" font-weight="700" text-anchor="middle" fill="#0a5fc4"
          style="paint-order:stroke;stroke:${oscuro ? '#0d1826' : '#fff'};stroke-width:3">Estás aquí</text></g>`;
    }
  }
  svg.innerHTML = capas;
}

/* =====================================================================
   MAPA AVANZADO PREMIUM
   Usa la ubicación real de cada publicación, marca la distancia
   hasta ti y deja filtrar por radio en kilómetros.
   ===================================================================== */
const MAPA_PRO = { w:800, h:520, minLat:-14.95, maxLat:-11.95, minLon:-77.25, maxLon:-74.85 };
App.radioPro = 0;

function zoomPro(puntos) {
  if (!puntos.length) { Object.assign(MAPA_PRO, { minLat:-13.55, maxLat:-13.28, minLon:-76.28, maxLon:-76.02 }); return; }
  let minLa = 90, maxLa = -90, minLo = 180, maxLo = -180;
  puntos.forEach(p => {
    minLa = Math.min(minLa, p.lat); maxLa = Math.max(maxLa, p.lat);
    minLo = Math.min(minLo, p.lon); maxLo = Math.max(maxLo, p.lon);
  });
  const mLa = Math.max((maxLa - minLa) * .3, .035);
  const mLo = Math.max((maxLo - minLo) * .22, .05);
  minLa -= mLa; maxLa += mLa; minLo -= mLo; maxLo += mLo;
  const prop = MAPA_PRO.w / MAPA_PRO.h, anLo = maxLo - minLo, alLa = maxLa - minLa;
  if (anLo / alLa < prop) { const n = alLa * prop, c = (minLo + maxLo) / 2; minLo = c - n / 2; maxLo = c + n / 2; }
  else { const n = anLo / prop, c = (minLa + maxLa) / 2; minLa = c - n / 2; maxLa = c + n / 2; }
  Object.assign(MAPA_PRO, { minLat:minLa, maxLat:maxLa, minLon:minLo, maxLon:maxLo });
}
function proyectarPro(lat, lon) {
  return [((lon - MAPA_PRO.minLon) / (MAPA_PRO.maxLon - MAPA_PRO.minLon)) * MAPA_PRO.w,
          ((MAPA_PRO.maxLat - lat) / (MAPA_PRO.maxLat - MAPA_PRO.minLat)) * MAPA_PRO.h];
}

/* Artículos que el Premium ve en su mapa, ya ordenados por cercanía */
function articulosPro() {
  const u = yo();
  if (!u) return [];
  liberarReservas();
  let l = BD.articulos.filter(a => a.estado !== 'oculto' && a.estado !== 'intercambiado'
                                && a.usuario !== u.id && a.lat && a.lon);
  l = l.map(a => ({ ...a, km: (u.lat ? distanciaKm(u.lat, u.lon, a.lat, a.lon) : null) }));
  if (App.radioPro && u.lat) l = l.filter(a => a.km !== null && a.km <= App.radioPro);
  return l.sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9));
}

function pintarMapaPro() {
  const svg = $('#mapaPro');
  const u = yo();
  if (!svg || !u || !u.premium) return;

  const oscuro = document.documentElement.dataset.tema === 'oscuro';
  const tierra = oscuro ? '#1b2534' : '#eef3ea';
  const mar    = oscuro ? '#0d1826' : '#cfe3f7';
  const linea  = oscuro ? '#33415a' : '#b8ccb4';
  const texto  = oscuro ? '#93a0b5' : '#5f6b7c';

  const arts = articulosPro();
  const puntos = arts.map(a => ({ lat:a.lat, lon:a.lon }));
  if (u.lat) puntos.push({ lat:u.lat, lon:u.lon });
  zoomPro(puntos);

  const costa = [[-11.95,-77.15],[-12.20,-77.10],[-12.60,-76.85],[-13.10,-76.55],
                 [-13.45,-76.30],[-13.75,-76.28],[-14.10,-76.10],[-14.50,-75.90],
                 [-14.95,-75.55]].map(c => proyectarPro(c[0], c[1]));
  const lin = costa.map((c, i) => (i ? 'L' : 'M') + c[0].toFixed(1) + ',' + c[1].toFixed(1)).join(' ');

  let capas = `<rect width="${MAPA_PRO.w}" height="${MAPA_PRO.h}" fill="${mar}"/>
    <path d="${lin} L${MAPA_PRO.w + 300},${MAPA_PRO.h + 300} L${MAPA_PRO.w + 300},-300 Z" fill="${tierra}"/>
    <path d="${lin}" fill="none" stroke="${linea}" stroke-width="2.5"/>
    <g opacity="${oscuro ? .1 : .18}" stroke="${linea}" stroke-width="1">
      ${[...Array(11)].map((_, i) => `<line x1="0" y1="${i * 52}" x2="${MAPA_PRO.w}" y2="${i * 52}"/>`).join('')}
      ${[...Array(13)].map((_, i) => `<line x1="${i * 64}" y1="0" x2="${i * 64}" y2="${MAPA_PRO.h}"/>`).join('')}
    </g>`;

  /* círculos de distancia alrededor de mi ubicación */
  if (u.lat && u.lon) {
    const [cx, cy] = proyectarPro(u.lat, u.lon);
    const gradoKm = (MAPA_PRO.maxLat - MAPA_PRO.minLat) * 111;
    [1, 3, 10].forEach(km => {
      const r = (km / gradoKm) * MAPA_PRO.h;
      if (r > 12 && r < MAPA_PRO.w) {
        capas += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none"
          stroke="#7b3fe4" stroke-width="1.2" stroke-dasharray="5 6" opacity=".45"/>
          <text x="${cx}" y="${(cy - r + 13).toFixed(1)}" font-size="11" font-weight="700"
            text-anchor="middle" fill="#7b3fe4" opacity=".8">${km} km</text>`;
      }
    });
  }

  /* etiquetas de ciudad */
  const puestas = [];
  capas += [...new Set(arts.map(a => a.ciudad))].map(c => {
    if (!CIUDADES[c]) return '';
    let [x, y] = proyectarPro(CIUDADES[c][0], CIUDADES[c][1]);
    y = Math.min(Math.max(y + 36, 20), MAPA_PRO.h - 12);
    if (x < -20 || x > MAPA_PRO.w + 20) return '';
    if (puestas.some(p => Math.hypot(p[0] - x, p[1] - y) < 66)) return '';
    puestas.push([x, y]);
    return `<text x="${x}" y="${y}" font-size="12.5" font-weight="700" font-family="sans-serif"
      text-anchor="middle" fill="${texto}"
      style="paint-order:stroke;stroke:${oscuro ? '#0d1826' : '#ffffff'};stroke-width:4">${esc(c)}</text>`;
  }).join('');

  /* pines con la ubicación exacta */
  const usados = [];
  capas += arts.map(a => {
    let [x, y] = proyectarPro(a.lat, a.lon);
    let n = 0;
    while (usados.some(p => Math.hypot(p[0] - x, p[1] - y) < 24) && n < 14) {
      x += Math.cos(n * 1.2) * 13; y += Math.sin(n * 1.2) * 13; n++;
    }
    usados.push([x, y]);
    if (x < -30 || x > MAPA_PRO.w + 30 || y < -30 || y > MAPA_PRO.h + 30) return '';
    const res = reservaActiva(a);
    const mia = res && res.por === u.id;
    const color = mia ? '#d99a1f' : res ? '#8b93a5' : '#0a5fc4';
    return `<g class="pin" data-pinpro="${a.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <ellipse cx="0" cy="7" rx="7" ry="2.6" fill="rgba(0,0,0,.22)"/>
      <path d="M0 6 C-9 -6 -11 -13 -6 -18 C-1 -23 6 -21 8 -15 C10 -9 6 -1 0 6 Z"
        fill="${color}" stroke="#fff" stroke-width="1.8"/>
      <circle cx="1" cy="-14" r="3.6" fill="#fff"/>
      <title>${esc(a.titulo)} · ${esc(a.ciudad)}${a.km !== null ? ' · ' + distanciaTxt(a.km) : ''}</title></g>`;
  }).join('');

  /* mi punto */
  if (u.lat && u.lon) {
    const [x, y] = proyectarPro(u.lat, u.lon);
    capas += `<g><circle cx="${x}" cy="${y}" r="17" fill="#7b3fe4" opacity=".18"/>
      <circle cx="${x}" cy="${y}" r="7" fill="#7b3fe4" stroke="#fff" stroke-width="2.6"/>
      <text x="${x}" y="${y - 15}" font-size="12.5" font-weight="800" text-anchor="middle" fill="#7b3fe4"
        style="paint-order:stroke;stroke:${oscuro ? '#0d1826' : '#fff'};stroke-width:3.4">Tú</text></g>`;
  } else {
    capas += `<text x="${MAPA_PRO.w / 2}" y="26" font-size="13.5" font-weight="700" text-anchor="middle"
      fill="#7b3fe4" style="paint-order:stroke;stroke:${oscuro ? '#0d1826' : '#fff'};stroke-width:4">
      Marca tu ubicación en Mi cuenta → Perfil para ver las distancias</text>`;
  }
  svg.innerHTML = capas;
}


/* =====================================================================
   Acciones: cuenta, publicaciones, trueques, chat, premium, admin
   ===================================================================== */

/* ---------------- autenticación ---------------- */
function abrirAuth(modo = 'login') {
  App.modoAuth = modo; refrescarAuth();
  $('#errAuth').hidden = true;
  abrir('mAuth');
}
function refrescarAuth() {
  const reg = App.modoAuth === 'registro';
  $('#authTitulo').textContent = reg ? 'Crear mi cuenta en 20 segundos' : 'Entrar a ' + BD.config.nombre;
  $('#authSub').textContent = reg
    ? 'Solo tu nombre, tu correo y una contraseña que recuerdes'
    : 'Usa tu correo o tu cuenta de Google';
  $('#soloReg').hidden = !reg;
  $('#aNombre').required = reg;
  $('#btnAuth').textContent = reg ? 'Crear mi cuenta' : 'Entrar';
  $('#pistaAdmin').hidden = reg;
  $('#pistaPass').hidden = !reg;
  $('#medAuth').hidden = !reg;
  $('#aPass').autocomplete = reg ? 'new-password' : 'current-password';
  $('#cambioAuth').innerHTML = reg
    ? '¿Ya tienes cuenta? <button type="button">Entrar</button>'
    : '¿No tienes cuenta? <button type="button">Crear una cuenta</button>';
}
function errorAuth(msg) { const e = $('#errAuth'); e.textContent = msg; e.hidden = false; }

function medir(input, medidor) {
  const v = input.value; let p = 0;
  if (v.length >= 8) p++;
  if (v.length >= 12) p++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) p++;
  if (/\d/.test(v)) p++;
  if (/[^\w\s]/.test(v)) p++;
  medidor.className = 'medidor n' + p;
  medidor.querySelector('i').style.width = (p / 5 * 100) + '%';
}
/* Registro fácil: con 6 caracteres basta. Lo importante es que la recuerdes. */
function validarPass(p) {
  if (!p || p.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}

/* Código de respaldo para recuperar la cuenta sin correo ni servidor */
function nuevoCodigo() {
  let c;
  do { c = 'TRUEQUEA-' + Math.floor(1000 + Math.random() * 9000); }
  while (BD.usuarios.some(u => u.codigo === c));
  return c;
}
function mostrarCodigo(u) {
  $('#codigoTxt').textContent = u.codigo;
  abrir('mCodigo');
}
function textoAcceso(u) {
  return `TRUEQUEA PE — Mis datos de acceso\r\n\r\n` +
    `Nombre: ${u.nombre}\r\nCorreo: ${u.email}\r\n` +
    `Contraseña: ${u.pass || '(entras con Google)'}\r\n` +
    `Código de respaldo: ${u.codigo}\r\n\r\n` +
    `Con el código de respaldo puedes cambiar tu contraseña en\r\n` +
    `"Entrar" → "Olvidé mi contraseña". Guarda este archivo.\r\n`;
}

function registrar(datos) {
  const email = String(datos.email || '').trim().toLowerCase();
  if (!datos.nombre || datos.nombre.trim().length < 2) return { err: 'Escribe tu nombre.' };
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return { err: 'Revisa tu correo: parece incompleto.' };
  if (BD.usuarios.some(u => u.email.toLowerCase() === email))
    return { err: 'Ese correo ya tiene cuenta. Entra con tu contraseña o usa "Olvidé mi contraseña".' };
  if (!datos.social && !datos.express) { const e = validarPass(datos.pass || ''); if (e) return { err: e }; }
  if (datos.express && String(datos.pin || '').length !== 4) return { err: 'El PIN debe tener 4 números.' };

  const ciudad = datos.ciudad || 'Chincha Alta';
  const c = CIUDADES[ciudad] || CIUDADES['Chincha Alta'];
  const u = {
    id: nuevoId(), nombre: datos.nombre.trim(), email, pass: datos.pass || null,
    pin: datos.pin || null,
    rol: 'usuario', ciudad, avatar: null, telefono: datos.telefono || null, bio: '', ref: '',
    lat: c[0], lon: c[1], premium: false, premiumHasta: null, puntos: 0, nivel: 1,
    estado: 'activo', creado: new Date().toISOString(), verificado: !!datos.social,
    codigo: nuevoCodigo(), avisos: true, express: !!datos.express,
    impulsosGratis: 0, impulsosMes: new Date().toISOString().slice(0, 7),
  };
  BD.usuarios.push(u);
  entrar(u);                                   // ← la sesión queda guardada de inmediato
  registrarVisita(u.id);
  notificar(u.id, '¡Bienvenido a ' + BD.config.nombre + '!',
            'Publica tu primer artículo y empieza a intercambiar. Tu código de respaldo es ' + u.codigo + '.');
  guardar();
  return { usuario: u };
}

/* Recuperar la cuenta con el código de respaldo */
function recuperarCuenta(email, codigo, nueva) {
  email = String(email || '').trim().toLowerCase();
  const u = BD.usuarios.find(x => x.email.toLowerCase() === email);
  if (!u) return { err: 'No encontramos una cuenta con ese correo.' };
  if (String(codigo || '').trim().toUpperCase() !== String(u.codigo || '').toUpperCase())
    return { err: 'El código de respaldo no coincide con esa cuenta.' };
  const e = validarPass(nueva); if (e) return { err: e };
  u.pass = nueva;
  entrar(u); guardar();
  return { usuario: u };
}

/* Entra con el correo O con el número de celular, y con la contraseña O el PIN */
function iniciarSesion(email, pass) {
  const dato = String(email || '').trim().toLowerCase();
  const soloNumeros = dato.replace(/\D/g, '');
  const u = BD.usuarios.find(x => x.email.toLowerCase() === dato) ||
            (soloNumeros.length >= 9
              ? BD.usuarios.find(x => (x.telefono || '').replace(/\D/g, '') === soloNumeros) : null);
  if (!u) return { err: 'No encontramos esa cuenta. Revisa tu correo o celular, o crea una nueva.' };
  const clave = String(pass || '');
  const coincide = (u.pass && u.pass === clave) || (u.pin && u.pin === clave);
  if ((u.pass || u.pin) && !coincide) return { err: 'La contraseña o el PIN no coinciden.' };
  if (!u.pass && !u.pin && clave) return { err: 'Esta cuenta entra con Google. Usa el botón de Google.' };
  if (u.estado !== 'activo') return { err: 'Tu cuenta está suspendida.' };
  if (!u.codigo) { u.codigo = nuevoCodigo(); }
  entrar(u);
  registrarVisita(u.id);
  return { usuario: u };
}

function trasEntrar(u, msg) {
  cerrarTodo();
  pintarNav(); pintarLista(); pintarMapa(); pintarCategorias();
  avisar(msg || `¡Hola, ${u.nombre}!`, 'ok');
  if (u.rol === 'admin') irA('admin');
}

/* ---------------- publicar ---------------- */
function abrirPublicar(art = null) {
  const u = yo();
  if (!u) { abrirAuth('login'); return avisar('Entra a tu cuenta para publicar'); }

  App.fotos = [];
  $('#formPublicar').reset();
  $('#minisPub').innerHTML = '';
  $('#zonaFotos').textContent = '📷 Clic para subir hasta 6 fotos';

  if (art) {
    $('#pubTitulo').textContent = 'Editar publicación';
    $('#btnPublicar').textContent = 'Guardar cambios';
    $('#pubId').value = art.id;
    $('#pubNombre').value = art.titulo;
    $('#pubCat').value = art.categoria;
    $('#pubCond').value = art.condicion;
    $('#pubCiudad').value = art.ciudad;
    $('#pubBusca').value = art.busca;
    $('#pubDesc').value = art.desc || '';
    App.fotos = [...(art.fotos || [])];
    pintarMinis();
  } else {
    $('#pubTitulo').textContent = App.publicandoVip ? 'Publicar en 💎 Trueques VIP' : 'Publicar artículo';
    $('#btnPublicar').textContent = 'Publicar';
    $('#pubId').value = '';
    $('#pubCiudad').value = u.ciudad;
  }
  /* la vitrina VIP solo se ofrece a los Premium */
  const puedeVip = !!(u.premium || u.rol === 'admin');
  $('#filaVip').hidden = !puedeVip;
  $('#pubVip').innerHTML = '<option value="">No, publicación normal</option>' +
    CATEGORIAS_VIP.map(c => `<option value="${c[0]}">${c[1]} ${c[0]}</option>`).join('');
  $('#pubVip').value = art ? (art.vip || '') : (App.publicandoVip ? CATEGORIAS_VIP[0][0] : '');
  App.publicandoVip = false;
  abrir('mPublicar');
}
function pintarMinis() {
  $('#minisPub').innerHTML = App.fotos.map((f, i) =>
    `<figure><img src="${f}" alt=""><button type="button" data-quitarfoto="${i}">✕</button></figure>`).join('');
  $('#zonaFotos').textContent = App.fotos.length
    ? `📷 ${App.fotos.length} foto(s) — clic para agregar más`
    : '📷 Clic para subir hasta 6 fotos';
}
function guardarPublicacion() {
  const u = yo();
  if (!u) { abrirAuth('login'); return avisar('Tu sesión se cerró. Vuelve a entrar.', 'err'); }

  const id = $('#pubId').value;
  const titulo = $('#pubNombre').value.trim();
  const cat = Number($('#pubCat').value);
  const busca = $('#pubBusca').value.trim();
  const ciudad = $('#pubCiudad').value;

  if (titulo.length < 4) return avisar('El título debe tener al menos 4 caracteres', 'err');
  if (!cat)              return avisar('Elige una categoría', 'err');
  if (!busca)            return avisar('Escribe qué buscas a cambio', 'err');

  if (!id && !u.premium) {
    const activas = BD.articulos.filter(a => a.usuario === u.id && a.estado === 'disponible').length;
    if (activas >= LIMITE_GRATIS) {
      cerrar('mPublicar');
      return confirmar('Llegaste al límite gratuito',
        `Tienes ${LIMITE_GRATIS} publicaciones activas. Con Premium son ilimitadas por S/ ${BD.config.precioPremium}.`,
        () => irA('premium'), 'Ver Premium');
    }
  }

  const c = CIUDADES[ciudad] || CIUDADES['Chincha Alta'];
  const datos = {
    titulo, categoria: cat, busca, ciudad,
    condicion: $('#pubCond').value,
    desc: $('#pubDesc').value.trim(),
    fotos: [...App.fotos],
    vip: (u.premium || u.rol === 'admin') ? ($('#pubVip').value || null) : null,
  };

  if (id) {
    const a = BD.articulos.find(x => x.id == id);
    Object.assign(a, datos);
    avisar('Publicación actualizada', 'ok');
  } else {
    const nuevo = {
      id: nuevoId(), usuario: u.id, ...datos, estado: 'disponible', reserva: null,
      destacado: !!u.premium, vistas: 0, favs: 0,
      lat: (u.lat || c[0]) + (Math.random() - .5) * .01,
      lon: (u.lon || c[1]) + (Math.random() - .5) * .01,
      creado: new Date().toISOString(),
    };
    nuevo.impulso = null;
    BD.articulos.unshift(nuevo);
    avisarNuevaPublicacion(nuevo, u);
    const pedidos = avisarDeseos(nuevo);         // ← "Quiero esto": aviso automático
    avisar(u.premium ? '¡Publicado y destacado por ser Premium!' : '¡Tu artículo fue publicado!', 'ok');
    if (pedidos) setTimeout(() => avisar(
      `🎯 ${pedidos} persona(s) estaban pidiendo justo esto. Ya les avisamos.`, 'ok'), 2600);
  }
  guardar();
  cerrar('mPublicar');
  App.fotos = [];
  pintarLista(); pintarCategorias(); pintarMapa(); pintarCuenta(); pintarPremium();
}

/* =====================================================================
   AVISOS DE INTERÉS (notificación + WhatsApp)
   ===================================================================== */

/* Guarda una notificación y, si corresponde, deja lista la alerta de WhatsApp */
function avisarConWA(uid, titulo, cuerpo, numero, mensajeWA) {
  const dest = usuario(uid);
  const wa = (numero && String(numero).replace(/\D/g, '').length >= 9)
    ? linkWA(numero, mensajeWA) : null;
  BD.notis.unshift({
    id: nuevoId(), usuario: uid, titulo, cuerpo, wa,
    leida: false, creado: new Date().toISOString(),
  });
  guardar();
  return wa;
}

/* Al subir una publicación se avisa al administrador y a quien la esté esperando */
function avisarNuevaPublicacion(art, dueno) {
  const cat = CATEGORIAS[art.categoria - 1][0];
  /* 1) el administrador se entera de todo lo que se publica */
  BD.usuarios.filter(x => x.rol === 'admin').forEach(a =>
    avisarConWA(a.id, '📦 Nueva publicación', `${dueno.nombre} publicó "${art.titulo}" en ${art.ciudad}.`,
      dueno.telefono, `Hola ${dueno.nombre}, vi tu publicación "${art.titulo}" en Truequea PE.`));

  /* 2) los Premium que siguen esa categoría o ciudad reciben aviso al instante */
  BD.usuarios.filter(x => x.premium && x.id !== dueno.id && x.avisos !== false).forEach(p => {
    const interesa = BD.favoritos.some(f => f.usuario === p.id &&
        (BD.articulos.find(a => a.id === f.articulo) || {}).categoria === art.categoria)
      || p.ciudad === art.ciudad;
    if (!interesa) return;
    avisarConWA(p.id, '⭐ Algo que te puede interesar',
      `${dueno.nombre} acaba de publicar "${art.titulo}" (${cat}) en ${art.ciudad}.`,
      dueno.telefono, `Hola ${dueno.nombre}, me interesa tu "${art.titulo}" que publicaste en Truequea PE.`);
  });
  guardar();
}

/* Alguien mostró interés en una publicación: avisa al dueño y al administrador */
function avisarInteres(art, interesado, detalle) {
  const dueno = usuario(art.usuario);
  if (!dueno) return null;
  const msg = `Hola ${dueno.nombre}, soy ${interesado.nombre} de Truequea PE. ` +
              `Me interesa tu publicación "${art.titulo}". ${detalle || ''}`.trim();
  const wa = avisarConWA(dueno.id, '🔥 Alguien está interesado',
    `${interesado.nombre} está interesado en "${art.titulo}". ${detalle || ''}`.trim(),
    interesado.telefono,
    `Hola ${interesado.nombre}, vi que te interesa mi "${art.titulo}" en Truequea PE.`);

  /* el administrador recibe copia si dejó activado el aviso */
  if (BD.config.avisoWhatsApp) {
    BD.usuarios.filter(x => x.rol === 'admin' && x.id !== dueno.id).forEach(a =>
      avisarConWA(a.id, '🔔 Interesado en una publicación',
        `${interesado.nombre} está interesado en "${art.titulo}" de ${dueno.nombre}.`,
        dueno.telefono, msg));
  }
  guardar();
  return dueno.telefono ? linkWA(dueno.telefono, msg) : null;
}

/* =====================================================================
   RESERVAS PREMIUM (hasta 24 horas)
   ===================================================================== */
function abrirReserva(artId) {
  const u = yo();
  if (!u) { cerrarTodo(); abrirAuth('login'); return avisar('Entra a tu cuenta'); }
  if (!u.premium) {
    cerrarTodo();
    return confirmar('Reservar es una función Premium',
      `Con Premium (S/ ${BD.config.precioPremium} al mes) apartas una publicación hasta ${RESERVA_MAX_MIN} minutos: mientras dure, nadie más puede proponer ni escribirle al dueño.`,
      () => irA('premium'), 'Ver Premium');
  }
  const a = BD.articulos.find(x => x.id == artId);
  if (!a) return;
  if (a.usuario === u.id) return avisar('Esa publicación es tuya');
  const res = reservaActiva(a);
  if (res && res.por !== u.id) return avisar('Otra persona ya la tiene apartada', 'err');

  $('#resArt').value = a.id;
  $('#resSub').textContent = `Vas a apartar "${a.titulo}". Mientras dure, los demás lo ven pero no pueden proponer, escribir ni marcar interés.`;
  $('#resHoras').innerHTML = RESERVA_OPCIONES.map(m =>
    `<option value="${m}" ${m === 60 ? 'selected' : ''}>${m === 60 ? '1 hora (máximo)' : m + ' minutos'}</option>`).join('');
  cerrar('mFicha'); abrir('mReserva');
}
function guardarReserva() {
  const u = yo(); if (!u || !u.premium) return;
  const a = BD.articulos.find(x => x.id == $('#resArt').value);
  if (!a) return;
  const min = Math.min(Number($('#resHoras').value) || 30, RESERVA_MAX_MIN);
  const hasta = new Date(Date.now() + min * 60000).toISOString();
  a.reserva = { por: u.id, desde: new Date().toISOString(), hasta, nota: $('#resNota').value.trim() };
  a.estado = 'reservado';
  guardar();

  const wa = avisarInteres(a, u, `La aparté por ${min} minutos. ${a.reserva.nota}`.trim());
  cerrar('mReserva'); $('#formReserva').reset();
  avisar(`Apartado ${min} minutos — solo tú puedes negociarlo ✔`, 'ok');
  if (wa) confirmar('Aviso al dueño', 'Ya le llegó la notificación. ¿Quieres escribirle por WhatsApp ahora?',
    () => window.open(wa, '_blank', 'noopener'), '💬 Abrir WhatsApp');
  pintarLista(); pintarMapa(); pintarPremium(); pintarNav();
}
function soltarReserva(artId) {
  const u = yo();
  const a = BD.articulos.find(x => x.id == artId);
  if (!a || !a.reserva) return;
  if (u.rol !== 'admin' && a.reserva.por !== u.id && a.usuario !== u.id)
    return avisar('Solo quien reservó puede soltarla', 'err');
  a.reserva = null;
  if (a.estado === 'reservado') a.estado = 'disponible';
  guardar(); avisar('Reserva liberada', 'ok');
  pintarLista(); pintarMapa(); pintarPremium(); cerrarTodo();
}

/* ---------------- ficha ---------------- */
function verArticulo(id) {
  const a = BD.articulos.find(x => x.id == id);
  if (!a) return;
  a.vistas = (a.vistas || 0) + 1; guardar();

  const d = usuario(a.usuario), r = reputacion(a.usuario), u = yo();
  const mio = u && u.id === a.usuario;
  const fotos = a.fotos && a.fotos.length ? a.fotos : [SIN_FOTO];

  const res = reservaActiva(a);
  const quienReserva = res ? usuario(res.por) : null;
  const miaLaReserva = res && u && res.por === u.id;
  const bloqueada = res && u && res.por !== u.id && a.usuario !== u.id;

  const cintaReserva = res ? `
    <div class="reserva-cinta">
      🔒 ${miaLaReserva ? 'La apartaste tú' : `Apartada por ${esc(quienReserva ? quienReserva.nombre : 'un Premium')}`}
      · quedan ${restanteTxt(res.hasta)}
      ${res.nota ? `<span style="font-weight:600">— “${esc(res.nota)}”</span>` : ''}
      ${(miaLaReserva || mio || (u && u.rol === 'admin'))
        ? `<button class="btn-t" style="margin-left:auto" data-soltar="${a.id}">Liberar</button>` : ''}
    </div>` : '';

  const bloqVip = bloqueadoPorVip(a, u);
  const interesados = interesadosDe(a).length;
  const imp = impulsoActivo(a);

  const acciones = mio ? `
    <div class="ficha-acc">
      <button class="btn suave sm" data-editar="${a.id}">✏️ Editar</button>
      <button class="btn pri sm" data-interesados="${a.id}">❤️ Ver interesados (${interesados})</button>
      ${imp ? `<span class="eti azul">🚀 Impulsado · ${restanteTxt(imp.hasta)}</span>`
            : `<button class="btn oro sm" data-impulsar="${a.id}">🚀 Impulsar por S/ ${Number(BD.config.precioImpulso).toFixed(2)}</button>`}
      ${a.estado !== 'intercambiado'
        ? `<button class="btn verde sm" data-estado="${a.id}|intercambiado">✓ Ya lo intercambié</button>`
        : `<button class="btn suave sm" data-estado="${a.id}|disponible">↩ Volver a publicar</button>`}
      <button class="btn rojo sm" data-borrar="${a.id}">🗑 Eliminar</button>
    </div>` : `
    <div class="ficha-acc">
      ${bloqVip
        ? `<div class="aviso mora" style="width:100%">💎 Vitrina VIP: puedes mirarla, pero solo los
             Premium proponen aquí. <button class="btn mora sm" data-accion="premium">Hazte Premium</button></div>`
        : bloqueada
        ? `<div class="aviso mora" style="width:100%">🔒 Un Premium la tiene apartada por
             ${restanteTxt(res.hasta)}. Puedes verla, pero no proponer ni escribir hasta que se libere.
             <button class="btn mora sm" data-accion="premium">Yo también quiero apartar</button></div>`
        : `${a.estado === 'disponible' || miaLaReserva
              ? `<button class="btn pri" data-proponer="${a.id}">🔁 Proponer trueque</button>` : ''}
           <button class="btn sec" data-interes="${a.id}">🔥 Me interesa</button>
           <button class="btn sec" data-chat="${a.id}">💬 Enviar mensaje</button>
           ${!res && a.estado === 'disponible'
             ? `<button class="btn mora sm" data-reservar="${a.id}">🔒 Apartar 1 h${u && u.premium ? '' : ' (Premium)'}</button>` : ''}`}
      ${a.lat ? `<a class="btn suave sm" target="_blank" rel="noopener"
         href="https://www.google.com/maps?q=${a.lat},${a.lon}">🗺️ Ver en Google Maps</a>` : ''}
    </div>`;

  $('#ficha').innerHTML = `
    <img class="ficha-img" id="fichaFoto" src="${fotos[0]}" alt="${esc(a.titulo)}">
    ${fotos.length > 1 ? `<div class="ficha-gal">${fotos.map((f, i) =>
      `<img src="${f}" class="${i === 0 ? 'on' : ''}" data-foto="${i}" alt="Foto ${i + 1}">`).join('')}</div>` : ''}
    <div class="ficha-cuerpo">
      <h2>${esc(a.titulo)}</h2>
      <div class="ficha-meta">
        <span>${CATEGORIAS[a.categoria - 1][1]} ${CATEGORIAS[a.categoria - 1][0]}</span>
        <span class="eti gris">${CONDICIONES[a.condicion]}</span>
        <span>📍 ${esc(a.ciudad)}</span><span>👁 ${a.vistas}</span>
        <span>🕓 ${fechaTxt(a.creado)}</span>
        <span class="eti ${a.estado === 'disponible' ? 'azul' : a.estado === 'reservado' ? 'oro' : 'verde'}">${a.estado}</span>
        ${a.destacado ? '<span class="eti oro">⭐ Destacado</span>' : ''}
        ${a.vip ? `<span class="eti mora">💎 VIP · ${esc(a.vip)}</span>` : ''}
        ${impulsoActivo(a) ? '<span class="eti azul">🚀 Impulsado</span>' : ''}
        <span class="eti roja" style="background:var(--rojo2)">❤️ ${interesadosDe(a).length} interesados</span>
        ${u && u.premium && u.lat && a.lat
          ? `<span class="eti mora">📍 ${distanciaTxt(distanciaKm(u.lat, u.lon, a.lat, a.lon))} de ti</span>` : ''}
      </div>
      ${cintaReserva}
      <div class="ficha-b"><h5>Descripción</h5><p>${esc(a.desc) || 'Sin descripción.'}</p></div>
      <div class="ficha-b"><h5>Busca a cambio</h5><p>🔁 ${esc(a.busca)}</p></div>
      <div class="ficha-dueno">
        ${avatarHTML(d, 'av-g')}
        <div style="flex:1;min-width:170px">
          <b style="font-size:15px">${esc(d.nombre)} ${d.premium ? '<span class="pro-badge">PREMIUM</span>' : ''}</b>
          <div class="estrellas">${estrellas(r.prom)}<span class="n">${r.prom.toFixed(1)} · ${r.total} reseñas · ${truequesDe(d.id)} trueques</span></div>
          <div style="font-size:13px;color:var(--sub);margin-top:3px">📍 ${esc(d.ciudad)}${d.telefono ? ' · 📞 ' + esc(d.telefono) : ''}</div>
        </div>
        <button class="btn suave sm" data-perfil="${d.id}">Ver perfil</button>
      </div>
      ${cajaConfianza(d, a)}
      ${acciones}
    </div>`;
  abrir('mFicha');
}

/* ---------------- trueques ---------------- */
function abrirPropuesta(artId) {
  const u = yo();
  if (!u) { cerrarTodo(); abrirAuth('login'); return avisar('Entra para proponer un trueque'); }
  const a = BD.articulos.find(x => x.id == artId);
  if (!puedeInteractuar(a)) return;
  const mios = BD.articulos.filter(x => x.usuario === u.id && x.estado === 'disponible');
  $('#propArt').value = artId;
  $('#propOfrezco').innerHTML = '<option value="">— Solo mensaje, sin ofrecer artículo —</option>' +
    mios.map(m => `<option value="${m.id}">${esc(m.titulo)}</option>`).join('');
  $('#propSub').textContent = `Quieres "${a.titulo}". ${mios.length ? 'Elige qué ofreces a cambio y te decimos si el cambio se ve parejo.' : 'Aún no tienes artículos publicados: puedes enviar solo un mensaje.'}`;
  pintarAnalisisPropuesta();
  cerrar('mFicha'); abrir('mPropuesta');
}

/* Semáforo "¿estoy haciendo un buen trueque?" dentro de la propuesta */
function pintarAnalisisPropuesta() {
  const u = yo();
  const recibo = BD.articulos.find(x => x.id == $('#propArt').value);
  const ofrezcoId = Number($('#propOfrezco').value) || null;
  const doy = ofrezcoId ? BD.articulos.find(x => x.id === ofrezcoId) : null;
  $('#analisisProp').innerHTML = tarjetaAnalisis(analizarTrueque(doy, recibo), doy, recibo, !!(u && u.premium));
}

/* Tarjeta del análisis: básica para todos, completa para Premium */
function tarjetaAnalisis(an, doy, recibo, pro) {
  const emo = { verde:'🟢', amarillo:'🟡', rojo:'🔴' }[an.nivel];
  const barra = (t, v, sufijo = '') => `
    <div class="med-fila"><span>${t}</span>
      <div class="med-pista"><i style="width:${Math.max(3, Math.min(v, 100))}%"></i></div>
      <b>${nivelTexto(v)}${sufijo}</b></div>`;
  return `<div class="analisis ${an.nivel}">
    <div class="an-cab"><b>${emo} ${esc(an.titulo)}</b></div>
    <div class="an-par">
      <div><small>Tú entregas</small><b>${esc(doy ? doy.titulo : 'Solo un mensaje')}</b></div>
      <span class="fl">⇄</span>
      <div><small>Recibes</small><b>${esc(recibo ? recibo.titulo : '—')}</b></div>
    </div>
    <p class="an-consejo">${esc(an.consejo)}</p>
    ${pro ? `
      <div class="an-pro">
        <span class="eti mora">💜 Análisis Premium</span>
        <div class="med-fila"><span>💰 Referencia del sistema</span>
          <div class="med-pista"><i style="width:${Math.min(an.ratio * 50, 100)}%"></i></div>
          <b>${doy ? 'S/ ' + an.vDoy + ' ⇄ S/ ' + an.vRec : 'S/ ' + an.vRec}</b></div>
        ${barra('📊 Demanda de lo que recibes', an.demanda * 4)}
        ${barra('🔥 Popularidad', an.popularidad)}
        ${barra('📈 Facilidad para volver a cambiarlo', an.facilidad)}
        <p class="nota">La referencia es interna y aproximada: sirve para comparar, no es un precio
          de venta. En Truequea PE no se vende nada.</p>
      </div>`
    : `<div class="an-candado">
        <b>💜 Con Premium ves el análisis completo</b>
        <span>Valor de referencia, demanda, popularidad y qué tan fácil es volver a cambiarlo.</span>
        <button class="btn mora sm" type="button" data-accion="premium">Ver Premium</button>
      </div>`}
  </div>`;
}
function enviarPropuesta() {
  const u = yo(); if (!u) return;
  const artId = Number($('#propArt').value);
  const a = BD.articulos.find(x => x.id === artId);
  const x = {
    id: nuevoId(), de: u.id, para: a.usuario, pido: artId,
    ofrezco: Number($('#propOfrezco').value) || null,
    mensaje: $('#propMsg').value.trim(), estado: 'pendiente',
    checkA: false, checkB: false, lugar: '', fecha: '',
    creado: new Date().toISOString(),
  };
  BD.intercambios.unshift(x); guardar();
  const wa = avisarInteres(a, u, x.mensaje ? `Mensaje: "${x.mensaje}"` : 'Te envié una propuesta de trueque.');
  cerrar('mPropuesta'); $('#formPropuesta').reset();
  avisar('Propuesta enviada', 'ok');
  if (wa) confirmar('Propuesta enviada', 'Ya le llegó la notificación dentro de la app. ¿Le escribes también por WhatsApp?',
    () => window.open(wa, '_blank', 'noopener'), '💬 Abrir WhatsApp');
  pintarNav(); pintarCuenta();
}

/* =====================================================================
   ¿Puedo interactuar con esta publicación?
   · Si un Premium la tiene reservada, los demás solo la ven.
   · Si es de la vitrina VIP, solo participan los Premium.
   ===================================================================== */
function puedeInteractuar(a, avisando = true) {
  const u = yo();
  if (!u) { cerrarTodo(); abrirAuth('login'); if (avisando) avisar('Entra a tu cuenta'); return false; }
  if (bloqueadoPorReserva(a, u)) {
    const r = reservaActiva(a);
    const quien = usuario(r.por);
    cerrarTodo();
    confirmar('Publicación apartada',
      `${quien ? quien.nombre : 'Un usuario'} Premium la tiene reservada y quedan ${restanteTxt(r.hasta)}. ` +
      `Puedes verla, pero no proponer ni escribirle al dueño hasta que se libere. ` +
      `Con Premium tú también puedes apartar lo que te interesa.`,
      () => irA('premium'), 'Ver Premium');
    return false;
  }
  if (bloqueadoPorVip(a, u)) {
    cerrarTodo();
    confirmar('💎 Trueques VIP',
      `Esta vitrina es exclusiva: solo los Premium publican y proponen aquí. ` +
      `Puedes mirar todo, pero para negociar necesitas Premium (S/ ${BD.config.precioPremium} al mes).`,
      () => irA('premium'), 'Hazte Premium');
    return false;
  }
  return true;
}

/* Botón "Me interesa": avisa al dueño al instante */
function marcarInteres(artId) {
  const u = yo();
  if (!u) { cerrarTodo(); abrirAuth('login'); return avisar('Entra para avisar tu interés'); }
  const a = BD.articulos.find(x => x.id == artId);
  if (!a) return;
  if (a.usuario === u.id) return avisar('Esa publicación es tuya');
  if (!puedeInteractuar(a)) return;

  /* queda guardado en favoritos para poder seguirlo */
  if (!BD.favoritos.some(f => f.usuario === u.id && f.articulo === a.id))
    BD.favoritos.push({ usuario: u.id, articulo: a.id });
  a.favs = (a.favs || 0) + 1;
  guardar();

  const wa = avisarInteres(a, u, 'Marqué "me interesa" en tu publicación.');
  avisar('Le avisamos al dueño que te interesa 🔥', 'ok');
  if (wa) confirmar('Aviso enviado', `${usuario(a.usuario).nombre} ya recibió la notificación. ¿Le escribes por WhatsApp?`,
    () => window.open(wa, '_blank', 'noopener'), '💬 Abrir WhatsApp');
  pintarLista(); pintarNav(); pintarPremium();
}
function responderPropuesta(id, respuesta) {
  const x = BD.intercambios.find(i => i.id == id);
  const a = BD.articulos.find(t => t.id === x.pido);
  const de = usuario(x.de);
  if (respuesta === 'aceptar') {
    x.estado = 'aceptado';
    a.estado = 'reservado';
    if (x.ofrezco) { const o = BD.articulos.find(t => t.id === x.ofrezco); if (o) o.estado = 'reservado'; }
    BD.intercambios.filter(i => i.pido === x.pido && i.id !== x.id && i.estado === 'pendiente')
      .forEach(i => i.estado = 'rechazado');
    notificar(x.de, '¡Tu propuesta fue aceptada!', `Coordina la entrega de "${a.titulo}" por el chat.`);
    avisar('Propuesta aceptada — ahora coordinen el encuentro', 'ok');
    abrirChatCon(x.de, x.pido);
  } else {
    x.estado = 'rechazado';
    notificar(x.de, 'Propuesta rechazada', `Tu propuesta por "${a.titulo}" fue rechazada.`);
    avisar('Propuesta rechazada');
  }
  guardar(); pintarCuenta(); pintarLista(); pintarNav();
}
function verTrueque(id) {
  const x = BD.intercambios.find(i => i.id == id), u = yo();
  const pido = BD.articulos.find(a => a.id === x.pido);
  const ofrezco = x.ofrezco ? BD.articulos.find(a => a.id === x.ofrezco) : null;
  const soyDe = x.de === u.id;
  const otro = usuario(soyDe ? x.para : x.de);
  const miCheck = soyDe ? x.checkA : x.checkB;
  const suCheck = soyDe ? x.checkB : x.checkA;

  $('#detTrueque').innerHTML = `
    <h2>Trueque con ${esc(otro.nombre)}</h2>
    <p class="sub">Estado: <span class="eti oro">${x.estado}</span></p>
    <div class="fila">
      <div class="par">
        <img src="${foto(pido)}" alt=""><span class="fl">⇄</span>
        <img src="${ofrezco ? foto(ofrezco) : SIN_FOTO}" alt="">
      </div>
      <div class="fila-info">
        <b>${esc(pido.titulo)} ⇄ ${esc(ofrezco ? ofrezco.titulo : 'solo mensaje')}</b>
        ${x.mensaje ? `<span>💬 "${esc(x.mensaje)}"</span>` : ''}
      </div>
    </div>
    <div class="tarjeta">
      <h3>📍 Punto de encuentro</h3>
      <p class="nota">Elige un lugar público. Estas son las zonas seguras sugeridas.</p>
      <div class="dos">
        <div><label class="et" for="tqLugar">Lugar</label>
          <select class="campo" id="tqLugar">
            <option value="">Otro lugar</option>
            ${ZONAS_SEGURAS.map(z => `<option ${x.lugar === z.nombre ? 'selected' : ''}>${esc(z.nombre)}</option>`).join('')}
          </select></div>
        <div><label class="et" for="tqFecha">Fecha y hora</label>
          <input class="campo" type="datetime-local" id="tqFecha" value="${x.fecha || ''}"></div>
      </div>
      <button class="btn pri sm" data-encuentro="${x.id}">Guardar encuentro</button>
    </div>
    <div class="tarjeta">
      <h3>✅ Confirmación de entrega</h3>
      <p class="nota">El trueque se cierra cuando los dos confirman.</p>
      <div class="checklist">
        <label><input type="checkbox" id="tqCheck" ${miCheck ? 'checked' : ''}> Ya entregué y recibí mi parte</label>
      </div>
      <p class="nota">${esc(otro.nombre)}: ${suCheck ? '✅ ya confirmó' : '⏳ todavía no confirma'}</p>
      <button class="btn pri sm" data-confirmar-tq="${x.id}">Guardar mi confirmación</button>
    </div>
    <div class="tarjeta">
      <h3>🛡️ Trueque Seguro ${x.seguro ? '<span class="eti verde">activo</span>' : ''}</h3>
      ${x.seguro
        ? `<p class="nota">El administrador está acompañando este trueque. Háganlo en una zona
             segura y confirmen los dos para que quede verificado.</p>`
        : `<p class="nota">Por S/ ${Number(BD.config.precioSeguro).toFixed(2)} revisamos a la otra
             persona y sus fotos, exigimos zona segura y damos el visto bueno al final.</p>
           <button class="btn mora sm" data-seguro="${x.id}">🛡️ Contratar Trueque Seguro</button>`}
      ${cajaConfianza(otro, pido)}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn sec sm" data-analizar="${x.id}">📈 ¿Es un buen trueque?</button>
      <button class="btn sec sm" data-chat-usuario="${otro.id}|${x.pido}">💬 Abrir chat</button>
      <button class="btn rojo sm" data-cancelar-tq="${x.id}">Cancelar trueque</button>
    </div>`;
  abrir('mTrueque');
}
function confirmarTrueque(id) {
  const x = BD.intercambios.find(i => i.id == id), u = yo();
  const soyDe = x.de === u.id;
  const val = $('#tqCheck').checked;
  if (soyDe) x.checkA = val; else x.checkB = val;

  if (x.checkA && x.checkB) {
    x.estado = 'completado'; x.completado = new Date().toISOString();
    [x.pido, x.ofrezco].filter(Boolean).forEach(id2 => {
      const a = BD.articulos.find(t => t.id === id2); if (a) a.estado = 'intercambiado';
    });
    [x.de, x.para].forEach(uid => {
      const us = usuario(uid); if (us) { us.puntos = (us.puntos || 0) + 20; }
      notificar(uid, '¡Trueque completado!', 'Ya puedes calificar a la otra persona.');
    });
    guardar();
    cerrar('mTrueque');
    $('#calId').value = x.id;
    $('#calSub').textContent = `¿Cómo te fue con ${usuario(soyDe ? x.para : x.de).nombre}?`;
    App.puntaje = 0; pintarEstrellas(0);
    abrir('mCalificar');
    avisar('¡Trueque completado!', 'ok');
  } else {
    guardar();
    notificar(soyDe ? x.para : x.de, 'Avance en el trueque', `${u.nombre} confirmó su parte.`);
    avisar('Confirmación guardada. Falta la otra parte.', 'ok');
    verTrueque(id);
  }
  pintarCuenta(); pintarLista(); pintarNav();
}
function pintarEstrellas(v) {
  $$('#estEleg button').forEach(b => b.classList.toggle('on', Number(b.dataset.v) <= v));
}

/* ---------------- chat ---------------- */
/* Análisis de una propuesta que me llegó, antes de aceptarla */
function analizarPropuesta(trqId) {
  const u = yo(), x = BD.intercambios.find(i => i.id == trqId);
  if (!x || !u) return;
  const soyDe = x.de === u.id;
  const pido = BD.articulos.find(a => a.id === x.pido);
  const ofr = x.ofrezco ? BD.articulos.find(a => a.id === x.ofrezco) : null;
  /* si soy el dueño, yo entrego lo que me piden y recibo lo que ofrecen */
  const doy = soyDe ? ofr : pido;
  const recibo = soyDe ? pido : ofr;
  const otro = usuario(soyDe ? x.para : x.de);
  $('#analisisCuerpo').innerHTML = `
    <h2>📈 ¿Estoy haciendo un buen trueque?</h2>
    <p class="sub">Con ${esc(otro ? otro.nombre : '—')}</p>
    ${tarjetaAnalisis(analizarTrueque(doy, recibo), doy, recibo, !!u.premium)}
    ${cajaConfianza(otro, soyDe ? pido : ofr)}
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
      ${x.estado === 'pendiente' && !soyDe ? `
        <button class="btn verde" data-resp="${x.id}|aceptar">✓ Aceptar igual</button>
        <button class="btn rojo" data-resp="${x.id}|rechazar">✕ Rechazar</button>` : ''}
      <button class="btn sec" data-chat-usuario="${otro ? otro.id : 0}|${x.pido}">💬 Negociar por chat</button>
    </div>`;
  cerrarTodo(); abrir('mAnalisis');
}

function abrirChatCon(otroId, artId) {
  const u = yo();
  if (!u) { abrirAuth('login'); return; }
  if (otroId === u.id) return avisar('Ese artículo es tuyo');
  const art = BD.articulos.find(a => a.id == artId);
  if (art && art.usuario !== u.id && !puedeInteractuar(art)) return;
  let c = BD.chats.find(x => x.usuarios.includes(u.id) && x.usuarios.includes(otroId) && x.articulo === artId);
  if (!c) {
    c = { id: nuevoId(), usuarios: [u.id, otroId], articulo: artId, creado: new Date().toISOString() };
    BD.chats.push(c); guardar();
  }
  App.chat = c.id;
  pintarChat();
  cerrarTodo();
  abrir('mChat');
}
function pintarChat() {
  const u = yo(), c = BD.chats.find(x => x.id === App.chat);
  if (!c) return;
  const otro = usuario(c.usuarios.find(i => i !== u.id));
  const art = BD.articulos.find(a => a.id === c.articulo);
  const pro = !!(u && u.premium);

  BD.mensajes.filter(m => m.chat === c.id && m.de !== u.id).forEach(m => m.leido = true);
  guardar();

  const km = pro && u.lat && otro.lat ? distanciaTxt(distanciaKm(u.lat, u.lon, otro.lat, otro.lon)) : '';
  $('#chatCab').innerHTML = `${avatarHTML(otro, 'av-g')}
    <div style="flex:1"><b>${esc(otro.nombre)} ${otro.premium ? '💜' : ''}
      ${pro ? '<span class="eti mora">CHAT PREMIUM</span>' : ''}</b>
      <small style="color:var(--sub)">${art ? esc(art.titulo) : 'Conversación'} · 📍 ${esc(otro.ciudad)}${km ? ' · ' + km : ''}</small></div>
    ${otro.telefono ? `<a class="wa" target="_blank" rel="noopener"
      href="${esc(linkWA(otro.telefono, `Hola ${otro.nombre}, te escribo por Truequea PE${art ? ' sobre "' + art.titulo + '"' : ''}.`))}">💬</a>` : ''}`;

  /* barra Premium: frases rápidas y buscador dentro de la conversación */
  $('#chatPro').hidden = !pro;
  $('#chatClip').hidden = !pro;
  if (pro && !$('#chatFrases').dataset.listo) {
    $('#chatFrases').innerHTML = FRASES_PRO.map(f =>
      `<button type="button" data-frase="${esc(f)}">${esc(f)}</button>`).join('');
    $('#chatFrases').dataset.listo = '1';
  }

  const q = pro ? ($('#chatBuscar').value || '').trim().toLowerCase() : '';
  let msgs = BD.mensajes.filter(m => m.chat === c.id);
  if (q) msgs = msgs.filter(m => (m.texto || '').toLowerCase().includes(q));

  const resaltar = t => {
    const s = esc(t);
    if (!q) return s;
    return s.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
  };

  const cuerpo = $('#chatCuerpo');
  cuerpo.innerHTML = msgs.length
    ? msgs.map(m => `<div class="burb ${m.de === u.id ? 'mia' : 'suya'}">
        ${m.texto ? resaltar(m.texto) : ''}
        ${m.foto ? `<img src="${m.foto}" alt="Foto enviada" data-verfoto="${m.id}">` : ''}
        <time>${fechaTxt(m.creado)}${m.de === u.id ? (m.leido ? ' ✓✓' : ' ✓') : ''}</time></div>`).join('')
    : `<p style="margin:auto;text-align:center;color:var(--sub);font-size:14px">
        ${q ? 'No hay mensajes con esa palabra.' : 'Todavía no hay mensajes.<br>Escribe para empezar el trueque 👇'}</p>`;
  if (!q) cuerpo.scrollTop = cuerpo.scrollHeight;
  pintarNav();
}

/* Enviar mensaje (texto o foto en el chat Premium) */
function enviarMensaje(texto, foto) {
  const u = yo();
  if (!u || !App.chat) return;
  if (!texto && !foto) return;
  BD.mensajes.push({ id: nuevoId(), chat: App.chat, de: u.id, texto: texto || '',
                     foto: foto || null, leido: false, creado: new Date().toISOString() });
  const c = BD.chats.find(x => x.id === App.chat);
  const otroId = c.usuarios.find(i => i !== u.id);
  const otro = usuario(otroId);
  const art = BD.articulos.find(a => a.id === c.articulo);
  /* si el otro es Premium, el aviso incluye el enlace de WhatsApp listo */
  if (otro && otro.premium && otro.avisos !== false)
    avisarConWA(otroId, '💬 Nuevo mensaje de ' + u.nombre, (texto || '📷 Te envió una foto').slice(0, 90),
      u.telefono, `Hola ${u.nombre}, te respondo por lo de Truequea PE${art ? ' ("' + art.titulo + '")' : ''}.`);
  else
    notificar(otroId, 'Nuevo mensaje de ' + u.nombre, (texto || '📷 Te envió una foto').slice(0, 90));
  guardar();
  pintarChat();
}
function listaChats() {
  const u = yo();
  if (!u) { abrirAuth('login'); return; }
  const mios = BD.chats.filter(c => c.usuarios.includes(u.id));
  $('#listaChats').innerHTML = mios.length ? mios.map(c => {
    const otro = usuario(c.usuarios.find(i => i !== u.id));
    const art = BD.articulos.find(a => a.id === c.articulo);
    const ms = BD.mensajes.filter(m => m.chat === c.id);
    const ultimo = ms[ms.length - 1];
    const sinLeer = ms.filter(m => m.de !== u.id && !m.leido).length;
    return `<div class="fila" data-abrirchat="${c.id}">
      <img src="${art ? foto(art) : SIN_FOTO}" alt="">
      <div class="fila-info"><b>${esc(otro.nombre)}</b>
        <span>${esc(art ? art.titulo : 'Artículo eliminado')}</span>
        <span>${ultimo ? esc(ultimo.texto) : 'Sin mensajes'}</span></div>
      <div style="text-align:right">${sinLeer ? `<span class="mini-glob">${sinLeer}</span>` : ''}
        <div style="font-size:12px;color:var(--sub);margin-top:4px">${ultimo ? relativo(ultimo.creado) : ''}</div></div>
    </div>`;
  }).join('') : `<div class="vacio"><div class="em">💬</div><p>No tienes conversaciones.<br>Abre un artículo y pulsa "Enviar mensaje".</p></div>`;
  abrir('mMensajes');
}

/* ---------------- premium ---------------- */
function pintarPremium() {
  const c = BD.config, u = yo();
  $('#yapeQr').innerHTML = c.yapeQr
    ? `<img class="yape-qr" src="${c.yapeQr}" alt="QR de Yape">`
    : `<div class="yape-vacio">El administrador todavía no subió el QR de Yape.<br><br>
        Puedes yapear al número indicado.</div>`;
  $('#yapeNombre').textContent = c.yapeNombre || 'Angel Levano';
  $('#yapeTel').textContent = c.yapeNumero ? '· ' + c.yapeNumero : '';
  $$('.pro-precio').forEach(e => e.innerHTML = `S/ ${Number(c.precioPremium).toFixed(2)} <small>/ mes</small>`);
  $('#pagoMonto').textContent = Number(c.precioPremium).toFixed(2);

  const caja = $('#estadoPago');
  $('#panelPro').hidden = !(u && u.premium);
  if (u && u.premium) pintarPanelPro();

  if (!u) { caja.innerHTML = '<div class="aviso">Entra a tu cuenta para comprar Premium.</div>'; return; }
  if (u.premium) {
    caja.innerHTML = `<div class="exito-c">💜 <b>Ya eres Premium.</b>
      ${u.premiumHasta ? 'Vence el ' + fechaTxt(u.premiumHasta) : ''}</div>`;
    return;
  }
  const pago = BD.pagos.find(p => p.usuario === u.id && p.estado === 'pendiente');
  caja.innerHTML = pago
    ? `<div class="aviso mora">⏳ Tu comprobante está en revisión. Te avisamos apenas se apruebe.</div>`
    : '';
}
/* Panel exclusivo del usuario Premium: mapa, cercanía, reservas y avisos */
function pintarPanelPro() {
  const u = yo();
  if (!u || !u.premium) return;
  liberarReservas();
  pintarMapaPro();

  /* lo más cerca de ti */
  const cerca = articulosPro().slice(0, 8);
  $('#cercaPro').innerHTML = cerca.length ? cerca.map(a => {
    const d = usuario(a.usuario);
    return `<div class="pro-fila">
      <img src="${foto(a)}" alt="" data-art="${a.id}" style="cursor:pointer">
      <div class="info"><b>${esc(a.titulo)}</b>
        <span>📍 ${esc(a.ciudad)} · ${esc(d ? d.nombre : '—')} · 🕓 ${relativo(a.creado)}</span></div>
      <span class="dist">${a.km !== null ? distanciaTxt(a.km) : 'sin ubicación'}</span>
      <button class="btn-t" data-art="${a.id}">Ver</button>
    </div>`;
  }).join('') : `<p class="nota">${u.lat ? 'No hay publicaciones dentro de ese radio.'
      : 'Marca tu ubicación en Mi cuenta → Perfil para ordenar por cercanía.'}</p>`;

  /* mis reservas */
  const mias = BD.articulos.filter(a => reservaActiva(a) && a.reserva.por === u.id);
  $('#reservasPro').innerHTML = mias.length ? mias.map(a => `
    <div class="pro-fila">
      <img src="${foto(a)}" alt="">
      <div class="info"><b>${esc(a.titulo)}</b>
        <span>🔒 Vence en ${restanteTxt(a.reserva.hasta)} · ${fechaTxt(a.reserva.hasta)}</span></div>
      <button class="btn-t" data-art="${a.id}">Ver</button>
      <button class="btn-t rojo" data-soltar="${a.id}">Liberar</button>
    </div>`).join('') : `<p class="nota">No tienes nada apartado. Entra a una publicación y toca
      “🔒 Reservar”.</p>`;

  /* lo que sigo */
  const sigo = BD.favoritos.filter(f => f.usuario === u.id)
    .map(f => BD.articulos.find(a => a.id === f.articulo)).filter(Boolean);
  $('#seguidosPro').innerHTML = sigo.length ? `
    <p class="nota">Te avisamos apenas cambie algo en lo que sigues:</p>
    ${sigo.map(a => `<div class="pro-fila">
      <img src="${foto(a)}" alt="">
      <div class="info"><b>${esc(a.titulo)}</b>
        <span>${reservaActiva(a) ? '🔒 apartado' : a.estado === 'intercambiado' ? '✓ ya se intercambió' : '✔ disponible'}
          · 📍 ${esc(a.ciudad)}</span></div>
      <button class="btn-t" data-art="${a.id}">Ver</button>
    </div>`).join('')}` : `<p class="nota">Toca “🔥 Me interesa” o el corazón de una publicación
      y aquí verás su estado.</p>`;

  pintarDeseos();
  if (typeof mapaRealPro === 'function') mapaRealPro();
  if (typeof pintarPlusPro === 'function') pintarPlusPro();

  const chk = $('#proAvisos');
  if (chk) chk.checked = u.avisos !== false;
}

async function enviarPago() {
  const u = yo();
  if (!u) { abrirAuth('login'); return; }
  if (!App.fotoPago) return avisar('Sube la captura del Yape', 'err');

  const tipo = App.pagoTipo || 'premium';
  const datos = App.pagoDatos || {};
  const monto = tipo === 'premium' ? Number(BD.config.precioPremium) : Number(datos.monto || 1);
  const nombre = { premium:'Premium', impulso:'Impulso de publicación', seguro:'Trueque Seguro' }[tipo];

  const pago = {
    id: nuevoId(), usuario: u.id, monto, tipo,
    articulo: datos.articulo || null, horas: datos.horas || null,
    intercambio: datos.intercambio || null,
    captura: App.fotoPago, nota: $('#pagoNota').value.trim(),
    estado: 'pendiente', creado: new Date().toISOString(), auto: false,
  };
  BD.pagos.unshift(pago);
  guardar();

  /* ---- lectura automática de la captura de Yape ---- */
  let aprobadoSolo = false;
  if (BD.config.autoYape !== false) {
    const btn = $('#formPago button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = '🔎 Leyendo tu comprobante...'; }
    estadoLectura('<b>🔎 Leyendo la captura...</b><span>Esto demora unos segundos la primera vez.</span>', 'cargando');

    const r = await revisarComprobante(pago.captura, monto);

    if (r && r.disponible) {
      pago.ocr = { monto: r.monto, codigo: r.codigo, motivos: r.motivos, texto: r.texto };
      if (r.ok) {
        BD.config.yapeCodigos = [...(BD.config.yapeCodigos || []), r.codigo].slice(-500);
        guardar();
        estadoLectura(`<b>✅ Pago verificado automáticamente</b>
          <span>Leímos S/ ${Number(r.monto).toFixed(2)} a ${esc(BD.config.yapeNombre)} ·
          operación ${esc(r.codigo)}</span>`, 'ok');
        pago.auto = true;
        resolverPago(pago.id, true);
        aprobadoSolo = true;
      } else {
        estadoLectura(`<b>🟡 No pudimos confirmarlo solos</b>
          <span>${r.motivos.map(esc).join(' ')} El administrador lo revisará a mano.</span>`, 'medio');
      }
    } else {
      estadoLectura('<b>📨 Comprobante enviado</b><span>El administrador lo revisará a mano.</span>', 'medio');
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar comprobante'; }
  }

  if (!aprobadoSolo) {
    BD.usuarios.filter(x => x.rol === 'admin').forEach(a =>
      notificar(a.id, `Nuevo comprobante · ${nombre}`,
        `${u.nombre} envió un pago de S/ ${monto.toFixed(2)}.`));
    guardar();
    avisar('Comprobante enviado. El administrador lo revisará.', 'ok');
  }

  App.fotoPago = null; App.pagoDatos = null; App.pagoTipo = 'premium';
  $('#formPago').reset();
  $('#zonaPago').textContent = '📸 Clic para subir la captura del Yape';
  setTimeout(() => { cerrar('mPago'); const c = $('#lecturaYape'); if (c) c.hidden = true; },
             aprobadoSolo ? 2400 : 3600);
  pintarPremium(); pintarCuenta();
}

function resolverPago(id, aprobar) {
  const p = BD.pagos.find(x => x.id == id);
  if (!p) return;
  const u = usuario(p.usuario);
  const tipo = p.tipo || 'premium';
  p.estado = aprobar ? 'aprobado' : 'rechazado';
  p.resuelto = new Date().toISOString();

  if (aprobar && u && tipo === 'premium') {
    const hasta = new Date(); hasta.setMonth(hasta.getMonth() + 1);
    u.premium = true; u.premiumHasta = hasta.toISOString();
    BD.articulos.filter(a => a.usuario === u.id).forEach(a => a.destacado = true);
    u.impulsosGratis = 3; u.proMes = new Date().toISOString().slice(0, 7);
    u.verificado = true;
    notificar(u.id, '👑 ¡Premium activado!',
      (p.auto ? 'Tu Yape se verificó solo. ' : '') +
      'Ya puedes apartar publicaciones, entrar a la vitrina VIP, pedir con “Quiero esto”, ver quién está interesado y tienes 3 impulsos gratis este mes.');
  } else if (aprobar && tipo === 'impulso') {
    const a = BD.articulos.find(x => x.id === p.articulo);
    if (a) {
      a.impulso = { desde: new Date().toISOString(),
                    hasta: new Date(Date.now() + (p.horas || 24) * 3600000).toISOString(),
                    pago: p.id };
      notificar(p.usuario, '🚀 ¡Publicación impulsada!',
        `"${a.titulo}" aparece entre los primeros por ${p.horas || 24} horas.`);
    }
  } else if (aprobar && tipo === 'seguro') {
    const x = BD.intercambios.find(i => i.id === p.intercambio);
    if (x) {
      x.seguro = { pago: p.id, estado: 'activo', desde: new Date().toISOString() };
      BD.seguros.unshift({ id: nuevoId(), intercambio: x.id, pago: p.id,
        solicitante: p.usuario, estado: 'activo', creado: new Date().toISOString() });
      [x.de, x.para].forEach(uid => notificar(uid, '🛡️ Trueque Seguro activado',
        'El administrador acompaña este trueque. Encuéntrense en una zona segura y confirmen los dos.'));
    }
  } else if (u) {
    notificar(u.id, 'Comprobante rechazado', 'No pudimos validar tu pago. Súbelo otra vez o escríbenos.');
  }
  guardar();
  avisar(aprobar ? (p.auto ? '👑 ¡Premium activado automáticamente!' : 'Pago aprobado ✔')
                 : 'Comprobante rechazado', aprobar ? 'ok' : '');
  aplicarPlan();
  pintarAdmin(); pintarLista(); pintarCuenta();
}

/* =====================================================================
   PUBLICIDAD: solicitud del negocio y aprobación del administrador
   ===================================================================== */
function enviarSolicitud() {
  const negocio = $('#solNegocio').value.trim();
  const quien   = $('#solNombre').value.trim();
  const tel     = $('#solTel').value.trim();
  const desc    = $('#solDesc').value.trim();
  if (!negocio || !quien || !tel || !desc) return avisar('Completa los datos del anuncio', 'err');

  BD.anuncios.unshift({
    id: nuevoId(), titulo: negocio, desc, empresa: 'Solicitud de ' + quien,
    img: App.fotoSolicitud || null, tel, wa: linkWA(tel, `Hola, te escribo desde Truequea PE.`),
    web: $('#solWeb').value.trim(), destacado: false, activo: true,
    estado: 'pendiente', solicitante: quien, vistas: 0, clics: 0,
    creado: new Date().toISOString(),
  });
  guardar();

  BD.usuarios.filter(x => x.rol === 'admin').forEach(a =>
    avisarConWA(a.id, '📣 Nueva solicitud de publicidad',
      `${quien} quiere publicar el anuncio de "${negocio}".`, tel,
      `Hola ${quien}, recibí tu solicitud de anuncio para "${negocio}" en Truequea PE.`));

  App.fotoSolicitud = null;
  $('#formSolicitud').reset();
  $('#zonaSol').textContent = '🖼️ Sube la imagen o el logo de tu negocio';
  cerrar('mAnunciate');
  avisar('¡Solicitud enviada! El administrador la revisará.', 'ok');
  pintarAdmin();
}

/* El administrador aprueba o rechaza una publicidad */
function resolverAnuncio(id, aprobar) {
  const a = BD.anuncios.find(x => x.id == id);
  if (!a) return;
  a.estado = aprobar ? 'aprobado' : 'rechazado';
  a.activo = !!aprobar;
  a.resuelto = new Date().toISOString();
  guardar();
  avisar(aprobar ? 'Publicidad aprobada y publicada ✔' : 'Publicidad rechazada', aprobar ? 'ok' : '');
  pintarAdmin(); pintarLista();
}


/* =====================================================================
   Paneles: mi cuenta, administración y arranque
   ===================================================================== */

function pintarCuenta() {
  const u = yo();
  if (!u) return;
  const rep = reputacion(u.id);
  $('#subCuenta').innerHTML = `${esc(u.nombre)} · ${esc(u.ciudad)} · ${estrellas(rep.prom)}
    ${rep.prom.toFixed(1)} · ${u.puntos || 0} puntos ${u.premium ? '<span class="pro-badge">PREMIUM</span>' : ''}`;
  $('#vistaAvatar').innerHTML = u.avatar ? `<img src="${u.avatar}" alt="">` : esc(u.nombre[0].toUpperCase());
  $('#pfNombre').value = u.nombre;
  $('#pfCiudad').value = u.ciudad;
  $('#pfTel').value = u.telefono || '';
  $('#pfRef').value = u.ref || '';
  $('#pfBio').value = u.bio || '';
  $('#pfLat').value = u.lat || '';
  $('#pfLon').value = u.lon || '';
  if (!u.codigo) { u.codigo = nuevoCodigo(); guardar(); }
  $('#miCodigo').textContent = u.codigo;

  /* mis publicaciones */
  const mios = BD.articulos.filter(a => a.usuario === u.id);
  $('#misPubs').innerHTML = mios.length ? mios.map(a => {
    const props = BD.intercambios.filter(x => x.pido === a.id && x.estado === 'pendiente').length;
    return `<div class="fila">
      <img src="${foto(a)}" alt="">
      <div class="fila-info">
        <b>${esc(a.titulo)} ${a.destacado ? '<span class="eti oro">⭐ Destacado</span>' : ''}</b>
        <span>📍 ${esc(a.ciudad)} · 👁 ${a.vistas} vistas · 🕓 ${fechaTxt(a.creado)}</span>
        <span style="margin-top:4px"><span class="eti ${a.estado === 'disponible' ? 'azul' : a.estado === 'intercambiado' ? 'verde' : 'oro'}">${a.estado}</span>
          ${props ? `<span class="eti oro">${props} propuesta(s)</span>` : ''}</span>
      </div>
      <div class="fila-acc">
        <button class="btn-t" data-art="${a.id}">Ver</button>
        <button class="btn-t" data-editar="${a.id}">Editar</button>
        <button class="btn-t rojo" data-borrar="${a.id}">Eliminar</button>
      </div></div>`;
  }).join('') : `<div class="vacio"><div class="em">📦</div><p>Todavía no publicaste nada.</p>
      <button class="btn pri sm" style="margin-top:12px" data-accion="publicar">Publicar mi primer artículo</button></div>`;

  /* propuestas */
  const pinta = (lista, destino, vacio) => {
    $(destino).innerHTML = lista.length ? lista.map(x => {
      const soyDe = x.de === u.id;
      const otro = usuario(soyDe ? x.para : x.de);
      const pido = BD.articulos.find(a => a.id === x.pido);
      const ofr = x.ofrezco ? BD.articulos.find(a => a.id === x.ofrezco) : null;
      const yaCalifique = BD.resenas.some(r => r.trueque === x.id && r.de === u.id);
      let acc = '';
      if (x.estado === 'pendiente' && !soyDe)
        acc = `<button class="btn-t verde" data-resp="${x.id}|aceptar">✓ Aceptar</button>
               <button class="btn-t rojo" data-resp="${x.id}|rechazar">✕ Rechazar</button>`;
      else if (x.estado === 'pendiente')
        acc = `<button class="btn-t rojo" data-cancelar-tq="${x.id}">Cancelar</button>`;
      else if (x.estado === 'aceptado')
        acc = `<button class="btn-t verde" data-trueque="${x.id}">Gestionar trueque</button>`;
      else if (x.estado === 'completado' && !yaCalifique)
        acc = `<button class="btn-t" data-calificar="${x.id}">⭐ Calificar</button>`;
      if (['pendiente','aceptado'].includes(x.estado))
        acc = `<button class="btn-t" data-analizar="${x.id}">📈 ¿Buen trueque?</button>` + acc;
      const col = { completado:'verde', pendiente:'azul', aceptado:'oro', rechazado:'roja', cancelado:'gris' }[x.estado] || 'gris';
      return `<div class="fila">
        <div class="par"><img src="${foto(pido)}" alt=""><span class="fl">⇄</span>
          <img src="${ofr ? foto(ofr) : SIN_FOTO}" alt=""></div>
        <div class="fila-info">
          <b>${esc(pido ? pido.titulo : '—')} ⇄ ${esc(ofr ? ofr.titulo : 'solo mensaje')}</b>
          <span>${soyDe ? 'Propuesta a' : 'Propuesta de'} <b>${esc(otro.nombre)}</b> · ${relativo(x.creado)}</span>
          ${x.mensaje ? `<span>💬 "${esc(x.mensaje)}"</span>` : ''}
          <span style="margin-top:4px"><span class="eti ${col}">${x.estado}</span></span>
        </div>
        <div class="fila-acc">${acc}</div></div>`;
    }).join('') : `<div class="vacio"><div class="em">🔁</div><p>${vacio}</p></div>`;
  };
  pinta(BD.intercambios.filter(x => x.para === u.id && x.estado === 'pendiente'), '#listaRec', 'No tienes propuestas pendientes.');
  pinta(BD.intercambios.filter(x => x.de === u.id && x.estado === 'pendiente'), '#listaEnv', 'No enviaste propuestas todavía.');
  pinta(BD.intercambios.filter(x => (x.de === u.id || x.para === u.id) && x.estado === 'aceptado'), '#listaAct', 'No tienes trueques en curso.');
  pinta(BD.intercambios.filter(x => (x.de === u.id || x.para === u.id) && ['completado','rechazado','cancelado'].includes(x.estado)), '#listaHis', 'Aquí verás tus trueques cerrados.');

  $('#gRec').textContent = BD.intercambios.filter(x => x.para === u.id && x.estado === 'pendiente').length || '';

  const favs = BD.favoritos.filter(f => f.usuario === u.id)
    .map(f => BD.articulos.find(a => a.id === f.articulo)).filter(Boolean);
  $('#listaFav').innerHTML = favs.length ? favs.map(tarjeta).join('')
    : `<div class="vacio"><div class="em">❤️</div><p>Todavía no guardaste favoritos.</p></div>`;
}

/* ---------------- administración ---------------- */
function pintarAdmin() {
  const u = yo();
  if (!u || u.rol !== 'admin') { avisar('Solo el administrador', 'err'); return irA('inicio'); }
  $('#subAdmin').textContent = `Conectado como ${u.nombre}`;

  const pend = BD.pagos.filter(p => p.estado === 'pendiente').length;
  const pendPub = BD.anuncios.filter(a => a.estado === 'pendiente').length;
  $('#gPagos').textContent = pend || '';
  $('#gPub').textContent = pendPub || '';
  const ingresos = BD.pagos.filter(p => p.estado === 'aprobado').reduce((s, p) => s + Number(p.monto), 0);
  const visitas = (BD.visitas || []).reduce((s, v) => s + v.total, 0);
  $('#cifrasAdmin').innerHTML = `
    <div class="cifra"><b>${BD.usuarios.length}</b><span>Usuarios registrados</span></div>
    <div class="cifra"><b>${visitas}</b><span>Ingresos al sistema</span></div>
    <div class="cifra"><b>${BD.articulos.filter(a => a.estado === 'disponible').length}</b><span>Publicaciones activas</span></div>
    <div class="cifra"><b>${BD.intercambios.filter(x => x.estado === 'completado').length}</b><span>Trueques completados</span></div>
    <div class="cifra ${pend ? 'alerta' : ''}"><b>${pend}</b><span>Comprobantes por revisar</span></div>
    <div class="cifra ${pendPub ? 'alerta' : ''}"><b>${pendPub}</b><span>Publicidad por aprobar</span></div>
    <div class="cifra"><b>${BD.usuarios.filter(x => x.premium).length}</b><span>Usuarios Premium</span></div>
    <div class="cifra"><b>S/ ${ingresos.toFixed(2)}</b><span>Ingresos Premium</span></div>`;

  tablaUsuarios();
  tablaArticulos();
  tablaAnuncios();
  listaSolicitudes();
  listaPagos();
  listaSeguros();
  listaRiesgo();
  pintarReportes();

  const c = BD.config;
  const co = c.contacto || {};
  $('#coNombre').value = co.nombre || ''; $('#coCargo').value = co.cargo || '';
  $('#coTel').value = co.telefono || ''; $('#coEmail').value = co.email || '';
  $('#coWa').value = co.wa || ''; $('#coHorario').value = co.horario || '';
  $('#coTexto').value = co.texto || '';
  $('#coAviso').checked = c.avisoWhatsApp !== false;
  $('#marcaNombre').value = c.nombre; $('#marcaLema').value = c.lema; $('#marcaColor').value = c.color;
  $('#vistaLogo').innerHTML = c.logo ? `<img src="${c.logo}" style="width:100%;height:100%;object-fit:cover" alt="">` : 'Sin logo';
  $('#yapeNom').value = c.yapeNombre || ''; $('#yapeNum').value = c.yapeNumero || '';
  $('#yapePrecio').value = c.precioPremium;
  $('#yapeImpulso').value = c.precioImpulso ?? 1;
  $('#yapeSeguro').value = c.precioSeguro ?? 1;
  $('#yapeAuto').checked = c.autoYape !== false;
  $('#vistaYape').innerHTML = c.yapeQr ? `<img class="yape-qr" src="${c.yapeQr}" alt="QR">`
    : `<div class="yape-vacio">Sin QR<br>subido</div>`;
}

function tablaUsuarios(filtro = '') {
  const q = filtro.toLowerCase();
  const lista = BD.usuarios.filter(u => !q || (u.nombre + u.email).toLowerCase().includes(q));
  $('#tUsuarios').innerHTML = lista.map(u => {
    const r = reputacion(u.id);
    return `<tr>
      <td><div class="celda2">${avatarHTML(u, 'av-g')}
        <div>${esc(u.nombre)} ${u.rol === 'admin' ? '<span class="eti oro">ADMIN</span>' : ''}
          ${u.premium ? '<span class="eti mora">PREMIUM</span>' : ''}
          <small>${esc(u.email)}</small></div></div></td>
      <td>${esc(u.ciudad)}</td>
      <td>${u.premium ? '<span class="eti mora">Premium</span>' : '<span class="eti gris">Gratis</span>'}</td>
      <td>${BD.articulos.filter(a => a.usuario === u.id).length} pub · ${truequesDe(u.id)} trueques<br>
        <span class="estrellas">${estrellas(r.prom)}<span class="n">${r.prom.toFixed(1)}</span></span></td>
      <td><span class="eti ${u.estado === 'activo' ? 'verde' : 'roja'}">${u.estado}</span></td>
      <td style="white-space:nowrap">
        <button class="btn-t" data-perfil="${u.id}">Perfil</button>
        ${u.rol === 'admin' ? '<span style="color:var(--sub);font-size:12px">protegido</span>' : `
        <button class="btn-t mora" data-premium="${u.id}">${u.premium ? 'Quitar premium' : 'Dar premium'}</button>
        <button class="btn-t" data-suspender="${u.id}">${u.estado === 'activo' ? 'Suspender' : 'Reactivar'}</button>
        <button class="btn-t rojo" data-borraruser="${u.id}">Eliminar</button>`}
      </td></tr>`;
  }).join('');
}

function tablaArticulos() {
  $('#tArticulos').innerHTML = BD.articulos.map(a => {
    const d = usuario(a.usuario);
    return `<tr>
      <td><div class="celda2"><img src="${foto(a)}" alt="">
        <div>${esc(a.titulo)}<small>🕓 ${fechaTxt(a.creado)} · 👁 ${a.vistas}</small></div></div></td>
      <td>${CATEGORIAS[a.categoria - 1][0]}</td><td>${esc(a.ciudad)}</td>
      <td>${esc(d ? d.nombre : '—')}</td>
      <td><span class="eti ${a.estado === 'disponible' ? 'azul' : 'gris'}">${a.estado}</span></td>
      <td style="white-space:nowrap">
        <button class="btn-t" data-art="${a.id}">Ver</button>
        <button class="btn-t oro" data-destacar="${a.id}">${a.destacado ? 'Quitar ⭐' : 'Destacar'}</button>
        <button class="btn-t rojo" data-borrar="${a.id}">Eliminar</button></td></tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:26px;color:var(--sub)">Sin publicaciones</td></tr>';
}

function tablaAnuncios() {
  const eti = a => a.estado === 'pendiente' ? '<span class="eti oro">Por aprobar</span>'
    : a.estado === 'rechazado' ? '<span class="eti roja">Rechazado</span>'
    : a.activo ? '<span class="eti verde">Publicado</span>' : '<span class="eti gris">Pausado</span>';
  $('#tAnuncios').innerHTML = BD.anuncios.map(a => `
    <tr><td><div class="celda2"><img src="${a.img || SIN_FOTO}" alt="">
      <div>${esc(a.titulo)} ${a.destacado ? '<span class="eti oro">BANNER</span>' : ''}
        <small>${esc(a.desc).slice(0, 60)}</small></div></div></td>
      <td>${a.tel ? '📞 ' + esc(a.tel) + '<br>' : ''}${a.wa ? '<span class="eti verde">WhatsApp</span>' : ''}</td>
      <td>${a.vistas || 0}</td><td>${a.clics || 0}</td>
      <td>${eti(a)}</td>
      <td style="white-space:nowrap">
        ${a.estado === 'aprobado'
          ? `<button class="btn-t" data-anpausa="${a.id}">${a.activo ? 'Pausar' : 'Activar'}</button>
             <button class="btn-t rojo" data-anaprobar="${a.id}|no">Quitar</button>`
          : `<button class="btn-t verde" data-anaprobar="${a.id}|si">✓ Aprobar</button>
             <button class="btn-t rojo" data-anaprobar="${a.id}|no">✕ Rechazar</button>`}
        <button class="btn-t" data-anuncio="${a.id}">Ver</button>
        <button class="btn-t rojo" data-anborrar="${a.id}">Eliminar</button></td></tr>`).join('')
    || '<tr><td colspan="6" style="text-align:center;padding:26px;color:var(--sub)">Sin anuncios</td></tr>';
}

/* Solicitudes de publicidad esperando aprobación */
function listaSolicitudes() {
  const p = BD.anuncios.filter(a => a.estado === 'pendiente');
  $('#cajaSolicitudes').style.display = '';
  $('#listaSolicitudes').innerHTML = p.length ? p.map(a => `
    <div class="fila">
      <img src="${a.img || SIN_FOTO}" alt="">
      <div class="fila-info">
        <b>${esc(a.titulo)}</b>
        <span>${esc(a.desc)}</span>
        <span>👤 ${esc(a.solicitante || '—')} · 📞 ${esc(a.tel || 'sin teléfono')} · 🕓 ${fechaTxt(a.creado)}</span>
      </div>
      <div class="fila-acc">
        <button class="btn-t verde" data-anaprobar="${a.id}|si">✓ Aprobar y publicar</button>
        <button class="btn-t rojo" data-anaprobar="${a.id}|no">✕ Rechazar</button>
        ${a.tel ? `<a class="btn-t" target="_blank" rel="noopener"
           href="${esc(linkWA(a.tel, `Hola ${a.solicitante || ''}, sobre tu anuncio de "${a.titulo}" en Truequea PE.`))}">💬 WhatsApp</a>` : ''}
      </div></div>`).join('')
    : `<p class="nota">No hay solicitudes pendientes.</p>`;
}

/* =====================================================================
   GRÁFICOS DEL PANEL DE ADMINISTRACIÓN (SVG hecho a mano, sin librerías)
   ===================================================================== */
function diasAtras(n) {
  const l = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    l.push(d.toISOString().slice(0, 10));
  }
  return l;
}
function etiquetaDia(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
function ejes(w, h, mx, my, titulo) {
  const c = document.documentElement.dataset.tema === 'oscuro' ? '#3a465c' : '#dde3ec';
  let g = `<line x1="${mx}" y1="${h - my}" x2="${w - 10}" y2="${h - my}" stroke="${c}" stroke-width="1.5"/>`;
  g += `<line x1="${mx}" y1="14" x2="${mx}" y2="${h - my}" stroke="${c}" stroke-width="1.5"/>`;
  return g;
}
function graficoBarras(svgId, datos, opciones = {}) {
  const svg = $('#' + svgId);
  if (!svg) return;
  const w = opciones.w || 720, h = opciones.h || 260, mx = 42, my = 34;
  const oscuro = document.documentElement.dataset.tema === 'oscuro';
  const sub = oscuro ? '#93a0b5' : '#6f7b8c';
  const rejilla = oscuro ? '#2a3546' : '#eef2f8';
  const max = Math.max(1, ...datos.map(d => d.valor), ...(opciones.linea || []).map(v => v));
  const paso = Math.ceil(max / 4) || 1, tope = paso * 4;
  const ancho = (w - mx - 16) / Math.max(datos.length, 1);
  const alto = v => (v / tope) * (h - my - 22);
  const yDe = v => h - my - alto(v);

  let g = '';
  for (let i = 0; i <= 4; i++) {
    const y = h - my - (i / 4) * (h - my - 22);
    g += `<line x1="${mx}" y1="${y}" x2="${w - 10}" y2="${y}" stroke="${rejilla}" stroke-width="1"/>
      <text x="${mx - 8}" y="${y + 4}" font-size="11" fill="${sub}" text-anchor="end">${paso * i}</text>`;
  }
  g += ejes(w, h, mx, my);
  datos.forEach((d, i) => {
    const x = mx + i * ancho + ancho * .18, an = ancho * .64;
    const y = yDe(d.valor), al = Math.max(alto(d.valor), d.valor ? 2 : 0);
    g += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${an.toFixed(1)}" height="${al.toFixed(1)}"
        rx="4" fill="${opciones.color || '#0a5fc4'}" opacity=".92"><title>${esc(d.etiqueta)}: ${d.valor}</title></rect>`;
    if (d.valor) g += `<text x="${(x + an / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" font-size="10.5"
        font-weight="700" fill="${sub}" text-anchor="middle">${d.valor}</text>`;
    if (datos.length <= 16 || i % 2 === 0)
      g += `<text x="${(x + an / 2).toFixed(1)}" y="${h - my + 16}" font-size="10.5" fill="${sub}"
        text-anchor="middle">${esc(d.etiqueta)}</text>`;
  });
  /* línea encima (por ejemplo: personas distintas) */
  if (opciones.linea && opciones.linea.length === datos.length) {
    const pts = opciones.linea.map((v, i) =>
      `${(mx + i * ancho + ancho / 2).toFixed(1)},${yDe(v).toFixed(1)}`).join(' ');
    g += `<polyline points="${pts}" fill="none" stroke="#7b3fe4" stroke-width="2.6"
      stroke-linejoin="round" stroke-linecap="round"/>`;
    opciones.linea.forEach((v, i) =>
      g += `<circle cx="${(mx + i * ancho + ancho / 2).toFixed(1)}" cy="${yDe(v).toFixed(1)}" r="3.4"
        fill="#7b3fe4" stroke="#fff" stroke-width="1.4"><title>${v} persona(s)</title></circle>`);
  }
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = g;
}
function graficoArea(svgId, datos, color = '#12703c', prefijo = '') {
  const svg = $('#' + svgId);
  if (!svg) return;
  const w = 720, h = 240, mx = 46, my = 32;
  const oscuro = document.documentElement.dataset.tema === 'oscuro';
  const sub = oscuro ? '#93a0b5' : '#6f7b8c';
  const rejilla = oscuro ? '#2a3546' : '#eef2f8';
  const max = Math.max(1, ...datos.map(d => d.valor));
  const paso = Math.ceil(max / 4) || 1, tope = paso * 4;
  const px = i => mx + (i / Math.max(datos.length - 1, 1)) * (w - mx - 16);
  const py = v => h - my - (v / tope) * (h - my - 22);

  let g = '';
  for (let i = 0; i <= 4; i++) {
    const y = h - my - (i / 4) * (h - my - 22);
    g += `<line x1="${mx}" y1="${y}" x2="${w - 10}" y2="${y}" stroke="${rejilla}" stroke-width="1"/>
      <text x="${mx - 8}" y="${y + 4}" font-size="11" fill="${sub}" text-anchor="end">${prefijo}${paso * i}</text>`;
  }
  g += ejes(w, h, mx, my);
  const linea = datos.map((d, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(d.valor).toFixed(1)}`).join(' ');
  g += `<path d="${linea} L${px(datos.length - 1).toFixed(1)},${h - my} L${px(0).toFixed(1)},${h - my} Z"
      fill="${color}" opacity=".16"/>`;
  g += `<path d="${linea}" fill="none" stroke="${color}" stroke-width="2.8" stroke-linejoin="round"/>`;
  datos.forEach((d, i) => {
    g += `<circle cx="${px(i).toFixed(1)}" cy="${py(d.valor).toFixed(1)}" r="3.6" fill="${color}"
      stroke="#fff" stroke-width="1.4"><title>${esc(d.etiqueta)}: ${prefijo}${d.valor}</title></circle>`;
    if (datos.length <= 14 || i % 2 === 0)
      g += `<text x="${px(i).toFixed(1)}" y="${h - my + 16}" font-size="10.5" fill="${sub}"
        text-anchor="middle">${esc(d.etiqueta)}</text>`;
  });
  svg.innerHTML = g;
}

function pintarReportes() {
  const rango = Number(($('#repRango') || {}).value || 14);

  /* 1) ingresos al sistema por día */
  const dias = diasAtras(rango);
  const visitas = BD.visitas || [];
  const barras = dias.map(d => {
    const v = visitas.find(x => x.dia === d);
    return { etiqueta: etiquetaDia(d), valor: v ? v.total : 0 };
  });
  const personas = dias.map(d => {
    const v = visitas.find(x => x.dia === d);
    return v ? v.usuarios.length : 0;
  });
  graficoBarras('gIngresos', barras, { linea: personas, h: 260 });

  /* 2) trueques realizados por semana */
  const comps = BD.intercambios.filter(x => x.estado === 'completado');
  const semanas = [];
  for (let i = 5; i >= 0; i--) {
    const fin = new Date(); fin.setHours(23, 59, 59, 0); fin.setDate(fin.getDate() - i * 7);
    const ini = new Date(fin); ini.setDate(ini.getDate() - 6); ini.setHours(0, 0, 0, 0);
    semanas.push({
      etiqueta: `${String(ini.getDate()).padStart(2,'0')}/${String(ini.getMonth()+1).padStart(2,'0')}`,
      valor: comps.filter(x => { const f = new Date(x.completado || x.creado); return f >= ini && f <= fin; }).length,
    });
  }
  graficoBarras('gTrueques', semanas, { color:'#12703c', h:240 });
  const enCurso = BD.intercambios.filter(x => x.estado === 'aceptado').length;
  $('#resumenTrueques').innerHTML = `
    <div><b>${comps.length}</b>Trueques cerrados</div>
    <div><b>${enCurso}</b>En curso ahora</div>
    <div><b>${BD.intercambios.filter(x => x.estado === 'pendiente').length}</b>Propuestas esperando</div>`;

  /* 3) ingresos de dinero acumulados */
  const aprob = BD.pagos.filter(p => p.estado === 'aprobado');
  let acum = 0;
  const dinero = dias.map(d => {
    acum += aprob.filter(p => (p.resuelto || p.creado).slice(0, 10) === d)
                 .reduce((s, p) => s + Number(p.monto), 0);
    return { etiqueta: etiquetaDia(d), valor: Number(acum.toFixed(2)) };
  });
  graficoArea('gDinero', dinero, '#7b3fe4', 'S/ ');
  const total = aprob.reduce((s, p) => s + Number(p.monto), 0);
  $('#resumenDinero').innerHTML = `
    <div><b>S/ ${total.toFixed(2)}</b>Total cobrado</div>
    <div><b>${aprob.length}</b>Pagos aprobados</div>
    <div><b>${BD.usuarios.filter(u => u.premium).length}</b>Cuentas Premium</div>`;

  /* 4) actividad por ciudad */
  const conteo = {};
  BD.articulos.forEach(a => conteo[a.ciudad] = (conteo[a.ciudad] || 0) + 1);
  const orden = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const tope = Math.max(1, ...orden.map(o => o[1]));
  $('#gCiudades').innerHTML = orden.length ? orden.map(([c, n]) => `
    <div class="barra-ciudad"><span>${esc(c)}</span>
      <div class="pista"><i style="width:${(n / tope * 100).toFixed(1)}%"></i></div>
      <span style="width:34px;text-align:right;font-weight:700">${n}</span></div>`).join('')
    : '<p class="nota">Todavía no hay publicaciones.</p>';
}

function listaPagos(filtro = '') {
  const f = filtro || ($('#filtroPagos') ? $('#filtroPagos').value : '');
  const nombres = { premium:'💜 Premium', impulso:'🚀 Impulso', seguro:'🛡️ Trueque Seguro' };
  let lista = BD.pagos;
  if (f === 'pendiente') lista = lista.filter(p => p.estado === 'pendiente');
  else if (f) lista = lista.filter(p => (p.tipo || 'premium') === f);

  $('#listaPagos').innerHTML = lista.length ? lista.map(p => {
    const u = usuario(p.usuario);
    const tipo = p.tipo || 'premium';
    const art = p.articulo ? BD.articulos.find(a => a.id === p.articulo) : null;
    return `<div class="fila">
      <img src="${p.captura}" alt="Comprobante" style="cursor:zoom-in" data-vercaptura="${p.id}">
      <div class="fila-info">
        <b>${esc(u ? u.nombre : 'Usuario eliminado')} — S/ ${Number(p.monto).toFixed(2)}
          <span class="eti ${tipo === 'premium' ? 'mora' : tipo === 'impulso' ? 'oro' : 'azul'}">${nombres[tipo]}</span></b>
        <span>${esc(u ? u.email : '')} · ${fechaTxt(p.creado)}</span>
        ${art ? `<span>📦 "${esc(art.titulo)}" por ${p.horas || 24} horas</span>` : ''}
        ${p.nota ? `<span>📝 ${esc(p.nota)}</span>` : ''}
        ${p.auto ? '<span class="eti verde">🤖 Verificado automáticamente</span>' : ''}
        ${p.ocr ? `<span>🔎 Leído: S/ ${p.ocr.monto ?? '—'} · operación ${esc(p.ocr.codigo || '—')}
          ${p.ocr.motivos && p.ocr.motivos.length ? '· ⚠ ' + esc(p.ocr.motivos.join(' ')) : ''}</span>` : ''}
        <span style="margin-top:4px"><span class="eti ${p.estado === 'aprobado' ? 'verde' : p.estado === 'pendiente' ? 'oro' : 'roja'}">${p.estado}</span></span>
      </div>
      <div class="fila-acc">${p.estado === 'pendiente' ? `
        <button class="btn-t verde" data-pago="${p.id}|si">✓ Aprobar</button>
        <button class="btn-t rojo" data-pago="${p.id}|no">✕ Rechazar</button>` : ''}</div></div>`;
  }).join('') : `<div class="vacio"><div class="em">💰</div><p>No hay comprobantes con ese filtro.</p></div>`;
}

/* Trueques con acompañamiento contratado */
function listaSeguros() {
  const act = BD.seguros.filter(s => s.estado !== 'cerrado');
  $('#listaSeguros').innerHTML = act.length ? act.map(s => {
    const x = BD.intercambios.find(i => i.id === s.intercambio);
    if (!x) return '';
    const a = usuario(x.de), b = usuario(x.para);
    const pido = BD.articulos.find(t => t.id === x.pido);
    const ofr = x.ofrezco ? BD.articulos.find(t => t.id === x.ofrezco) : null;
    const ca = confianza(a), cb = confianza(b);
    const emo = n => ({ verde:'🟢', amarillo:'🟡', rojo:'🔴' }[n]);
    return `<div class="fila">
      <div class="par"><img src="${foto(pido)}" alt=""><span class="fl">⇄</span>
        <img src="${ofr ? foto(ofr) : SIN_FOTO}" alt=""></div>
      <div class="fila-info">
        <b>${esc(pido ? pido.titulo : '—')} ⇄ ${esc(ofr ? ofr.titulo : 'solo mensaje')}</b>
        <span>${emo(ca.nivel)} ${esc(a ? a.nombre : '—')} (${ca.puntos}/100) · ${emo(cb.nivel)} ${esc(b ? b.nombre : '—')} (${cb.puntos}/100)</span>
        <span>📍 ${esc(x.lugar || 'sin punto de encuentro todavía')} · 🕓 ${x.fecha ? x.fecha.replace('T', ' ') : 'sin fecha'}</span>
        <span style="margin-top:4px"><span class="eti ${x.estado === 'completado' ? 'verde' : 'oro'}">${x.estado}</span>
          <span class="eti ${s.estado === 'verificado' ? 'verde' : 'azul'}">${s.estado}</span></span>
      </div>
      <div class="fila-acc">
        <button class="btn-t" data-trueque="${x.id}">Ver trueque</button>
        ${s.estado !== 'verificado'
          ? `<button class="btn-t verde" data-verificarseg="${s.id}">🛡️ Dar visto bueno</button>` : ''}
      </div></div>`;
  }).join('') : `<p class="nota">Todavía nadie contrató el acompañamiento.</p>`;
}

/* Cuentas y publicaciones que conviene revisar */
function listaRiesgo() {
  const riesgo = BD.usuarios.map(u => ({ u, c: confianza(u) }))
    .filter(x => x.c.nivel !== 'verde' && x.u.rol !== 'admin')
    .sort((a, b) => a.c.puntos - b.c.puntos);
  const fotosMalas = BD.articulos.filter(a => revisarFotos(a).repetida);

  $('#listaRiesgo').innerHTML = `
    ${fotosMalas.length ? `<div class="aviso" style="border-color:var(--rojo);color:var(--rojo)">
      ⚠️ ${fotosMalas.length} publicación(es) usan una foto que ya está en otra cuenta:
      ${fotosMalas.map(a => `<button class="btn-t" data-art="${a.id}">${esc(a.titulo)}</button>`).join(' ')}
    </div>` : ''}
    ${riesgo.length ? riesgo.map(x => `
      <div class="fila">
        ${avatarHTML(x.u, 'av-g')}
        <div class="fila-info">
          <b>${esc(x.u.nombre)} <span class="eti ${x.c.nivel === 'rojo' ? 'roja' : 'oro'}">${esc(x.c.etiqueta)} · ${x.c.puntos}/100</span></b>
          <span>${esc(x.u.email)} · ${esc(x.u.ciudad)}</span>
          ${(x.c.malas || []).map(m => `<span>⚠ ${esc(m)}</span>`).join('')}
        </div>
        <div class="fila-acc">
          <button class="btn-t" data-perfil="${x.u.id}">Perfil</button>
          <button class="btn-t" data-suspender="${x.u.id}">${x.u.estado === 'activo' ? 'Suspender' : 'Reactivar'}</button>
        </div></div>`).join('')
    : '<p class="nota">Ninguna cuenta con señales de riesgo. 🎉</p>'}`;
}

/* ---------------- exportar ---------------- */
function descargar(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function csvUsuarios() {
  const cab = ['ID','Nombre','Correo','Rol','Ciudad','Telefono','Plan','Premium hasta','Publicaciones',
               'Trueques','Reputacion','Puntos','Estado','Registrado','Codigo de respaldo','Latitud','Longitud'];
  const filas = BD.usuarios.map(u => {
    const r = reputacion(u.id);
    return [u.id, u.nombre, u.email, u.rol, u.ciudad, u.telefono || '',
      u.premium ? 'Premium' : 'Gratis', u.premiumHasta ? fechaTxt(u.premiumHasta) : '',
      BD.articulos.filter(a => a.usuario === u.id).length, truequesDe(u.id),
      r.prom.toFixed(1), u.puntos || 0, u.estado, fechaTxt(u.creado),
      u.codigo || '', u.lat || '', u.lon || ''];
  });
  const csv = '﻿' + [cab, ...filas]
    .map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  descargar(`usuarios-truequea-${new Date().toISOString().slice(0,10)}.csv`, csv, 'text/csv;charset=utf-8');
  avisar(`Descargados ${BD.usuarios.length} usuarios`, 'ok');
}

/* ---------------- perfil público ---------------- */
function verPerfil(id) {
  const u = usuario(id);
  if (!u) return;
  const r = reputacion(id);
  const arts = BD.articulos.filter(a => a.usuario === id && a.estado !== 'oculto');
  const res = BD.resenas.filter(x => x.para === id);
  $('#perfilPub').innerHTML = `
    <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
      ${avatarHTML(u, 'av-g av-xl')}
      <div style="flex:1;min-width:200px">
        <h2>${esc(u.nombre)} ${u.premium ? '<span class="pro-badge">PREMIUM</span>' : ''}</h2>
        <div class="estrellas">${estrellas(r.prom)}<span class="n">${r.prom.toFixed(1)} · ${r.total} reseñas</span></div>
        <p style="font-size:14px;color:var(--sub);margin-top:4px">📍 ${esc(u.ciudad)} ·
          ${truequesDe(id)} trueques · ${arts.length} publicaciones · desde ${fechaTxt(u.creado).split(' ·')[0]}</p>
        ${u.bio ? `<p style="margin-top:8px">${esc(u.bio)}</p>` : ''}
        ${u.telefono ? `<a class="wa" style="margin-top:10px" target="_blank" rel="noopener"
          href="https://wa.me/51${String(u.telefono).replace(/\D/g,'')}">💬 Escribir por WhatsApp</a>` : ''}
      </div>
    </div>
    <h3 style="font-size:17px;margin-bottom:10px">Publicaciones</h3>
    <div class="grilla" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
      ${arts.map(tarjeta).join('') || '<p class="nota">Sin publicaciones.</p>'}</div>
    <h3 style="font-size:17px;margin:18px 0 10px">Reseñas</h3>
    ${res.map(x => `<div class="fila"><div class="fila-info">
      <b>${esc(usuario(x.de) ? usuario(x.de).nombre : '—')} <span class="estrellas">${estrellas(x.puntaje)}</span></b>
      <span>${esc(x.comentario || 'Sin comentario.')}</span>
      <span style="font-size:12px">${fechaTxt(x.creado)}</span></div></div>`).join('')
      || '<p class="nota">Todavía no tiene reseñas.</p>'}`;
  cerrar('mFicha'); abrir('mPerfil');
}

/* ---------------- textos informativos ---------------- */
const TEXTOS = {
  faq: `<h2>Preguntas frecuentes</h2>
    <div class="tarjeta"><h3>¿Cuánto cuesta usar Truequea PE?</h3>
      <p>Publicar, buscar e intercambiar es gratis. Premium cuesta S/ 1 al mes y solo agrega
         destaque, publicaciones ilimitadas y navegación sin publicidad.</p></div>
    <div class="tarjeta"><h3>¿Dónde se guardan mis datos?</h3>
      <p>En este navegador, en tu propia computadora. Nadie más los ve. Si limpias los datos del
         navegador se borran, por eso el administrador puede descargar una copia de seguridad.</p></div>
    <div class="tarjeta"><h3>¿Cómo sé que la otra persona es confiable?</h3>
      <p>Revisa su reputación, sus reseñas y cuántos trueques completó. Acuerda siempre el
         encuentro en una de las zonas seguras sugeridas.</p></div>
    <div class="tarjeta"><h3>¿Por qué no aparecen precios?</h3>
      <p>Porque Truequea PE es <b>solo trueque</b>: aquí no se vende ni se compra nada. Publicas lo que
         tienes y escribes qué buscas a cambio. Lo que valga cada cosa lo acuerdan ustedes dos
         al conversar.</p></div>
    <div class="tarjeta"><h3>¿Qué pasa si olvido mi contraseña?</h3>
      <p>Al registrarte te damos un <b>código de respaldo</b> (por ejemplo TRUEQUEA-1234). Con ese
         código y tu correo cambias la contraseña desde "Entrar" → "Olvidé mi contraseña".
         Lo vuelves a ver en Mi cuenta → Perfil → Seguridad.</p></div>
    <div class="tarjeta"><h3>¿Qué es reservar una publicación?</h3>
      <p>Es una función Premium: apartas un artículo hasta 24 horas mientras conversan, para que
         nadie más lo proponga. Cuando vence el plazo se libera solo.</p></div>`,
  zonas: `<h2>🛡️ Zonas seguras sugeridas</h2>
    <p class="sub">Lugares públicos y vigilados para hacer tus intercambios.</p>
    ${ZONAS_SEGURAS.map(z => `<div class="fila"><div class="fila-info">
      <b>${z.nombre}</b><span>${z.tipo} · ${z.ciudad}</span></div>
      <a class="btn suave sm" target="_blank" rel="noopener"
        href="https://www.google.com/maps?q=${z.lat},${z.lon}">🗺️ Cómo llegar</a></div>`).join('')}`,
  terminos: `<h2>Términos y condiciones</h2>
    <p style="line-height:1.8">Truequea PE conecta personas interesadas en intercambiar bienes y
    servicios. La plataforma no participa en el intercambio ni garantiza el estado de los artículos:
    verificar lo que recibes es responsabilidad tuya. Está prohibido publicar artículos ilegales,
    armas, medicamentos, animales protegidos o contenido para adultos. El incumplimiento puede
    derivar en la suspensión de la cuenta.</p>`,
  privacidad: `<h2>Política de privacidad (Ley N.° 29733)</h2>
    <p style="line-height:1.8">Tratamos tus datos conforme a la Ley N.° 29733 de Protección de Datos
    Personales del Perú. En esta versión <b>todos tus datos se guardan únicamente en tu navegador</b>:
    no viajan a ningún servidor. Puedes borrarlos cuando quieras desde el pie de página
    ("Reiniciar datos de prueba") o limpiando los datos del sitio en tu navegador. El administrador
    puede descargar una copia de seguridad para respaldo.</p>`,
};


/* =====================================================================
   MÓDULOS NUEVOS
   · "Quiero esto"  · Trueques VIP  · Top truequeadores
   · Análisis del trueque  · Impulsar publicación  · Trueque Seguro
   · Confianza y revisión de fotos  · Ver interesados
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) VALOR DE REFERENCIA Y ANÁLISIS DEL TRUEQUE
   Ojo: esto NO es un precio de venta. Es una referencia interna que
   sirve solo para avisarte si el cambio se ve parejo o no.
   --------------------------------------------------------------------- */
function valorRef(a) {
  if (!a) return 0;
  const rango = a.vip && REF_VIP[a.vip] ? REF_VIP[a.vip] : (REFERENCIA[a.categoria] || [30, 200]);
  const medio = (rango[0] + rango[1]) / 2;
  const cond = PESO_CONDICION[a.condicion] ?? .6;
  /* lo que mucha gente mira sube un poco la referencia */
  const tiron = Math.min((a.vistas || 0) / 400 + (a.favs || 0) / 30, .25);
  return Math.round(medio * cond * (1 + tiron));
}
function demandaDe(a) {
  if (!a) return 0;
  const buscanCat = BD.articulos.filter(x => x.id !== a.id &&
    (x.busca || '').toLowerCase().includes(CATEGORIAS[a.categoria - 1][0].toLowerCase().slice(0, 5))).length;
  const deseos = BD.deseos.filter(d => d.activo && coincideDeseo(d, a)).length;
  const favs = a.favs || 0;
  return buscanCat * 2 + deseos * 4 + favs;
}
function nivelTexto(n) {
  return n >= 70 ? 'Alta' : n >= 40 ? 'Media' : n >= 15 ? 'Baja' : 'Muy baja';
}
function popularidadDe(a) {
  const todos = BD.articulos.map(x => (x.vistas || 0) + (x.favs || 0) * 5);
  const prom = todos.reduce((s, v) => s + v, 0) / Math.max(todos.length, 1) || 1;
  const mio = (a.vistas || 0) + (a.favs || 0) * 5;
  return Math.min(Math.round(mio / prom * 50), 100);
}
function facilidadDe(a) {
  /* qué tan fácil es volver a cambiarlo: cuánta gente busca esa categoría */
  const cat = CATEGORIAS[a.categoria - 1][0].toLowerCase();
  const buscan = BD.articulos.filter(x => (x.busca || '').toLowerCase().includes(cat.slice(0, 5))).length;
  const deseos = BD.deseos.filter(d => d.activo && d.categoria === a.categoria).length;
  return Math.min(Math.round((buscan * 12 + deseos * 20 + (a.vip ? 25 : 0)) ), 100);
}

/* Compara lo que entregas contra lo que recibes */
function analizarTrueque(doy, recibo) {
  const vDoy = valorRef(doy), vRec = valorRef(recibo);
  const ratio = vDoy > 0 ? vRec / vDoy : 1;
  let nivel, titulo, consejo;
  if (!doy) {
    nivel = 'amarillo'; titulo = 'Sin artículo de por medio';
    consejo = 'Estás enviando solo un mensaje. Si quieres que te tomen en serio, ofrece algo tuyo.';
  } else if (ratio >= 1.15) {
    nivel = 'verde'; titulo = 'Buen intercambio para ti';
    consejo = 'Recibes algo con más referencia que lo que entregas. Revisa bien el estado real antes de cerrar.';
  } else if (ratio >= .85) {
    nivel = 'amarillo'; titulo = 'Intercambio equilibrado';
    consejo = 'Los dos lados se parecen. Es un cambio justo si el artículo está como lo describen.';
  } else {
    nivel = 'rojo'; titulo = 'Te conviene negociar';
    consejo = 'Estás entregando algo con más referencia. Pide que agreguen algo o busca otra opción.';
  }
  return {
    nivel, titulo, consejo, ratio,
    vDoy, vRec,
    demanda: demandaDe(recibo), popularidad: popularidadDe(recibo), facilidad: facilidadDe(recibo),
    demandaMia: doy ? demandaDe(doy) : 0,
  };
}

/* ---------------------------------------------------------------------
   2) CONFIANZA Y REVISIÓN DE FOTOS
   --------------------------------------------------------------------- */
function huella(txt) {
  let h = 0;
  const s = String(txt || '');
  for (let i = 0; i < s.length; i += 7) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h + '_' + s.length;
}
/* Revisión automática básica de las fotos de una publicación */
function revisarFotos(a) {
  const alertas = [];
  if (!a.fotos || !a.fotos.length) {
    alertas.push('La publicación no tiene fotos propias.');
    return { ok: false, alertas, repetida: false };
  }
  let repetida = false;
  a.fotos.forEach(f => {
    const h = huella(f);
    /* la misma imagen usada por OTRA cuenta = sospechoso (foto sacada de internet) */
    const otra = BD.articulos.find(x => x.id !== a.id && x.usuario !== a.usuario &&
      (x.fotos || []).some(g => huella(g) === h));
    if (otra) repetida = true;
    if (String(f).length < 2600) alertas.push('Una foto es demasiado pequeña o borrosa.');
  });
  if (repetida) alertas.push('Una foto ya está publicada por otra cuenta: puede no ser real.');
  return { ok: !alertas.length, alertas, repetida };
}

/* Nivel de confianza de una persona (0 a 100) */
function confianza(u) {
  if (!u) return { puntos: 0, nivel: 'rojo', etiqueta: 'Desconocido', senales: [] };
  const r = reputacion(u.id), tq = truequesDe(u.id);
  const dias = Math.floor((Date.now() - new Date(u.creado)) / 86400000);
  const misArts = BD.articulos.filter(a => a.usuario === u.id);
  const sinFoto = misArts.filter(a => !a.fotos || !a.fotos.length).length;
  const fotosMalas = misArts.some(a => revisarFotos(a).repetida);

  let p = 30;
  const buenas = [], malas = [];
  if (u.verificado) { p += 12; buenas.push('Cuenta verificada con Google'); }
  if (u.telefono)   { p += 10; buenas.push('Tiene teléfono registrado'); }
  else malas.push('No registró teléfono');
  if (tq >= 10) { p += 20; buenas.push(`${tq} trueques completados`); }
  else if (tq >= 3) { p += 12; buenas.push(`${tq} trueques completados`); }
  else if (tq === 0) malas.push('Todavía no completó ningún trueque');
  if (r.total >= 3 && r.prom >= 4.5) { p += 18; buenas.push(`${r.prom.toFixed(1)} estrellas en ${r.total} reseñas`); }
  else if (r.total && r.prom <= 3)   { p -= 25; malas.push(`Solo ${r.prom.toFixed(1)} estrellas: ten cuidado`); }
  else if (!r.total) malas.push('Nadie lo ha calificado todavía');
  if (dias >= 60) { p += 10; buenas.push('Cuenta con más de 2 meses'); }
  else if (dias <= 3) { p -= 10; malas.push('Cuenta creada hace muy poco'); }
  if (u.premium) { p += 6; buenas.push('Cuenta Premium (pagó y fue verificada)'); }
  if (sinFoto)   { p -= 6; malas.push(`${sinFoto} publicación(es) sin fotos propias`); }
  if (fotosMalas){ p -= 22; malas.push('Usa fotos que ya están en otra cuenta'); }

  p = Math.max(0, Math.min(100, p));
  const nivel = p >= 70 ? 'verde' : p >= 45 ? 'amarillo' : 'rojo';
  const etiqueta = p >= 70 ? 'Confiable' : p >= 45 ? 'Normal — revisa bien' : 'Ten cuidado';
  return { puntos: p, nivel, etiqueta, buenas, malas, senales: [...buenas, ...malas] };
}

function cajaConfianza(u, art) {
  const c = confianza(u);
  const f = art ? revisarFotos(art) : null;
  const emo = { verde:'🟢', amarillo:'🟡', rojo:'🔴' }[c.nivel];
  return `<div class="confianza ${c.nivel}">
    <div class="conf-cab">
      <b>${emo} Nivel de confianza: ${esc(c.etiqueta)}</b>
      <span class="conf-num">${c.puntos}/100</span>
    </div>
    <div class="conf-barra"><i style="width:${c.puntos}%"></i></div>
    <ul class="conf-lista">
      ${(c.buenas || []).map(s => `<li class="si">✔ ${esc(s)}</li>`).join('')}
      ${(c.malas || []).map(s => `<li class="no">⚠ ${esc(s)}</li>`).join('')}
      ${f ? (f.ok ? '<li class="si">✔ Fotos revisadas: se ven propias</li>'
                  : f.alertas.map(t => `<li class="no">⚠ ${esc(t)}</li>`).join('')) : ''}
    </ul>
    <p class="conf-pie">Revisión automática. Encuéntrense siempre en una zona segura y revisen
      el artículo antes de entregar.</p>
  </div>`;
}

/* ---------------------------------------------------------------------
   3) "QUIERO ESTO" — pedidos de los Premium con aviso automático
   --------------------------------------------------------------------- */
function coincideDeseo(d, art) {
  if (!d.activo) return false;
  if (d.vip && art.vip === d.vip) return true;
  const texto = `${art.titulo} ${art.desc || ''} ${art.busca || ''}`.toLowerCase();
  const claves = `${d.titulo} ${d.palabras || ''}`.toLowerCase()
    .split(/[\s,;]+/).filter(p => p.length >= 3);
  const acierto = claves.some(p => texto.includes(p));
  if (!acierto) return false;
  if (d.categoria && art.categoria !== d.categoria) return claves.some(p => art.titulo.toLowerCase().includes(p));
  return true;
}

/* Cuando alguien publica algo, avisa a los Premium que lo estaban pidiendo */
function avisarDeseos(art) {
  const dueno = usuario(art.usuario);
  let avisados = 0;
  BD.deseos.filter(d => d.activo && d.usuario !== art.usuario && coincideDeseo(d, art)).forEach(d => {
    const p = usuario(d.usuario);
    if (!p || !p.premium) return;
    if ((d.avisados || []).includes(art.id)) return;
    d.avisados = [...(d.avisados || []), art.id];
    avisarConWA(p.id, '🎯 ¡Apareció lo que querías!',
      `Alguien publicó "${art.titulo}" y coincide con tu pedido “${d.titulo}”. Tú ofreces: ${d.ofrezco}` +
      `${d.adicional ? ' + S/ ' + d.adicional : ''}.`,
      dueno ? dueno.telefono : null,
      `Hola ${dueno ? dueno.nombre : ''}, vi tu "${art.titulo}" en Truequea PE. ` +
      `Te ofrezco ${d.ofrezco}${d.adicional ? ' + S/ ' + d.adicional : ''}.`);
    avisados++;
  });
  if (avisados) guardar();
  return avisados;
}

function guardarDeseo() {
  const u = yo();
  if (!u) { abrirAuth('login'); return; }
  if (!u.premium) { cerrarTodo(); return irA('premium'); }
  const titulo = $('#deTitulo').value.trim();
  const ofrezco = $('#deOfrezco').value.trim();
  if (titulo.length < 3)  return avisar('Escribe qué quieres conseguir', 'err');
  if (ofrezco.length < 3) return avisar('Escribe qué entregas a cambio', 'err');

  const id = $('#deId').value;
  const datos = {
    titulo, palabras: $('#dePalabras').value.trim(),
    categoria: Number($('#deCat').value) || null,
    vip: $('#deVip').value || null,
    ofrezco, adicional: Number($('#deAdicional').value) || 0,
    activo: true,
  };
  if (id) {
    Object.assign(BD.deseos.find(d => d.id == id), datos);
    avisar('Pedido actualizado', 'ok');
  } else {
    BD.deseos.unshift({ id: nuevoId(), usuario: u.id, ...datos, avisados: [],
                        creado: new Date().toISOString() });
    avisar('Pedido guardado. Te avisamos apenas alguien lo publique 🎯', 'ok');
  }
  guardar();
  cerrar('mDeseo'); $('#formDeseo').reset(); $('#deId').value = '';

  /* si ya existe algo publicado que coincide, avisar de una vez */
  const yaHay = BD.articulos.filter(a => a.estado === 'disponible' && a.usuario !== u.id &&
    coincideDeseo(BD.deseos.find(d => d.usuario === u.id && d.titulo === titulo) || {}, a));
  if (yaHay.length) avisar(`Ya hay ${yaHay.length} publicación(es) que coinciden 👀`, 'ok');
  pintarDeseos(); pintarPanelPro();
}

function pintarDeseos() {
  const u = yo();
  const caja = $('#listaDeseos');
  if (!caja || !u) return;
  const mios = BD.deseos.filter(d => d.usuario === u.id);
  caja.innerHTML = mios.length ? mios.map(d => {
    const coinciden = BD.articulos.filter(a => a.estado === 'disponible' && a.usuario !== u.id && coincideDeseo(d, a));
    return `<div class="deseo ${d.activo ? '' : 'apagado'}">
      <div class="deseo-cab">
        <b>❤️ LO QUIERO: ${esc(d.titulo)}</b>
        ${d.vip ? `<span class="eti mora">💎 ${esc(d.vip)}</span>` : ''}
        <span class="eti ${d.activo ? 'verde' : 'gris'}">${d.activo ? 'Buscando' : 'Pausado'}</span>
      </div>
      <p class="deseo-of">Ofrezco: <b>${esc(d.ofrezco)}</b>${d.adicional ? ` <span class="eti oro">+ S/ ${d.adicional}</span>` : ''}</p>
      ${coinciden.length
        ? `<p class="deseo-hit">🔥 ${coinciden.length} publicación(es) coinciden ahora mismo:</p>
           <div class="deseo-hits">${coinciden.slice(0, 4).map(a => `
             <button class="hit" data-art="${a.id}"><img src="${foto(a)}" alt="">
               <span>${esc(a.titulo)}</span></button>`).join('')}</div>`
        : `<p class="nota">Todavía nadie publica algo así. Te avisamos apenas pase.</p>`}
      <div class="deseo-acc">
        <button class="btn-t" data-deseoedit="${d.id}">Editar</button>
        <button class="btn-t" data-deseopausa="${d.id}">${d.activo ? 'Pausar' : 'Reactivar'}</button>
        <button class="btn-t rojo" data-deseoborrar="${d.id}">Eliminar</button>
      </div></div>`;
  }).join('') : `<p class="nota">Todavía no pediste nada. Toca “❤️ Quiero esto” y dinos qué buscas
      y qué entregas a cambio: el sistema te avisa solo cuando aparezca.</p>`;
}

function abrirDeseo(id) {
  const u = yo();
  if (!u) { abrirAuth('login'); return avisar('Entra a tu cuenta'); }
  if (!u.premium) {
    cerrarTodo();
    return confirmar('“Quiero esto” es Premium',
      `Con Premium (S/ ${BD.config.precioPremium} al mes) dices qué buscas y qué entregas, y el sistema te avisa solo cuando alguien lo publique.`,
      () => irA('premium'), 'Ver Premium');
  }
  $('#formDeseo').reset();
  $('#deCat').innerHTML = '<option value="">Cualquier categoría</option>' +
    CATEGORIAS.map((c, i) => `<option value="${i + 1}">${c[1]} ${c[0]}</option>`).join('');
  $('#deVip').innerHTML = '<option value="">No es VIP</option>' +
    CATEGORIAS_VIP.map(c => `<option value="${c[0]}">${c[1]} ${c[0]}</option>`).join('');
  const d = id ? BD.deseos.find(x => x.id == id) : null;
  $('#deId').value = d ? d.id : '';
  if (d) {
    $('#deTitulo').value = d.titulo; $('#dePalabras').value = d.palabras || '';
    $('#deCat').value = d.categoria || ''; $('#deVip').value = d.vip || '';
    $('#deOfrezco').value = d.ofrezco; $('#deAdicional').value = d.adicional || '';
  }
  abrir('mDeseo');
}

/* ---------------------------------------------------------------------
   4) TRUEQUES VIP — categoría exclusiva para Premium
   --------------------------------------------------------------------- */
function articulosVip() {
  return BD.articulos.filter(a => a.vip && a.estado !== 'oculto');
}
function pintarVip() {
  const u = yo(), pro = !!(u && (u.premium || u.rol === 'admin'));
  const lista = articulosVip();
  $('#vipChips').innerHTML = CATEGORIAS_VIP.map(c => {
    const n = lista.filter(a => a.vip === c[0] && a.estado === 'disponible').length;
    return `<button class="vip-chip ${App.filtroVip === c[0] ? 'on' : ''}" data-vipcat="${esc(c[0])}">
      <span>${c[1]}</span> ${esc(c[0])} <b>${n}</b></button>`;
  }).join('');

  const filtrada = App.filtroVip ? lista.filter(a => a.vip === App.filtroVip) : lista;
  $('#vipLista').innerHTML = filtrada.length
    ? filtrada.map(a => tarjeta(a, !pro)).join('')
    : `<div class="vacio"><div class="em">💎</div><p>Todavía no hay artículos en esa vitrina.</p></div>`;
  $('#vipAviso').innerHTML = pro
    ? `<span class="eti mora">💎 Tienes acceso completo</span>
       <button class="btn mora sm" data-accion="publicar-vip">+ Publicar en VIP</button>`
    : `<span class="eti oro">🔒 Solo los Premium publican y proponen aquí</span>
       <button class="btn mora sm" data-accion="premium">Hazte Premium por S/ ${BD.config.precioPremium}</button>`;
}

/* ---------------------------------------------------------------------
   5) TOP TRUEQUEADORES
   --------------------------------------------------------------------- */
function ranking(limite = 10) {
  return BD.usuarios
    .filter(u => u.estado === 'activo')
    .map(u => ({ u, tq: truequesDe(u.id), rep: reputacion(u.id) }))
    .sort((a, b) => b.tq - a.tq || b.rep.prom - a.rep.prom || a.u.id - b.u.id)
    .slice(0, limite);
}
function pintarRanking() {
  const lista = ranking(10);
  const medalla = i => ['🥇', '🥈', '🥉'][i] || `<span class="pos">${i + 1}</span>`;
  $('#topLista').innerHTML = lista.map((x, i) => `
    <div class="top-fila ${x.u.premium ? 'pro' : ''} ${i < 3 ? 'podio' : ''}" data-perfil="${x.u.id}">
      <span class="medalla">${medalla(i)}</span>
      ${avatarHTML(x.u, 'av-g')}
      <div class="top-info">
        <b>${esc(x.u.nombre)} ${x.u.premium ? '<span class="corona">👑</span>' : ''}</b>
        <span class="estrellas">${estrellas(x.rep.prom)}<span class="n">${x.rep.prom.toFixed(1)} · 📍 ${esc(x.u.ciudad)}</span></span>
      </div>
      <span class="top-num">${x.tq}<small>trueques</small></span>
    </div>`).join('') || '<p class="nota">Todavía no hay trueques completados.</p>';
}

/* ---------------------------------------------------------------------
   6) VER INTERESADOS (los nombres son solo para Premium)
   --------------------------------------------------------------------- */
function interesadosDe(art) {
  const ids = new Set();
  BD.favoritos.filter(f => f.articulo === art.id && f.usuario !== art.usuario).forEach(f => ids.add(f.usuario));
  BD.intercambios.filter(x => x.pido === art.id && ['pendiente','aceptado'].includes(x.estado))
    .forEach(x => ids.add(x.de));
  BD.chats.filter(c => c.articulo === art.id).forEach(c =>
    c.usuarios.filter(i => i !== art.usuario).forEach(i => ids.add(i)));
  return [...ids].map(id => {
    const u = usuario(id);
    if (!u) return null;
    const prop = BD.intercambios.find(x => x.pido === art.id && x.de === id);
    const ofrece = prop && prop.ofrezco ? BD.articulos.find(a => a.id === prop.ofrezco) : null;
    return { u, prop, ofrece, rep: reputacion(id) };
  }).filter(Boolean);
}
function verInteresados(artId) {
  const u = yo(), a = BD.articulos.find(x => x.id == artId);
  if (!a || !u) return;
  const gente = interesadosDe(a);
  const pro = u.premium || u.rol === 'admin';

  $('#interCuerpo').innerHTML = `
    <h2>❤️ ${gente.length} persona${gente.length === 1 ? '' : 's'} interesada${gente.length === 1 ? '' : 's'}</h2>
    <p class="sub">En “${esc(a.titulo)}”</p>
    ${!gente.length ? '<p class="nota">Todavía nadie marcó interés en esta publicación.</p>' : pro ? `
      <div class="inter-lista">${gente.map(g => `
        <div class="pro-fila">
          ${avatarHTML(g.u, 'av-g')}
          <div class="info">
            <b>${esc(g.u.nombre)} ${g.u.premium ? '<span class="corona">👑</span>' : ''}</b>
            <span class="estrellas">${estrellas(g.rep.prom)}<span class="n">${g.rep.prom.toFixed(1)} · ${truequesDe(g.u.id)} trueques · 📍 ${esc(g.u.ciudad)}</span></span>
            <span>${g.ofrece ? '🔁 Te ofrece: <b>' + esc(g.ofrece.titulo) + '</b>'
                   : g.prop ? '💬 Envió una propuesta con mensaje' : '❤️ Lo guardó en favoritos'}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn-t" data-chat-usuario="${g.u.id}|${a.id}">💬 Escribir</button>
            ${g.u.telefono ? `<a class="btn-t" target="_blank" rel="noopener"
              href="${esc(linkWA(g.u.telefono, `Hola ${g.u.nombre}, vi que te interesa mi "${a.titulo}" en Truequea PE.`))}">WhatsApp</a>` : ''}
          </div>
        </div>`).join('')}</div>`
    : `<div class="borroso">
        ${gente.map(g => `<div class="pro-fila">
          <div class="av-g">?</div>
          <div class="info"><b>${esc(g.u.nombre.slice(0, 1))}•••••</b>
            <span>Interesado · ${truequesDe(g.u.id)} trueques</span></div></div>`).join('')}
       </div>
       <div class="candado">
         <div class="em">🔒</div>
         <b>Sabes cuántos son, pero no quiénes</b>
         <p>Con Premium ves sus nombres, sus estrellas y qué te ofrecen a cambio, y les escribes
            directo por chat o WhatsApp.</p>
         <button class="btn mora" data-accion="premium">Ver interesados con Premium — S/ ${BD.config.precioPremium}</button>
       </div>`}`;
  abrir('mInteresados');
}

/* ---------------------------------------------------------------------
   7) IMPULSAR PUBLICACIÓN (S/ 1 por 24 o 48 horas)
   --------------------------------------------------------------------- */
function abrirImpulso(artId) {
  const u = yo();
  if (!u) { abrirAuth('login'); return; }
  const a = BD.articulos.find(x => x.id == artId);
  if (!a) return;
  if (a.usuario !== u.id && u.rol !== 'admin') return avisar('Solo puedes impulsar tus publicaciones', 'err');
  App.pagoTipo = 'impulso'; App.pagoArt = a.id;
  $('#impTitulo').textContent = a.titulo;
  $('#impHoras').innerHTML = IMPULSO_OPCIONES.map(h =>
    `<option value="${h}">${h} horas — S/ ${(BD.config.precioImpulso * (h / 24)).toFixed(2)}</option>`).join('');
  $('#impMiniFoto').src = foto(a);
  cerrar('mFicha'); abrir('mImpulsar');
}
function pedirImpulso() {
  const u = yo(); if (!u) return;
  const a = BD.articulos.find(x => x.id == App.pagoArt);
  if (!a) return;
  const horas = Number($('#impHoras').value) || 24;
  const monto = Number((BD.config.precioImpulso * (horas / 24)).toFixed(2));
  App.pagoTipo = 'impulso';
  App.pagoDatos = { articulo: a.id, horas, monto };
  cerrar('mImpulsar');
  abrirPagoYape('impulso', monto,
    `Impulsar “${a.titulo}” por ${horas} horas`,
    'Tu publicación sube al primer lugar apenas el administrador confirme el pago.');
}

/* ---------------------------------------------------------------------
   8) TRUEQUE SEGURO (S/ 1 por operación)
   --------------------------------------------------------------------- */
function abrirSeguro(trqId) {
  const u = yo(); if (!u) return;
  const x = BD.intercambios.find(i => i.id == trqId);
  if (!x) return;
  const otro = usuario(x.de === u.id ? x.para : x.de);
  const pido = BD.articulos.find(a => a.id === x.pido);
  const c = confianza(otro);
  $('#segCuerpo').innerHTML = `
    <h2>🛡️ Trueque Seguro</h2>
    <p class="sub">Por S/ ${Number(BD.config.precioSeguro).toFixed(2)} el administrador acompaña este
      trueque y lo da por válido solo cuando los dos confirman.</p>
    <div class="seg-lista">
      <div><b>1. Revisión de la otra persona</b><span>Miramos sus estrellas, sus trueques y su cuenta.</span></div>
      <div><b>2. Revisión de las fotos</b><span>Avisamos si una foto ya está publicada en otra cuenta.</span></div>
      <div><b>3. Punto de encuentro obligatorio</b><span>El trueque se hace en una zona segura de la lista.</span></div>
      <div><b>4. Confirmación de los dos lados</b><span>Recién ahí se marca como completado y verificado.</span></div>
    </div>
    ${cajaConfianza(otro, pido)}
    <button class="btn mora full" style="margin-top:14px" data-pagarseguro="${x.id}">
      🛡️ Contratar por S/ ${Number(BD.config.precioSeguro).toFixed(2)}</button>`;
  cerrar('mTrueque'); abrir('mSeguro');
}
function pedirSeguro(trqId) {
  const u = yo(); if (!u) return;
  const x = BD.intercambios.find(i => i.id == trqId);
  if (!x) return;
  App.pagoTipo = 'seguro';
  App.pagoDatos = { intercambio: x.id, monto: Number(BD.config.precioSeguro) };
  cerrar('mSeguro');
  abrirPagoYape('seguro', Number(BD.config.precioSeguro),
    'Trueque Seguro',
    'Al aprobar el pago, el administrador acompaña y verifica este trueque.');
}

/* ---------------------------------------------------------------------
   9) PAGO POR YAPE REUTILIZABLE (premium, impulso y seguro)
   --------------------------------------------------------------------- */
function abrirPagoYape(tipo, monto, titulo, detalle) {
  const u = yo();
  if (!u) { abrirAuth('login'); return avisar('Entra a tu cuenta primero'); }
  App.pagoTipo = tipo;
  App.fotoPago = null;
  $('#formPago').reset();
  $('#zonaPago').textContent = '📸 Clic para subir la captura del Yape';
  $('#pagoTitulo').textContent = titulo || 'Subir comprobante de Yape';
  $('#pagoDetalle').textContent = detalle || '';
  $('#pagoMonto').textContent = Number(monto).toFixed(2);
  $('#pagoYapeNom').textContent = BD.config.yapeNombre || 'Angel Levano';
  $('#pagoQr').innerHTML = BD.config.yapeQr
    ? `<img class="yape-qr" src="${BD.config.yapeQr}" alt="QR de Yape">` : '';
  abrir('mPago');
}


/* =====================================================================
   MÓDULO PRO
   · Mapa real (OpenStreetMap) con respaldo al mapa dibujado
   · Lectura automática del comprobante de Yape (OCR)
   · Registro exprés en 10 segundos
   · Plus del Premium: nivel, impulsos de regalo, estadísticas
   ===================================================================== */

const CDN = {
  leafletCss: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  leafletJs : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  ocr       : 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js',
};

function cargarCss(url) {
  return new Promise(ok => {
    if (document.querySelector(`link[href="${url}"]`)) return ok(true);
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = url;
    l.onload = () => ok(true); l.onerror = () => ok(false);
    document.head.appendChild(l);
  });
}
function cargarJs(url) {
  return new Promise(ok => {
    if (document.querySelector(`script[src="${url}"]`)) return ok(true);
    const s = document.createElement('script');
    s.src = url; s.async = true;
    s.onload = () => ok(true); s.onerror = () => ok(false);
    document.head.appendChild(s);
  });
}

/* =====================================================================
   1) MAPA REAL — calles de verdad cuando hay internet
   ===================================================================== */
const MAPAS = { inicio: null, pro: null, capaInicio: null, capaPro: null, listo: null };

/* Se intenta una sola vez por sesión: si no hay internet, no molesta más */
function hayLeaflet() {
  if (window.L) return Promise.resolve(true);
  if (MAPAS.listo) return MAPAS.listo;
  MAPAS.listo = (async () => {
    await cargarCss(CDN.leafletCss);
    const ok = await cargarJs(CDN.leafletJs);
    return ok && !!window.L;
  })();
  return MAPAS.listo;
}

function iconoPin(color, emoji) {
  return L.divIcon({
    className: 'pin-real',
    html: `<span class="pin-burbuja" style="--c:${color}">${emoji}</span>`,
    iconSize: [34, 34], iconAnchor: [17, 32], popupAnchor: [0, -30],
  });
}
function popupArticulo(a) {
  const d = usuario(a.usuario);
  const u = yo();
  const km = u && u.lat && a.lat ? distanciaTxt(distanciaKm(u.lat, u.lon, a.lat, a.lon)) : '';
  return `<div class="pop">
    <img src="${foto(a)}" alt="">
    <b>${esc(a.titulo)}</b>
    <span>🔁 ${esc(a.busca)}</span>
    <span>📍 ${esc(a.ciudad)}${km ? ' · ' + km : ''} · ${esc(d ? d.nombre : '')}</span>
    ${a.vip ? '<span class="eti mora">💎 VIP</span>' : ''}
    <button class="btn pri sm" data-art="${a.id}">Ver publicación</button>
  </div>`;
}

/* Sin internet no hay calles: se queda el mapa dibujado y se avisa una vez */
function avisoSinRed(idSvg) {
  const svg = document.getElementById(idSvg);
  if (!svg || svg.dataset.aviso) return;
  svg.dataset.aviso = '1';
  const caja = svg.closest('.mapa-caja');
  if (!caja || caja.querySelector('.sin-red-nota')) return;
  const n = document.createElement('div');
  n.className = 'sin-red-nota';
  n.innerHTML = '🛰️ Sin internet: se muestra el mapa dibujado. Conéctate y recarga para ver' +
                ' las calles reales.';
  caja.appendChild(n);
}

/* Dibuja el mapa real del inicio. Si no hay internet, deja el mapa SVG. */
async function mapaRealInicio() {
  const caja = document.getElementById('mapaReal');
  if (!caja) return false;
  if (!(await hayLeaflet())) { avisoSinRed('mapa'); return false; }

  document.getElementById('mapa').style.display = 'none';
  caja.style.display = 'block';

  if (!MAPAS.inicio) {
    MAPAS.inicio = L.map(caja, { scrollWheelZoom: false, attributionControl: true })
      .setView([-13.4098, -76.1322], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap',
    }).addTo(MAPAS.inicio);
    MAPAS.inicio.on('click', () => MAPAS.inicio.scrollWheelZoom.enable());
    MAPAS.capaInicio = L.layerGroup().addTo(MAPAS.inicio);
  }
  MAPAS.capaInicio.clearLayers();

  const u = yo();
  const arts = filtrar().filter(a => a.lat && a.lon && a.estado !== 'oculto');
  const puntos = [];

  ZONAS_SEGURAS.forEach(z => {
    L.circleMarker([z.lat, z.lon], { radius: 7, color: '#12703c', fillColor: '#12703c', fillOpacity: .85, weight: 2 })
      .bindPopup(`<b>🛡️ Zona segura</b><br>${esc(z.nombre)}`)
      .addTo(MAPAS.capaInicio);
  });

  arts.forEach(a => {
    const imp = impulsoActivo(a), res = reservaActiva(a);
    const color = imp ? '#2f7bf6' : res ? '#8b5cf6' : a.vip ? '#7b3fe4' : a.destacado ? '#e0a92e' : '#ff7a1a';
    const emo = imp ? '🚀' : res ? '🔒' : a.vip ? '💎' : '📦';
    L.marker([a.lat, a.lon], { icon: iconoPin(color, emo) })
      .bindPopup(popupArticulo(a), { maxWidth: 240 })
      .addTo(MAPAS.capaInicio);
    puntos.push([a.lat, a.lon]);
  });

  if (u && u.lat && u.lon) {
    L.marker([u.lat, u.lon], { icon: iconoPin('#0b63d6', '🙋') })
      .bindPopup('<b>Estás aquí</b>').addTo(MAPAS.capaInicio);
    puntos.push([u.lat, u.lon]);
  }
  if (puntos.length) MAPAS.inicio.fitBounds(puntos, { padding: [40, 40], maxZoom: 14 });
  setTimeout(() => MAPAS.inicio.invalidateSize(), 200);
  return true;
}

/* Mapa real del Premium: con círculos de distancia y ubicación exacta */
async function mapaRealPro() {
  const caja = document.getElementById('mapaProReal');
  const u = yo();
  if (!caja || !u || !u.premium) return false;
  if (!(await hayLeaflet())) { avisoSinRed('mapaPro'); return false; }

  document.getElementById('mapaPro').style.display = 'none';
  caja.style.display = 'block';

  if (!MAPAS.pro) {
    MAPAS.pro = L.map(caja, { scrollWheelZoom: false }).setView([-13.4098, -76.1322], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap',
    }).addTo(MAPAS.pro);
    MAPAS.pro.on('click', () => MAPAS.pro.scrollWheelZoom.enable());
    MAPAS.capaPro = L.layerGroup().addTo(MAPAS.pro);
  }
  MAPAS.capaPro.clearLayers();

  const arts = articulosPro();
  const puntos = [];

  if (u.lat && u.lon) {
    [1, 3, 10].forEach(km => {
      L.circle([u.lat, u.lon], { radius: km * 1000, color: '#ffd76a', weight: 1.2,
        dashArray: '6 8', fillOpacity: .04 })
        .bindTooltip(`${km} km`, { permanent: false }).addTo(MAPAS.capaPro);
    });
    L.marker([u.lat, u.lon], { icon: iconoPin('#ffd76a', '⭐') })
      .bindPopup('<b>Tu ubicación</b>').addTo(MAPAS.capaPro);
    puntos.push([u.lat, u.lon]);
  }

  arts.forEach(a => {
    const res = reservaActiva(a);
    const mia = res && res.por === u.id;
    const color = mia ? '#ffd76a' : res ? '#8b93a5' : a.vip ? '#c084fc' : '#ff9f45';
    L.marker([a.lat, a.lon], { icon: iconoPin(color, a.vip ? '💎' : '📦') })
      .bindPopup(popupArticulo(a) +
        `<div class="pop-exacto">📌 ${Number(a.lat).toFixed(5)}, ${Number(a.lon).toFixed(5)}
         <a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${a.lat},${a.lon}">Google Maps</a></div>`,
        { maxWidth: 250 })
      .addTo(MAPAS.capaPro);
    puntos.push([a.lat, a.lon]);
  });

  if (puntos.length) MAPAS.pro.fitBounds(puntos, { padding: [40, 40], maxZoom: 15 });
  setTimeout(() => MAPAS.pro.invalidateSize(), 200);
  return true;
}

/* =====================================================================
   2) LECTURA AUTOMÁTICA DEL YAPE
   El sistema lee la captura, comprueba el monto, el nombre y el número
   de operación, y activa el Premium solo si todo cuadra.
   ===================================================================== */
let OCR_LISTO = null;
async function hayOCR() {
  if (window.Tesseract) return true;
  if (OCR_LISTO !== null) return OCR_LISTO;
  OCR_LISTO = await cargarJs(CDN.ocr) && !!window.Tesseract;
  return OCR_LISTO;
}
function limpiar(t) {
  return String(t || '').toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

/* Revisa el texto leído de la captura */
function analizarYape(texto, montoPedido) {
  const t = limpiar(texto);
  const motivos = [];

  const esYape = /YAPE|YAPEAS|YAPEO|TE YAPEO|PAGO EXITOSO|TRANSFERENCIA EXITOSA/.test(t);
  if (!esYape) motivos.push('No parece una captura de Yape.');

  /* montos que aparecen después de S/ */
  const montos = [...t.matchAll(/S\s*\/?\s*([0-9]{1,4}(?:[.,][0-9]{1,2})?)/g)]
    .map(m => parseFloat(m[1].replace(',', '.'))).filter(n => !isNaN(n));
  const monto = montos.length ? Math.max(...montos) : null;
  if (monto === null) motivos.push('No encontramos el monto en la imagen.');
  else if (monto + 0.001 < montoPedido) motivos.push(`El monto leído es S/ ${monto.toFixed(2)} y se pide S/ ${montoPedido.toFixed(2)}.`);

  /* nombre de quien recibe */
  const destino = limpiar(BD.config.yapeNombre || 'Angel Levano').split(' ').filter(Boolean);
  const nombre = destino[0] || 'ANGEL';
  const apellido = destino[1] || '';
  const nombreOk = t.includes(nombre) &&
    (!apellido || t.includes(apellido) || new RegExp(nombre + '\\s+' + apellido[0] + '\\b').test(t));
  if (!nombreOk) motivos.push(`No vimos el nombre de ${BD.config.yapeNombre || 'Angel Levano'} en la captura.`);

  /* número de operación */
  const op = t.match(/(?:OPERACION|OPERACIÓN|CODIGO|CÓDIGO|N[°º]|NRO|NUMERO)\D{0,14}(\d{5,})/) ||
             t.match(/\b(\d{8,})\b/) || t.match(/\b(\d{6,7})\b/);
  const codigo = op ? op[1] : null;
  if (!codigo) motivos.push('No encontramos el número de operación.');

  const repetido = codigo && (BD.config.yapeCodigos || []).includes(codigo);
  if (repetido) motivos.push('Esa captura ya se usó antes para otro pago.');

  return { ok: !motivos.length, monto, nombreOk, codigo, repetido, motivos, texto: t.slice(0, 400) };
}

/* Lee la imagen y devuelve el análisis */
async function revisarComprobante(dataURL, montoPedido) {
  if (!(await hayOCR())) return { disponible: false };
  try {
    const r = await Tesseract.recognize(dataURL, 'spa', {});
    return { disponible: true, ...analizarYape(r.data.text, montoPedido) };
  } catch (e) {
    return { disponible: false, error: e.message };
  }
}

/* Muestra en pantalla lo que fue leyendo */
function estadoLectura(html, clase = '') {
  const c = document.getElementById('lecturaYape');
  if (c) { c.className = 'lectura ' + clase; c.innerHTML = html; c.hidden = false; }
}

/* =====================================================================
   3) REGISTRO EXPRÉS — nombre, celular y 4 números
   ===================================================================== */
function abrirExpress() {
  $('#formExpress').reset();
  $('#exCiudad').innerHTML = LISTA_CIUDADES.map(c => `<option>${c}</option>`).join('');
  $('#exCiudad').value = 'Chincha Alta';
  $('#errEx').hidden = true;
  cerrar('mAuth'); abrir('mExpress');
}
function crearExpress() {
  const nombre = $('#exNombre').value.trim();
  const tel = $('#exTel').value.replace(/\D/g, '');
  const pin = $('#exPin').value.replace(/\D/g, '');
  const err = m => { const c = $('#errEx'); c.textContent = m; c.hidden = false; };

  if (nombre.length < 2) return err('Escribe tu nombre.');
  if (tel.length < 9)    return err('Escribe tu celular (9 números).');
  if (pin.length !== 4)  return err('El PIN debe tener 4 números.');
  if (BD.usuarios.some(u => (u.telefono || '').replace(/\D/g, '') === tel))
    return err('Ese celular ya tiene cuenta. Entra con tu PIN.');

  const base = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '') || 'usuario';
  const r = registrar({
    nombre, email: `${base}${tel.slice(-4)}@truequea.pe`, pass: pin, pin,
    telefono: tel, ciudad: $('#exCiudad').value, express: true,
  });
  if (r.err) return err(r.err);
  cerrar('mExpress');
  trasEntrar(r.usuario, `¡Listo, ${r.usuario.nombre}! Tu cuenta ya está creada`);
  mostrarCodigo(r.usuario);
}

/* =====================================================================
   4) EL PLUS DEL PREMIUM
   ===================================================================== */
function pintarPlusPro() {
  const u = yo();
  const caja = $('#plusPro');
  if (!caja) return;
  if (!u || !u.premium) { caja.hidden = true; return; }
  caja.hidden = false;

  const n = nivelPro(u);
  const libres = impulsosDisponibles(u);
  const mios = BD.articulos.filter(a => a.usuario === u.id);
  const vistas = mios.reduce((s, a) => s + (a.vistas || 0), 0);
  const favs = mios.reduce((s, a) => s + (a.favs || 0), 0);
  const interesados = mios.reduce((s, a) => s + interesadosDe(a).length, 0);
  const rep = reputacion(u.id);
  const top = ranking(50).findIndex(x => x.u.id === u.id) + 1;

  const barra = n.siguiente
    ? Math.min(100, Math.round((n.trueques - n.min) / (n.siguiente.min - n.min) * 100)) : 100;

  caja.innerHTML = `
    <div class="pro-tarjetas">
      <!-- tarjeta 3D del nivel -->
      <div class="tarjeta3d nivel" style="--brillo:${n.color}">
        <div class="cara3d">
          <span class="chip3d">TARJETA PREMIUM</span>
          <div class="nivel-emo">${n.emo}</div>
          <b class="nivel-nom">Nivel ${esc(n.nombre)}</b>
          <span class="nivel-user">${esc(u.nombre)}</span>
          <div class="nivel-barra"><i style="width:${barra}%"></i></div>
          <span class="nivel-pie">${n.siguiente
            ? `Te faltan ${n.faltan} trueque(s) para ${n.siguiente.emo} ${n.siguiente.nombre}`
            : 'Llegaste al nivel más alto 🎉'}</span>
        </div>
      </div>

      <!-- impulsos de regalo -->
      <div class="tarjeta3d regalo">
        <div class="cara3d">
          <span class="chip3d">REGALO DEL MES</span>
          <div class="nivel-emo">🚀</div>
          <b class="nivel-nom">${libres} impulso${libres === 1 ? '' : 's'} gratis</b>
          <span class="nivel-user">Sube una publicación al primer lugar sin pagar</span>
          <button class="btn oro sm" data-accion="usar-impulso" ${libres ? '' : 'disabled'}>
            ${libres ? 'Usar uno ahora' : 'Ya usaste los 3 de este mes'}</button>
        </div>
      </div>

      <!-- verificación -->
      <div class="tarjeta3d verificado">
        <div class="cara3d">
          <span class="chip3d">CUENTA VERIFICADA</span>
          <div class="nivel-emo">🛡️</div>
          <b class="nivel-nom">${confianza(u).puntos}/100 de confianza</b>
          <span class="nivel-user">Tu insignia sale en cada publicación y en el chat</span>
          <span class="eti oro">${esc(confianza(u).etiqueta)}</span>
        </div>
      </div>
    </div>

    <div class="pro-stats">
      <div><b>${vistas}</b><span>👁 Vistas de mis cosas</span></div>
      <div><b>${favs}</b><span>❤️ Guardados</span></div>
      <div><b>${interesados}</b><span>🔥 Interesados</span></div>
      <div><b>${rep.prom.toFixed(1)}</b><span>⭐ Mis estrellas</span></div>
      <div><b>#${top || '—'}</b><span>🏆 Puesto en el ranking</span></div>
      <div><b>${mios.length}</b><span>📦 Publicaciones</span></div>
    </div>

    <div class="pro-mias">
      <h4>📊 Cómo va cada publicación mía</h4>
      ${mios.length ? mios.slice(0, 6).map(a => {
        const max = Math.max(1, ...mios.map(x => x.vistas || 0));
        return `<div class="mia-fila">
          <img src="${foto(a)}" alt="" data-art="${a.id}">
          <div class="mia-info">
            <b>${esc(a.titulo)}</b>
            <div class="mia-barra"><i style="width:${((a.vistas || 0) / max * 100).toFixed(0)}%"></i></div>
          </div>
          <span class="mia-num">👁 ${a.vistas || 0} · ❤️ ${a.favs || 0}</span>
          <button class="btn-t" data-interesados="${a.id}">Interesados</button>
        </div>`;
      }).join('') : '<p class="nota">Todavía no publicaste nada.</p>'}
    </div>

    <div class="pro-soporte">
      <div><b>⚡ Soporte Premium directo</b>
        <span>Escríbele al administrador y te responde primero.</span></div>
      <a class="wa" target="_blank" rel="noopener"
         href="${esc(waAdmin(`Hola, soy ${u.nombre}, cuenta Premium de Truequea PE. Necesito ayuda con:`))}">
         💬 Escribir al soporte</a>
    </div>`;
}

/* Usar uno de los impulsos de regalo */
function usarImpulsoGratis() {
  const u = yo();
  if (!u || !u.premium) return;
  if (impulsosDisponibles(u) <= 0) return avisar('Ya usaste los 3 impulsos de este mes', 'err');
  const mios = BD.articulos.filter(a => a.usuario === u.id && !impulsoActivo(a));
  if (!mios.length) return avisar('No tienes publicaciones para impulsar', 'err');

  const opciones = mios.slice(0, 8).map(a =>
    `<button class="btn suave sm" data-impulsogratis="${a.id}" style="width:100%;justify-content:flex-start;margin-bottom:6px">
       📦 ${esc(a.titulo)}</button>`).join('');
  confirmar('Usar un impulso de regalo',
    `Te quedan ${impulsosDisponibles(u)} este mes. Elige cuál subir al primer lugar por 24 horas.`,
    () => {}, 'Cerrar', opciones);
}
function aplicarImpulsoGratis(artId) {
  const u = yo();
  const a = BD.articulos.find(x => x.id == artId);
  if (!u || !a || impulsosDisponibles(u) <= 0) return;
  a.impulso = { desde: new Date().toISOString(),
                hasta: new Date(Date.now() + 24 * 3600000).toISOString(), regalo: true };
  u.impulsosGratis = Math.max(0, (u.impulsosGratis || 0) - 1);
  guardar();
  cerrar('mConfirmar');
  avisar(`🚀 "${a.titulo}" está en el primer lugar por 24 horas`, 'ok');
  pintarLista(); pintarPanelPro();
}


/* =====================================================================
   Eventos y arranque
   ===================================================================== */

document.addEventListener('click', ev => {
  /* cerrar el menú del avatar al hacer clic fuera */
  if (!ev.target.closest('.menu')) $('#menuCaja')?.classList.remove('abierto');
  if (ev.target.classList.contains('capa')) ev.target.classList.remove('on');

  const t = ev.target.closest('[data-ir],[data-accion],[data-cerrar],[data-cat],[data-art],[data-fav],'
    + '[data-quitar],[data-anuncio],[data-editar],[data-borrar],[data-estado],[data-destacar],'
    + '[data-proponer],[data-chat],[data-chat-usuario],[data-abrirchat],[data-perfil],[data-resp],'
    + '[data-trueque],[data-cancelar-tq],[data-confirmar-tq],[data-encuentro],[data-calificar],'
    + '[data-foto],[data-quitarfoto],[data-info],[data-pin],[data-pago],[data-premium],[data-suspender],'
    + '[data-borraruser],[data-anpausa],[data-anborrar],[data-vercaptura],'
    + '[data-interes],[data-reservar],[data-soltar],[data-anaprobar],[data-frase],[data-pinpro],'
    + '[data-verfoto],[data-abrirwa],[data-vipcat],[data-interesados],[data-impulsar],[data-analizar],'
    + '[data-seguro],[data-pagarseguro],[data-verificarseg],[data-deseoedit],[data-deseopausa],'
    + '[data-deseoborrar],[data-impulsogratis]');
  if (!t) return;
  const d = t.dataset;
  const u = yo();

  try {
    if (d.ir) irA(d.ir);
    if (d.cerrar !== undefined) t.closest('.capa').classList.remove('on');

    /* ---- acciones generales ---- */
    if (d.accion === 'entrar')   abrirAuth('login');
    if (d.accion === 'publicar') abrirPublicar();
    if (d.accion === 'menu')     { ev.stopPropagation(); $('#menuCaja').classList.toggle('abierto'); }
    if (d.accion === 'mensajes') listaChats();
    if (d.accion === 'premium')  irA('premium');
    if (d.accion === 'tema') aplicarTema(document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro');
    if (d.accion === 'anunciate') { cerrarTodo(); abrir('mAnunciate'); }
    if (d.accion === 'nuevo-deseo') abrirDeseo();
    if (d.accion === 'usar-impulso') usarImpulsoGratis();
    if (d.impulsogratis) aplicarImpulsoGratis(d.impulsogratis);
    if (d.accion === 'publicar-vip') { App.publicandoVip = true; abrirPublicar(); }
    if (d.accion === 'pagar-premium') {
      abrirPagoYape('premium', BD.config.precioPremium, 'Activar Premium',
        'Sube la captura del Yape y el administrador activará tu cuenta Premium.');
    }
    if (d.accion === 'vertodos-anuncios') $('#anunciate').scrollIntoView({ behavior:'smooth' });
    if (d.accion === 'salir') {
      salir(); pintarNav(); irA('inicio'); pintarLista(); avisar('Sesión cerrada');
    }
    if (d.accion === 'notis') {
      if (!u) return abrirAuth('login');
      const mias = BD.notis.filter(n => n.usuario === u.id);
      $('#listaNotis').innerHTML = mias.length ? mias.map(n => `
        <div class="fila" style="${n.leida ? '' : 'border-color:var(--azul)'}">
          <div class="fila-info"><b>${esc(n.titulo)}</b><span>${esc(n.cuerpo)}</span>
          <span style="font-size:12px">${fechaTxt(n.creado)}</span></div>
          ${n.wa ? `<div class="fila-acc"><a class="wa" target="_blank" rel="noopener"
            href="${esc(n.wa)}">💬 WhatsApp</a></div>` : ''}</div>`).join('')
        : `<div class="vacio"><div class="em">🔔</div><p>No tienes notificaciones.</p></div>`;
      mias.forEach(n => n.leida = true); guardar();
      abrir('mNotis'); pintarNav();
    }

    /* ---- catálogo ---- */
    if (d.cat) {
      App.filtros.cat = App.filtros.cat == d.cat ? '' : d.cat;
      pintarCategorias(); pintarLista(); pintarMapa(); irListado();
    }
    if (d.quitar) {
      App.filtros[d.quitar] = '';
      $('#buscador').value = App.filtros.q;
      $('#fCat').value = App.filtros.cat; $('#fCiudad').value = App.filtros.ciudad;
      $('#fCond').value = App.filtros.cond;
      pintarCategorias(); pintarLista(); pintarMapa();
    }
    if (d.art && !d.fav) verArticulo(d.art);
    if (d.pin) verArticulo(d.pin);
    if (d.fav) {
      ev.stopPropagation();
      if (!u) { abrirAuth('login'); return avisar('Entra para guardar favoritos'); }
      const i = BD.favoritos.findIndex(f => f.usuario === u.id && f.articulo == d.fav);
      if (i >= 0) { BD.favoritos.splice(i, 1); avisar('Quitado de favoritos'); }
      else { BD.favoritos.push({ usuario: u.id, articulo: Number(d.fav) }); avisar('Guardado en favoritos', 'ok'); }
      guardar(); pintarLista(); pintarCuenta();
    }
    if (d.foto) {
      const a = BD.articulos.find(x => x.id == $('#ficha').querySelector('[data-proponer],[data-editar]')?.dataset.proponer);
      $('#fichaFoto').src = t.src;
      $$('.ficha-gal img').forEach(i => i.classList.toggle('on', i === t));
    }

    /* ---- anuncios ---- */
    if (d.anuncio) {
      const ad = BD.anuncios.find(a => a.id == d.anuncio);
      if (!ad) return;
      ad.clics = (ad.clics || 0) + 1; guardar();
      $('#detAnuncio').innerHTML = `
        <div style="position:relative">
          <img src="${ad.img || SIN_FOTO}" style="width:100%;aspect-ratio:16/10;object-fit:cover" alt="">
          <span class="marca-pub" style="position:absolute;top:12px;left:12px">PUBLICIDAD</span>
        </div>
        <div style="padding:20px 22px 24px">
          <h2 style="font-size:23px;margin-bottom:6px">${esc(ad.titulo)}</h2>
          <p style="color:var(--sub);margin-bottom:6px">${esc(ad.empresa || 'Anuncio')}</p>
          <p style="font-size:15px;margin-bottom:18px">${esc(ad.desc)}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${ad.tel ? `<a class="tel" href="tel:${esc(String(ad.tel).replace(/\s/g,''))}">📞 ${esc(ad.tel)}</a>` : ''}
            ${ad.wa ? `<a class="wa" target="_blank" rel="noopener" href="${esc(ad.wa)}">💬 Escribir por WhatsApp</a>` : ''}
            ${ad.web ? `<a class="btn sec" target="_blank" rel="noopener" href="${esc(ad.web)}">🌐 Ver página</a>` : ''}
          </div>
          <p class="legal" style="text-align:left;margin-top:16px">Anuncio publicado por el administrador de ${esc(BD.config.nombre)}.</p>
        </div>`;
      abrir('mAnuncio');
    }

    /* ---- artículos propios ---- */
    if (d.editar)  { cerrarTodo(); abrirPublicar(BD.articulos.find(a => a.id == d.editar)); }
    if (d.borrar) {
      confirmar('Eliminar publicación', 'Esta acción no se puede deshacer.', () => {
        BD.articulos = BD.articulos.filter(a => a.id != d.borrar); guardar();
        cerrarTodo(); avisar('Publicación eliminada', 'ok');
        pintarLista(); pintarCategorias(); pintarMapa(); pintarCuenta(); pintarAdmin();
      }, 'Sí, eliminar');
    }
    if (d.estado) {
      const [id, est] = d.estado.split('|');
      const a = BD.articulos.find(x => x.id == id); a.estado = est; guardar();
      cerrarTodo(); avisar('Estado actualizado', 'ok');
      pintarLista(); pintarMapa(); pintarCuenta();
    }
    if (d.destacar) {
      const a = BD.articulos.find(x => x.id == d.destacar);
      if (u && u.rol === 'admin') { a.destacado = !a.destacado; guardar(); avisar('Actualizado', 'ok'); pintarAdmin(); pintarLista(); }
      else if (u && u.premium) { a.destacado = true; guardar(); cerrarTodo(); avisar('Publicación destacada', 'ok'); pintarLista(); }
      else {
        cerrarTodo();
        confirmar('Destacar publicación', `Destacar es gratis con Premium (S/ ${BD.config.precioPremium} al mes).`,
          () => irA('premium'), 'Ver Premium');
      }
    }

    /* ---- VIP, pedidos, análisis, impulso y seguro ---- */
    if (d.vipcat) {
      App.filtroVip = App.filtroVip === d.vipcat ? '' : d.vipcat;
      pintarVip();
    }
    if (d.interesados) verInteresados(d.interesados);
    if (d.impulsar)    abrirImpulso(d.impulsar);
    if (d.analizar)    analizarPropuesta(d.analizar);
    if (d.seguro)      abrirSeguro(d.seguro);
    if (d.pagarseguro) pedirSeguro(d.pagarseguro);
    if (d.verificarseg) {
      const s = BD.seguros.find(x => x.id == d.verificarseg);
      if (s) {
        s.estado = 'verificado'; s.verificado = new Date().toISOString();
        const x = BD.intercambios.find(i => i.id === s.intercambio);
        if (x) { if (x.seguro) x.seguro.estado = 'verificado';
          [x.de, x.para].forEach(uid => notificar(uid, '🛡️ Trueque verificado',
            'El administrador dio el visto bueno a su trueque.')); }
        guardar(); avisar('Trueque verificado ✔', 'ok'); pintarAdmin();
      }
    }
    if (d.deseoedit)   abrirDeseo(d.deseoedit);
    if (d.deseopausa) {
      const de = BD.deseos.find(x => x.id == d.deseopausa);
      de.activo = !de.activo; guardar();
      avisar(de.activo ? 'Pedido reactivado' : 'Pedido pausado', 'ok');
      pintarDeseos();
    }
    if (d.deseoborrar) {
      confirmar('Eliminar pedido', 'Dejaremos de avisarte cuando aparezca.', () => {
        BD.deseos = BD.deseos.filter(x => x.id != d.deseoborrar);
        guardar(); avisar('Pedido eliminado', 'ok'); pintarDeseos();
      }, 'Sí, eliminar');
    }

    /* ---- interés, reservas y publicidad ---- */
    if (d.pinpro) verArticulo(d.pinpro);
    if (d.interes)  marcarInteres(d.interes);
    if (d.reservar) abrirReserva(d.reservar);
    if (d.soltar) {
      confirmar('Liberar la reserva', 'La publicación vuelve a estar disponible para todos.',
        () => soltarReserva(d.soltar), 'Sí, liberar');
    }
    if (d.anaprobar) {
      const [id, si] = d.anaprobar.split('|');
      if (si === 'si') resolverAnuncio(id, true);
      else confirmar('Quitar la publicidad', 'Dejará de mostrarse en el sitio.',
        () => resolverAnuncio(id, false), 'Sí, quitarla');
    }
    if (d.frase) { $('#chatTexto').value = d.frase; $('#chatTexto').focus(); }
    if (d.verfoto) {
      const m = BD.mensajes.find(x => x.id == d.verfoto);
      if (m && m.foto) {
        $('#infoCuerpo').innerHTML = `<h2>Foto del chat</h2>
          <img src="${m.foto}" style="width:100%;border-radius:14px" alt="Foto enviada en el chat">`;
        abrir('mInfo');
      }
    }

    /* ---- trueques ---- */
    if (d.proponer) abrirPropuesta(d.proponer);
    if (d.chat) {
      const a = BD.articulos.find(x => x.id == d.chat);
      abrirChatCon(a.usuario, a.id);
    }
    if (d.chatUsuario) { const [uid, aid] = d.chatUsuario.split('|'); abrirChatCon(Number(uid), Number(aid)); }
    if (d.abrirchat) { App.chat = Number(d.abrirchat); pintarChat(); cerrar('mMensajes'); abrir('mChat'); }
    if (d.resp) { const [id, r] = d.resp.split('|'); responderPropuesta(id, r); }
    if (d.trueque) verTrueque(d.trueque);
    if (d.confirmarTq) confirmarTrueque(d.confirmarTq);
    if (d.encuentro) {
      const x = BD.intercambios.find(i => i.id == d.encuentro);
      x.lugar = $('#tqLugar').value; x.fecha = $('#tqFecha').value; guardar();
      notificar(x.de === u.id ? x.para : x.de, 'Punto de encuentro',
        `${u.nombre} propuso: ${x.lugar || 'lugar por definir'} ${x.fecha ? '· ' + x.fecha.replace('T',' ') : ''}`);
      avisar('Encuentro guardado', 'ok');
    }
    if (d.cancelarTq) {
      confirmar('Cancelar trueque', 'Los artículos volverán a estar disponibles.', () => {
        const x = BD.intercambios.find(i => i.id == d.cancelarTq);
        x.estado = 'cancelado';
        [x.pido, x.ofrezco].filter(Boolean).forEach(id2 => {
          const a = BD.articulos.find(t2 => t2.id === id2);
          if (a && a.estado === 'reservado') a.estado = 'disponible';
        });
        guardar(); cerrarTodo(); avisar('Trueque cancelado');
        pintarCuenta(); pintarLista();
      }, 'Sí, cancelar');
    }
    if (d.calificar) {
      const x = BD.intercambios.find(i => i.id == d.calificar);
      const otro = usuario(x.de === u.id ? x.para : x.de);
      $('#calId').value = x.id;
      $('#calSub').textContent = `¿Cómo te fue con ${otro.nombre}?`;
      App.puntaje = 0; pintarEstrellas(0);
      abrir('mCalificar');
    }
    if (d.perfil) verPerfil(Number(d.perfil));
    if (d.quitarfoto !== undefined) { App.fotos.splice(Number(d.quitarfoto), 1); pintarMinis(); }
    if (d.info) {
      if (d.info === 'reiniciar') {
        confirmar('Reiniciar datos', 'Se borrarán todos los usuarios, artículos y mensajes de prueba.', () => {
          localStorage.removeItem(LLAVE); location.reload();
        }, 'Sí, reiniciar todo');
      } else {
        $('#infoCuerpo').innerHTML = TEXTOS[d.info] || '';
        abrir('mInfo');
      }
    }

    /* ---- administración ---- */
    if (d.pago) { const [id, si] = d.pago.split('|'); resolverPago(id, si === 'si'); }
    if (d.vercaptura) {
      const p = BD.pagos.find(x => x.id == d.vercaptura);
      $('#infoCuerpo').innerHTML = `<h2>Comprobante de pago</h2>
        <img src="${p.captura}" style="width:100%;border-radius:14px" alt="Comprobante">`;
      abrir('mInfo');
    }
    if (d.premium) {
      const us = usuario(Number(d.premium));
      us.premium = !us.premium;
      if (us.premium) { const h = new Date(); h.setMonth(h.getMonth() + 1); us.premiumHasta = h.toISOString(); }
      else us.premiumHasta = null;
      guardar(); avisar(us.premium ? 'Premium activado' : 'Premium retirado', 'ok');
      pintarAdmin(); pintarLista();
    }
    if (d.suspender) {
      const us = usuario(Number(d.suspender));
      us.estado = us.estado === 'activo' ? 'suspendido' : 'activo';
      guardar(); avisar('Usuario ' + us.estado, 'ok'); pintarAdmin();
    }
    if (d.borraruser) {
      const us = usuario(Number(d.borraruser));
      confirmar('Eliminar usuario', `Se eliminará a ${us.nombre} con todas sus publicaciones.`, () => {
        BD.usuarios = BD.usuarios.filter(x => x.id != d.borraruser);
        BD.articulos = BD.articulos.filter(a => a.usuario != d.borraruser);
        guardar(); avisar('Usuario eliminado', 'ok');
        pintarAdmin(); pintarLista(); pintarMapa();
      }, 'Sí, eliminar');
    }
    if (d.anpausa) {
      const a = BD.anuncios.find(x => x.id == d.anpausa);
      a.activo = !a.activo; guardar(); pintarAdmin(); pintarLista();
      avisar(a.activo ? 'Anuncio activado' : 'Anuncio pausado', 'ok');
    }
    if (d.anborrar) {
      confirmar('Eliminar anuncio', '¿Seguro?', () => {
        BD.anuncios = BD.anuncios.filter(x => x.id != d.anborrar);
        guardar(); avisar('Anuncio eliminado', 'ok'); pintarAdmin(); pintarLista();
      }, 'Sí, eliminar');
    }
  } catch (err) {
    console.error(err);
    avisar('Ocurrió un problema: ' + err.message, 'err');
  }
});

/* pestañas */
document.addEventListener('click', e => {
  const p = e.target.closest('.pest');
  if (!p) return;
  const grupo = p.closest('.pestanas');
  grupo.querySelectorAll('.pest').forEach(x => x.setAttribute('aria-selected', 'false'));
  p.setAttribute('aria-selected', 'true');
  const cont = grupo.parentElement;
  cont.querySelectorAll('.panel').forEach(x => x.classList.remove('on'));
  cont.querySelector('#p-' + p.dataset.panel)?.classList.add('on');
});

/* mapa: globo al pasar el mouse */
document.addEventListener('mouseover', e => {
  const pin = e.target.closest('[data-pin],[data-pinpro]');
  const pro = pin && pin.dataset.pinpro !== undefined;
  const globo = $(pro ? '#globoPro' : '#globoMapa');
  if (!pin) {
    if (!e.target.closest('.globo-mapa')) $$('.globo-mapa').forEach(g => g.classList.remove('visible'));
    return;
  }
  const a = BD.articulos.find(x => x.id == (pro ? pin.dataset.pinpro : pin.dataset.pin));
  if (!a || !globo) return;
  const d = usuario(a.usuario), u = yo();
  const km = u && u.lat && a.lat ? distanciaTxt(distanciaKm(u.lat, u.lon, a.lat, a.lon)) : '';
  const caja = (pro ? $('#mapaPro') : $('#mapa')).getBoundingClientRect();
  const p = pin.getBoundingClientRect();
  globo.innerHTML = `<img src="${foto(a)}" alt=""><b>${esc(a.titulo)}</b>
    <small>📍 ${esc(a.ciudad)}${km ? ' · ' + km : ''} · ${esc(d ? d.nombre : '')}</small>
    ${pro ? `<small>Ubicación: ${Number(a.lat).toFixed(5)}, ${Number(a.lon).toFixed(5)}</small>` : ''}`;
  globo.style.left = Math.min(Math.max(p.left - caja.left - 100, 6), caja.width - 220) + 'px';
  globo.style.top  = Math.max(p.top - caja.top - 150, 6) + 'px';
  globo.classList.add('visible');
});

/* ---------------- formularios ---------------- */
function conectar() {
  /* auth */
  $('#formAuth').addEventListener('submit', e => {
    e.preventDefault();
    $('#errAuth').hidden = true;
    const email = $('#aEmail').value, pass = $('#aPass').value;
    if (App.modoAuth === 'registro') {
      const r = registrar({ nombre: $('#aNombre').value, email, pass, ciudad: $('#aCiudad').value });
      if (r.err) return errorAuth(r.err);
      trasEntrar(r.usuario, `¡Cuenta creada! Bienvenido, ${r.usuario.nombre}`);
      mostrarCodigo(r.usuario);
    } else {
      const r = iniciarSesion(email, pass);
      if (r.err) return errorAuth(r.err);
      trasEntrar(r.usuario);
    }
  });
  $('#cambioAuth').addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      App.modoAuth = App.modoAuth === 'login' ? 'registro' : 'login';
      refrescarAuth();
    }
  });
  $('#aPass').addEventListener('input', () => medir($('#aPass'), $('#medAuth')));

  /* ver / ocultar la contraseña */
  $('#ojoAuth').addEventListener('click', () => {
    const c = $('#aPass');
    c.type = c.type === 'password' ? 'text' : 'password';
    $('#ojoAuth').textContent = c.type === 'password' ? '👁️' : '🙈';
  });

  /* recuperar la cuenta con el código de respaldo */
  $('#btnOlvide').addEventListener('click', () => {
    $('#errRec').hidden = true;
    $('#recEmail').value = $('#aEmail').value;
    cerrar('mAuth'); abrir('mRecuperar');
  });
  $('#formRecuperar').addEventListener('submit', e => {
    e.preventDefault();
    const r = recuperarCuenta($('#recEmail').value, $('#recCodigo').value, $('#recPass').value);
    if (r.err) { const c = $('#errRec'); c.textContent = r.err; c.hidden = false; return; }
    $('#formRecuperar').reset();
    trasEntrar(r.usuario, 'Contraseña cambiada. ¡Bienvenido de nuevo!');
  });

  /* copiar y descargar el código de respaldo */
  const copiar = txt => {
    navigator.clipboard?.writeText(txt).then(() => avisar('Copiado ✔', 'ok'))
      .catch(() => avisar('Selecciona el código y cópialo a mano'));
  };
  $('#btnCopiarCodigo').addEventListener('click', () => copiar($('#codigoTxt').textContent));
  $('#btnBajarCodigo').addEventListener('click', () => {
    const u = yo(); if (!u) return;
    descargar('truequea-mis-datos.txt', textoAcceso(u), 'text/plain;charset=utf-8');
  });
  $('#btnCopiarMio').addEventListener('click', () => copiar($('#miCodigo').textContent));
  $('#btnBajarMio').addEventListener('click', () => {
    const u = yo(); if (!u) return;
    descargar('truequea-mis-datos.txt', textoAcceso(u), 'text/plain;charset=utf-8');
  });

  /* google / facebook */
  const abrirSocial = prov => {
    $('#gTitulo').textContent = prov === 'fb' ? 'Entrar con Facebook' : 'Entrar con Google';
    $('#gCiudad').value = 'Chincha Alta';
    cerrar('mAuth'); abrir('mGoogle');
  };
  $('#btnExpress').addEventListener('click', abrirExpress);
  $('#formExpress').addEventListener('submit', e => { e.preventDefault(); crearExpress(); });
  $('#exPin').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
  $('#exTel').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^\d ]/g, ''); });
  $('#btnGoogle').addEventListener('click', () => abrirSocial('google'));
  $('#btnFacebook').addEventListener('click', () => abrirSocial('fb'));
  $('#formGoogle').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#gEmail').value.trim().toLowerCase();
    const existe = BD.usuarios.find(u => u.email.toLowerCase() === email);
    if (existe) { entrar(existe); return trasEntrar(existe); }
    const r = registrar({ nombre: $('#gNombre').value.trim() || email.split('@')[0],
                          email, ciudad: $('#gCiudad').value, social: true });
    if (r.err) return avisar(r.err, 'err');
    trasEntrar(r.usuario, `¡Bienvenido, ${r.usuario.nombre}!`);
    mostrarCodigo(r.usuario);
  });

  /* publicar */
  $('#pubFotos').addEventListener('change', e => {
    const files = Array.from(e.target.files).slice(0, 6 - App.fotos.length);
    let pend = files.length;
    if (!pend) return;
    files.forEach(f => leerArchivo(f, url => {
      App.fotos.push(url);
      if (--pend === 0) pintarMinis();
    }));
  });
  $('#formPublicar').addEventListener('submit', e => { e.preventDefault(); guardarPublicacion(); });

  /* propuesta: el semáforo se recalcula al cambiar lo que ofreces */
  $('#formPropuesta').addEventListener('submit', e => { e.preventDefault(); enviarPropuesta(); });
  $('#propOfrezco').addEventListener('change', pintarAnalisisPropuesta);

  /* pedidos "Quiero esto" */
  $('#formDeseo').addEventListener('submit', e => { e.preventDefault(); guardarDeseo(); });

  /* impulsar publicación */
  $('#formImpulso').addEventListener('submit', e => { e.preventDefault(); pedirImpulso(); });

  /* filtro de comprobantes */
  $('#filtroPagos').addEventListener('change', e => listaPagos(e.target.value));

  /* chat */
  $('#formChat').addEventListener('submit', e => {
    e.preventDefault();
    const txt = $('#chatTexto').value.trim();
    if (!txt) return;
    $('#chatTexto').value = '';
    enviarMensaje(txt, null);
  });
  /* chat Premium: enviar foto y buscar dentro de la conversación */
  $('#chatFoto').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    leerArchivo(f, url => { enviarMensaje('', url); avisar('Foto enviada', 'ok'); });
    e.target.value = '';
  });
  let tBusca;
  $('#chatBuscar').addEventListener('input', () => {
    clearTimeout(tBusca); tBusca = setTimeout(pintarChat, 220);
  });

  /* reserva Premium */
  $('#formReserva').addEventListener('submit', e => { e.preventDefault(); guardarReserva(); });

  /* solicitud de publicidad */
  $('#solImg').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) leerArchivo(f, url => { App.fotoSolicitud = url; $('#zonaSol').innerHTML = `<img src="${url}" alt="">`; });
  });
  $('#formSolicitud').addEventListener('submit', e => { e.preventDefault(); enviarSolicitud(); });

  /* panel Premium: radio del mapa y avisos */
  $('#proRadio').addEventListener('change', e => {
    App.radioPro = Number(e.target.value) || 0;
    pintarPanelPro();
  });
  $('#proAvisos').addEventListener('change', e => {
    const u = yo(); if (!u) return;
    u.avisos = e.target.checked; guardar();
    avisar(u.avisos ? 'Avisos activados' : 'Avisos desactivados', 'ok');
  });

  /* calificar */
  $('#estEleg').addEventListener('click', e => {
    const b = e.target.closest('[data-v]');
    if (b) { App.puntaje = Number(b.dataset.v); pintarEstrellas(App.puntaje); }
  });
  $('#formCalificar').addEventListener('submit', e => {
    e.preventDefault();
    if (!App.puntaje) return avisar('Elige cuántas estrellas', 'err');
    const u = yo(), x = BD.intercambios.find(i => i.id == $('#calId').value);
    BD.resenas.push({ id: nuevoId(), trueque: x.id, de: u.id, para: x.de === u.id ? x.para : x.de,
      puntaje: App.puntaje, comentario: $('#calCom').value.trim(), creado: new Date().toISOString() });
    guardar(); cerrar('mCalificar'); $('#formCalificar').reset();
    avisar('¡Gracias por calificar!', 'ok');
    pintarCuenta(); pintarLista();
  });

  /* perfil */
  $('#perfilFoto').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) leerArchivo(f, url => { $('#vistaAvatar').innerHTML = `<img src="${url}" alt="">`; App.avatarNuevo = url; });
  });
  $('#pfPass').addEventListener('input', () => medir($('#pfPass'), $('#medPerfil')));
  $('#formPerfil').addEventListener('submit', e => {
    e.preventDefault();
    const u = yo(); if (!u) return;
    if ($('#pfPass').value) {
      const err = validarPass($('#pfPass').value);
      if (err) return avisar(err, 'err');
      u.pass = $('#pfPass').value;
      $('#pfPass').value = '';
    }
    u.nombre = $('#pfNombre').value.trim() || u.nombre;
    u.ciudad = $('#pfCiudad').value;
    u.telefono = $('#pfTel').value.trim();
    u.ref = $('#pfRef').value.trim();
    u.bio = $('#pfBio').value.trim();
    if (App.avatarNuevo) { u.avatar = App.avatarNuevo; App.avatarNuevo = null; }
    guardar(); avisar('Perfil actualizado', 'ok'); pintarNav(); pintarCuenta(); pintarLista();
  });
  $('#btnGps').addEventListener('click', () => {
    if (!navigator.geolocation) return avisar('Tu navegador no permite geolocalización', 'err');
    avisar('Buscando tu ubicación...');
    navigator.geolocation.getCurrentPosition(p => {
      $('#pfLat').value = p.coords.latitude.toFixed(6);
      $('#pfLon').value = p.coords.longitude.toFixed(6);
      avisar('Ubicación detectada, ahora guárdala', 'ok');
    }, () => avisar('No pudimos obtener tu ubicación', 'err'));
  });
  $('#btnGuardarUbic').addEventListener('click', () => {
    const u = yo(); if (!u) return;
    u.lat = Number($('#pfLat').value) || u.lat;
    u.lon = Number($('#pfLon').value) || u.lon;
    guardar(); avisar('Ubicación guardada', 'ok'); pintarMapa();
  });

  /* premium */
  $('#pagoImg').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) leerArchivo(f, url => {
      App.fotoPago = url;
      $('#zonaPago').innerHTML = `<img src="${url}" alt="Comprobante">`;
    });
  });
  $('#formPago').addEventListener('submit', e => { e.preventDefault(); enviarPago(); });

  /* admin: anuncios */
  $('#anImg').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) leerArchivo(f, url => { App.fotoAnuncio = url; $('#zonaAn').innerHTML = `<img src="${url}" alt="">`; });
  });
  $('#formAnuncio').addEventListener('submit', e => {
    e.preventDefault();
    const destacado = $('#anDestacado').checked;
    if (destacado) BD.anuncios.forEach(a => a.destacado = false);
    BD.anuncios.unshift({
      id: nuevoId(), titulo: $('#anTitulo').value.trim(), desc: $('#anDesc').value.trim(),
      empresa: $('#anEmpresa').value.trim() || 'Publicidad', img: App.fotoAnuncio,
      tel: $('#anTel').value.trim(), wa: $('#anWa').value.trim(), web: $('#anWeb').value.trim(),
      destacado, activo: true, vistas: 0, clics: 0, creado: new Date().toISOString(),
    });
    guardar(); $('#formAnuncio').reset(); App.fotoAnuncio = null;
    $('#zonaAn').textContent = '🖼️ Clic para subir la imagen del anuncio';
    avisar('Anuncio publicado', 'ok'); pintarAdmin(); pintarLista();
  });

  /* admin: yape */
  $('#yapeImg').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) leerArchivo(f, url => { App.fotoYape = url; $('#vistaYape').innerHTML = `<img class="yape-qr" src="${url}" alt="">`; });
  });
  $('#formYape').addEventListener('submit', e => {
    e.preventDefault();
    if (App.fotoYape) { BD.config.yapeQr = App.fotoYape; App.fotoYape = null; }
    BD.config.yapeNombre = $('#yapeNom').value.trim() || 'Angel Levano';
    BD.config.yapeNumero = $('#yapeNum').value.trim();
    BD.config.precioPremium = Number($('#yapePrecio').value) || 1;
    BD.config.precioImpulso = Number($('#yapeImpulso').value) || 1;
    BD.config.precioSeguro  = Number($('#yapeSeguro').value) || 1;
    BD.config.autoYape      = $('#yapeAuto').checked;
    BD.config.yapeMinimo    = Number($('#yapePrecio').value) || 3;
    guardar(); avisar('Datos de cobro guardados', 'ok'); pintarPremium();
  });

  /* admin: marca */
  $('#marcaImg').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) leerArchivo(f, url => { App.fotoLogo = url;
      $('#vistaLogo').innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover" alt="">`; });
  });
  $('#btnQuitarLogo').addEventListener('click', () => {
    BD.config.logo = null; App.fotoLogo = null; guardar();
    aplicarMarca(); pintarAdmin(); avisar('Logo quitado');
  });
  $('#formMarca').addEventListener('submit', e => {
    e.preventDefault();
    if (App.fotoLogo) { BD.config.logo = App.fotoLogo; App.fotoLogo = null; }
    BD.config.nombre = $('#marcaNombre').value.trim() || 'Truequea PE';
    BD.config.lema = $('#marcaLema').value.trim();
    BD.config.color = $('#marcaColor').value;
    guardar(); aplicarMarca(); avisar('Identidad guardada', 'ok');
  });

  /* admin: contacto público y avisos */
  $('#formContacto').addEventListener('submit', e => {
    e.preventDefault();
    BD.config.contacto = {
      nombre: $('#coNombre').value.trim() || 'Angel Levano',
      cargo: $('#coCargo').value.trim() || 'Administrador de Truequea PE',
      telefono: $('#coTel').value.trim(),
      email: $('#coEmail').value.trim(),
      wa: $('#coWa').value.trim(),
      horario: $('#coHorario').value.trim(),
      texto: $('#coTexto').value.trim(),
    };
    BD.config.avisoWhatsApp = $('#coAviso').checked;
    guardar(); pintarContacto();
    avisar('Datos de contacto guardados', 'ok');
  });

  /* admin: rango de los gráficos */
  $('#repRango').addEventListener('change', pintarReportes);

  /* admin: exportar */
  $('#btnCsvUsuarios').addEventListener('click', csvUsuarios);
  $('#btnJsonTodo').addEventListener('click', () => {
    descargar(`respaldo-truequea-${new Date().toISOString().slice(0,10)}.json`,
      JSON.stringify(BD, null, 2), 'application/json');
    avisar('Copia de seguridad descargada', 'ok');
  });
  $('#buscaUsr').addEventListener('input', e => tablaUsuarios(e.target.value));

  /* filtros */
  let temp;
  $('#buscador').addEventListener('input', e => {
    clearTimeout(temp);
    temp = setTimeout(() => { App.filtros.q = e.target.value; pintarLista(); pintarMapa(); }, 260);
  });
  ['fCat','fCiudad','fCond','fOrden'].forEach(id => {
    $('#' + id).addEventListener('change', () => {
      App.filtros.cat = $('#fCat').value; App.filtros.ciudad = $('#fCiudad').value;
      App.filtros.cond = $('#fCond').value; App.filtros.orden = $('#fOrden').value;
      pintarCategorias(); pintarLista(); pintarMapa();
    });
  });
  $('#btnLimpiar').addEventListener('click', limpiarFiltros);
  $('#catIzq').addEventListener('click', () => $('#categorias').scrollBy({ left: -320, behavior: 'smooth' }));
  $('#catDer').addEventListener('click', () => $('#categorias').scrollBy({ left: 320, behavior: 'smooth' }));
  $('#categorias').addEventListener('scroll', flechasCat);
  window.addEventListener('resize', flechasCat);
  $('#btnTema').addEventListener('click', () =>
    aplicarTema(document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro'));
  $('#btnMiUbic').addEventListener('click', () => {
    const u = yo();
    if (!u) { abrirAuth('login'); return avisar('Entra para marcar tu ubicación'); }
    irA('cuenta');
    setTimeout(() => { $('[data-panel="c-perf"]').click(); $('#btnGps').scrollIntoView({behavior:'smooth'}); }, 200);
  });
  $('#confSi').addEventListener('click', () => {
    cerrar('mConfirmar');
    if (App.confirmar) { const cb = App.confirmar; App.confirmar = null; cb(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarTodo(); });
}

/* ---------------- arranque ---------------- */
function iniciar() {
  cargarBD();
  liberarReservas();
  $('#anio').textContent = new Date().getFullYear();
  aplicarTema(BD.config.tema || 'claro');
  aplicarPlan();
  aplicarMarca();
  conectar();
  pintarCiudades();
  pintarCategorias();
  pintarNav();
  pintarLista();
  pintarMapa();
  pintarPremium();

  const m = BD.articulos.filter(a => a.estado === 'disponible').length;
  $('#cifrasPortada').innerHTML = `
    <div><b>${m}</b><span>Artículos disponibles</span></div>
    <div><b>${BD.usuarios.length}</b><span>Usuarios</span></div>
    <div><b>${BD.intercambios.filter(x => x.estado === 'completado').length}</b><span>Trueques completados</span></div>
    <div><b>${new Set(BD.articulos.map(a => a.ciudad)).size}</b><span>Ciudades</span></div>`;

  const u = yo();
  registrarVisita(u ? u.id : null);
  if (u) {
    avisar(`Sesión activa: ${u.nombre}`, 'ok');
    /* avisos pendientes de lo que sigue el Premium */
    const sinLeer = BD.notis.filter(n => n.usuario === u.id && !n.leida).length;
    if (u.premium && sinLeer) setTimeout(() =>
      avisar(`Tienes ${sinLeer} aviso(s) nuevo(s) 🔔`, 'ok'), 3600);
  }

  /* las reservas vencen solas mientras la página está abierta */
  setInterval(() => {
    const antes = JSON.stringify(BD.articulos.map(a => !!a.reserva));
    liberarReservas();
    if (JSON.stringify(BD.articulos.map(a => !!a.reserva)) !== antes) {
      pintarLista(); pintarMapa();
      if (yo() && yo().premium) pintarPanelPro();
    }
  }, 60000);
}
document.addEventListener('DOMContentLoaded', iniciar);


/* =====================================================================
   PUENTE CON api.php  (opcional)
   ---------------------------------------------------------------------
   · Si abres index.html con doble clic (file://) no pasa nada: todo
     sigue guardándose en el navegador, como hasta ahora.
   · Si lo subes a un hosting con PHP o lo pones en XAMPP, detecta
     api.php solo y ahí guarda la base para que TODOS vean lo mismo.
   · La sesión (quién está conectado) SIEMPRE queda en el navegador:
     nunca se comparte con el servidor.
   ===================================================================== */
const SERVIDOR = { activo: false, url: 'api.php', timer: null, enviando: false, ultimo: null };

/* guardar() ahora también manda los datos al servidor, sin bloquear nada */
const guardarSoloLocal = guardar;
guardar = function () {
  guardarSoloLocal();
  if (SERVIDOR.activo) programarEnvio();
};

function programarEnvio() {
  clearTimeout(SERVIDOR.timer);
  SERVIDOR.timer = setTimeout(enviarAlServidor, 1400);
}

async function enviarAlServidor() {
  if (!SERVIDOR.activo || SERVIDOR.enviando) return;
  SERVIDOR.enviando = true;
  try {
    const copia = { ...BD, sesion: null };   // la sesión no viaja
    const r = await fetch(SERVIDOR.url + '?a=guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(copia),
    });
    const j = await r.json();
    if (j.ok) { SERVIDOR.ultimo = new Date(); marcarModo(); }
    else avisar('El servidor no pudo guardar: ' + (j.error || ''), 'err');
  } catch (e) {
    SERVIDOR.activo = false; marcarModo();
  } finally {
    SERVIDOR.enviando = false;
  }
}

async function conectarServidor() {
  if (!/^https?:$/.test(location.protocol)) { marcarModo(); return; }
  try {
    const est = await (await fetch(SERVIDOR.url + '?a=estado')).json();
    if (!est.ok) { marcarModo(); return; }
    SERVIDOR.activo = true;

    const res = await (await fetch(SERVIDOR.url + '?a=cargar')).json();
    if (res.ok && res.hay && res.datos && Array.isArray(res.datos.usuarios)) {
      const miSesion = BD.sesion;               // conservo mi sesión local
      BD = res.datos;
      BD.sesion = miSesion;
      if (!BD.visitas) BD.visitas = [];
      if (!BD.deseos)  BD.deseos = [];
      if (!BD.seguros) BD.seguros = [];
      guardarSoloLocal();
      /* vuelvo a pintar todo con los datos del servidor */
      aplicarMarca(); pintarCiudades(); pintarCategorias();
      pintarNav(); pintarLista(); pintarMapa(); pintarPremium();
      if (yo() && yo().rol === 'admin') pintarAdmin();
      avisar('Conectado al servidor: todos ven los mismos datos', 'ok');
    } else {
      enviarAlServidor();                        // primera vez: subo lo que tengo
      avisar('Servidor listo. Se subieron los datos iniciales.', 'ok');
    }
  } catch (e) {
    SERVIDOR.activo = false;                     // no hay PHP: sigo en local
  }
  marcarModo();
}

/* Cartelito en el pie que dice dónde se están guardando los datos */
function marcarModo() {
  const pie = document.querySelector('.pie-base');
  if (!pie) return;
  let s = document.getElementById('modoDatos');
  if (!s) {
    s = document.createElement('span');
    s.id = 'modoDatos';
    s.style.cssText = 'display:block;margin-top:6px;font-size:12px';
    pie.appendChild(s);
  }
  s.innerHTML = SERVIDOR.activo
    ? `🟢 Modo servidor (api.php) — todos ven los mismos datos${
        SERVIDOR.ultimo ? ' · guardado ' + SERVIDOR.ultimo.toLocaleTimeString() : ''}`
    : '🔵 Modo local — los datos se guardan solo en este navegador';
}

// document.addEventListener('DOMContentLoaded', () => setTimeout(conectarServidor, 400));

