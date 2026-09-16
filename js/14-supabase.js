/* ===================================================================
   TRUEQUEA PE · Base de datos en la nube (Supabase)
   Archivo: js/14-supabase.js
   =================================================================== */

/* =====================================================================
   TRUEQUEA PE — BASE DE DATOS EN LA NUBE (Supabase)
   ---------------------------------------------------------------------
   Con esto todos los usuarios comparten la MISMA información desde
   cualquier celular o computadora.

   Supabase es el servicio remoto configurado. El navegador mantiene una
   copia local, que puede fallar si no hay espacio. No hay cambio automático
   a otro servidor al fallar Supabase. La conexión no garantiza escritura.

   Tu sesión (con qué cuenta entraste) NUNCA se sube: queda en tu equipo.
   Para apagar la nube: pon activa:false aquí abajo.
   ===================================================================== */

const SUPABASE_CONFIG = {
  activa: true,
  tabla: 'truequea_data',  // nombre de la tabla en Supabase
  segundosRevision: 15,     // cada cuánto revisa la nube
  supabaseUrl: 'https://zrnhlrefjzunyfdnphhj.supabase.co',
  supabaseKey: 'sb_publishable_iE2sosBWooKdoNUaOUFo7Q_ziUrEHIk',
};

// SDK de Supabase (cargado dinámicamente)
const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';

const NUBE = {
  activa: false, modo: 'local', client: null, timer: null,
  subiendo: false, aplicando: false, huella: null, ultima: null,
  error: null, detalle: '', conectado: null,
  leido: false, ultimoConteo: null, pendiente: false,
  ultimaLectura: null, ultimaEscritura: null, canal: null,
};

/* Resumen corto de los datos: evita subir o repintar de gabete */
function huellaBD(datos) {
  const copia = { ...datos };
  delete copia.sesion;
  delete copia.sesionVence;
  delete copia.actualizado;
  return JSON.stringify(copia);
}

/* Deja la base con todas sus listas, aunque la nube devuelva algo incompleto */
function sanear(datos) {
  ['usuarios', 'articulos', 'anuncios', 'intercambios', 'chats', 'mensajes', 'notis',
   'favoritos', 'resenas', 'pagos', 'visitas', 'deseos', 'seguros'].forEach(k => {
    if (!Array.isArray(datos[k])) datos[k] = [];
  });
  if (!datos.config) datos.config = semilla().config;
  return datos;
}

/* Carga el SDK de Supabase */
function cargarSupabaseSDK() {
  return new Promise((resolve) => {
    if (window.supabase) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = SUPABASE_SDK;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/* =====================================================================
   ARRANQUE
   ===================================================================== */
async function iniciarNube() {
  if (!SUPABASE_CONFIG.activa || !SUPABASE_CONFIG.supabaseUrl) {
    NUBE.detalle = 'La nube está apagada en la configuración.';
    marcarModo();
    return;
  }

  /* Cargar SDK de Supabase */
  const sdkCargado = await cargarSupabaseSDK();
  if (!sdkCargado || !window.supabase) {
    NUBE.detalle = 'No se pudo cargar el SDK de Supabase.';
    NUBE.error = 'SDK no disponible';
    marcarModo();
    return;
  }

  try {
    /* Inicializar cliente de Supabase */
    NUBE.client = NUBE.client || window.supabase.createClient(
      SUPABASE_CONFIG.supabaseUrl,
      SUPABASE_CONFIG.supabaseKey
    );

    /* Probar conexión leyendo la tabla */
    const { data, error } = await NUBE.client
      .from(SUPABASE_CONFIG.tabla)
      .select('data')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;

    NUBE.ultimaLectura = new Date();
    NUBE.activa = true;
    NUBE.modo = 'supabase';
    NUBE.error = null;
    NUBE.detalle = 'Conectada con Supabase.';
    SERVIDOR.activo = false;

    /* Si hay datos, aplicarlos */
    if (data && data.data) {
      aplicarDesdeNube(data.data);
    } else {
      /* Primera vez: subir nuestros datos */
      NUBE.leido = true;
      subirANube(true);
    }

    if (NUBE.canal) {
      await NUBE.client.removeChannel(NUBE.canal);
      NUBE.canal = null;
    }
    iniciarPolling();

    /* Configurar suscripción a cambios en tiempo real */
    try {
      NUBE.canal = NUBE.client
        .channel(`truequea_changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table: SUPABASE_CONFIG.tabla }, (payload) => {
          if (payload.new && payload.new.data) {
            aplicarDesdeNube(payload.new.data);
          }
        })
        .subscribe((status) => {
          NUBE.conectado = status === 'SUBSCRIBED';
          marcarModo();
        });
    } catch (e) {
      // Si falla el realtime, seguimos funcionando con polling
      console.warn('Realtime no disponible, usando polling:', e);
      iniciarPolling();
    }

    marcarModo();
  } catch (e) {
    NUBE.activa = false;
    NUBE.error = e.message;
    NUBE.detalle = 'Error al conectar con Supabase: ' + e.message;
    marcarModo();
  }
}

/* Polling como respaldo si realtime falla */
function iniciarPolling() {
  clearInterval(NUBE.reloj);
  NUBE.reloj = setInterval(bajarDatos, Math.max(8, SUPABASE_CONFIG.segundosRevision) * 1000);
}

async function bajarDatos() {
  if (!NUBE.activa || NUBE.subiendo) return;
  try {
    const { data, error } = await NUBE.client
      .from(SUPABASE_CONFIG.tabla)
      .select('data')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    NUBE.ultimaLectura = new Date();
    if (data && data.data) {
      aplicarDesdeNube(data.data);
    }
  } catch (e) {
    NUBE.error = e.message;
    marcarModo();
  }
}

/* =====================================================================
   BAJAR Y SUBIR
   ===================================================================== */
function aplicarDesdeNube(datos) {
  const vacia = !datos || !Array.isArray(datos.usuarios) || !datos.usuarios.length;

  if (vacia) {
    /* La nube está vacía de verdad: la estrenamos con lo nuestro */
    NUBE.leido = true;
    subirANube(true);
    marcarModo();
    return;
  }

  const h = huellaBD(datos);
  const primeraVez = !NUBE.leido;
  NUBE.leido = true;
  if (!primeraVez && h === NUBE.huella) { NUBE.ultima = new Date(); marcarModo(); return; }
  NUBE.huella = h;

  NUBE.aplicando = true;
  const antes = { u: BD.usuarios.length, a: BD.articulos.length };

  /* FUSIÓN: lo mío + lo de la nube, gana el más reciente de cada registro */
  const hubo = fusionar(sanear(datos));
  sanear(BD);
  // Los datos descargados no son ediciones nuevas de este navegador.
  COLECCIONES.forEach(k => {
    SOMBRA[k] = Object.fromEntries(BD[k].map(r => [r.id, sinMod(r)]));
  });
  SOMBRA_CONFIG = JSON.stringify({ ...BD.config, mod: 0 });
  guardarSoloLocal();

  const despues = { u: BD.usuarios.length, a: BD.articulos.length };
  NUBE.ultimoConteo = despues;
  if (primeraVez) guardarCopia('al conectar con la nube');

  if (hubo) refrescarTodo();
  setTimeout(() => {
    NUBE.aplicando = false;
    if (NUBE.pendiente) programarNube();
  }, 700);

  /* si yo tenía cosas que la nube no tiene, las subo */
  if (despues.u > (datos.usuarios || []).length ||
      despues.a > (datos.articulos || []).length || NUBE.pendiente) {
    programarNube();
  }
  NUBE.ultima = new Date();
  marcarModo();
}

function refrescarTodo() {
  try {
    aplicarPlan(); aplicarMarca();
    pintarCiudades(); pintarCategorias();
    pintarNav(); pintarLista(); pintarMapa(); pintarPremium();
    const u = yo();
    if (u && $('#v-cuenta').classList.contains('on')) pintarCuenta();
    if (u && u.rol === 'admin' && $('#v-admin').classList.contains('on')) pintarAdmin();
    if (App.chat && $('#mChat').classList.contains('on')) pintarChat();
  } catch (e) { console.warn('refresco', e); }
}

function programarNube() {
  NUBE.pendiente = true;
  if (!NUBE.activa || NUBE.aplicando || NUBE.subiendo) return;
  clearTimeout(NUBE.timer);
  NUBE.timer = setTimeout(() => subirANube(), 1200);
}

async function subirANube(primeraVez = false) {
  if (!NUBE.activa || NUBE.subiendo) { NUBE.pendiente = true; return; }

  /* PROHIBIDO subir sin haber leído antes: así nadie pisa a los demás */
  if (!NUBE.leido && !primeraVez) { NUBE.pendiente = true; return; }

  NUBE.subiendo = true;
  NUBE.pendiente = false;
  try {
    estampar();
    estamparConfig();
    const copia = JSON.parse(JSON.stringify({ ...BD, sesion: null, sesionVence: null, actualizado: Date.now() }));

    /* red de seguridad: si de golpe fuera a desaparecer medio sistema, paramos */
    const revision = subidaSegura(copia);
    if (!revision.ok) {
      NUBE.pendiente = true;
      NUBE.error = revision.motivo;
      guardarCopia('subida frenada');
      avisarConBoton('Frenamos una subida rara: ' + revision.motivo +
        ' Conserva esta pestaña y descarga un respaldo.', 'Ver copias', verCopias);
      return;
    }

    const texto = JSON.stringify(copia);
    if (texto.length > 7 * 1024 * 1024) {
      throw new Error('El JSON supera el límite de 7 MB del programa. Exporta un respaldo; falta migrar las imágenes a Storage. No borres publicaciones para ocultar este error.');
    }
    NUBE.huella = huellaBD(copia);

    /* Guardar en Supabase - upsert para insertar o actualizar */
    const { error } = await NUBE.client
      .from(SUPABASE_CONFIG.tabla)
      .upsert({ id: 1, data: copia, actualizado: new Date().toISOString() }, { onConflict: 'id' });

    if (error) throw error;

    NUBE.ultima = new Date();
    NUBE.ultimaEscritura = NUBE.ultima;
    NUBE.error = null;
    if (primeraVez) avisar('Base de datos creada en Supabase ✔', 'ok');
  } catch (e) {
    NUBE.error = e.message;
    NUBE.pendiente = true;
    console.error('Supabase: no se confirmó la escritura', e);
    avisar('No se guardó en Supabase: ' + e.message, 'err');
    if (/permission|denied|401|403/i.test(e.message)) {
      NUBE.detalle = 'Supabase rechazó la escritura: revisa los permisos.';
      NUBE.activa = false;
    }
  } finally {
    NUBE.subiendo = false;
    if (NUBE.pendiente && !NUBE.error) programarNube();
    marcarModo();
  }
}

/* guardar() ahora también manda todo a la nube */
const guardarAntesDeNube = guardar;
guardar = function () {
  try { estampar(); estamparConfig(); } catch (e) { /* nunca romper el guardado */ }
  guardarAntesDeNube();
  programarNube();
};

/* =====================================================================
   CARTELITO DEL PIE
   ===================================================================== */
marcarModo = function () {
  const pie = document.querySelector('.pie-base');
  if (!pie) return;
  let s = document.getElementById('modoDatos');
  if (!s) {
    s = document.createElement('span');
    s.id = 'modoDatos';
    s.style.cssText = 'display:block;margin-top:6px;font-size:12px';
    pie.appendChild(s);
  }
  const escritura = NUBE.ultimaEscritura ? NUBE.ultimaEscritura.toLocaleTimeString() : 'sin confirmar';
  if (NUBE.error) {
    s.textContent = '⚠️ Supabase: ' + NUBE.error + ' · Última escritura: ' + escritura;
  } else if (NUBE.activa) {
    s.textContent = 'Supabase · Lectura disponible · Escritura: ' + escritura +
      ' · Tiempo real: ' + (NUBE.conectado ? 'suscrito' : 'sin confirmar; consultas cada 15 s');
  } else {
    s.textContent = 'Sin conexión remota confirmada. Los cambios locales pueden no estar compartidos.';
  }
  if (typeof pintarEstadoNube === 'function') pintarEstadoNube();
};

function sincronizarAhora() {
  if (!NUBE.activa) { reconectarNube(); return; }
  subirANube();
  avisar('Intentando guardar en Supabase; revisa la última escritura confirmada.');
}

/* Vuelve a intentar la conexión sin recargar la página */
async function reconectarNube() {
  avisar('Probando la conexión con Supabase...');
  NUBE.error = null; NUBE.huella = null;
  clearInterval(NUBE.reloj);
  await iniciarNube();
  if (typeof pintarEstadoNube === 'function') pintarEstadoNube();
}

/* Reintento automático en caso de error */
function reintentarSolo() {
  setTimeout(() => {
    if (!NUBE.activa) iniciarNube();
  }, 30000);
}

/* Diagnóstico para Supabase (evita error de referencia en eventos) */
async function verDiagnostico() {
  if (NUBE.activa) await bajarDatos();
  const c = document.getElementById('diagCuerpo');
  if (!c) return;
  c.innerHTML = `<h2>🔌 Diagnóstico de la nube (Supabase)</h2>
    <p class="sub">URL: <b>${SUPABASE_CONFIG.supabaseUrl || 'No configurada'}</b></p>
    <p>Última escritura confirmada: <b>${esc(NUBE.ultimaEscritura ? NUBE.ultimaEscritura.toLocaleString() : 'Ninguna en esta sesión')}</b></p>
    <div class="diag">
      <div class="diag-fila ${NUBE.activa ? 'si' : 'no'}">
        <span class="diag-emo">${NUBE.activa ? '✅' : '❌'}</span>
        <div><b>Estado de la conexión</b><span>${esc(NUBE.detalle || 'Desconocido')}</span></div>
      </div>
      <div class="diag-fila ${NUBE.conectado ? 'si' : (NUBE.conectado === false ? 'no' : '')}">
        <span class="diag-emo">${NUBE.conectado ? '✅' : (NUBE.conectado === false ? '❌' : '⏳')}</span>
        <div><b>Actualizaciones en vivo</b><span>${NUBE.conectado ? 'Suscrito a cambios' : 'No suscrito (posible error de realtime)'}</span></div>
      </div>
    </div>
    ${NUBE.error ? `<div class="diag-arreglo"><b>Error detectado:</b><p>${esc(NUBE.error)}</p></div>` : ''}
  `;
  if (typeof abrir === 'function') abrir('mDiag');
}

document.addEventListener('DOMContentLoaded', () => setTimeout(iniciarNube, 400));
