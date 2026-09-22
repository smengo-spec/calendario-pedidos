/* =====================================================================
   datos.js — lee tu hoja de Drive y la convierte en semanas y franquicias.
   Lo usan las dos páginas: index.html (franquicias) y control.html (depósito).
   ===================================================================== */
(function (global) {
'use strict';

/* ---------------------------------------------------------------------
   CONFIGURACIÓN — lo único que hace falta tocar
   --------------------------------------------------------------------- */
const CONFIG = {
  // 1) URL de tu script de Google (la "aplicación web", termina en /exec).
  //    Es la forma que funciona desde cualquier página. Pegala entre las comillas.
  urlScript: "https://script.google.com/macros/s/AKfycbwyay_xSIQs6Ztql3bMw7tJUL0xWiekSENhTANjHtQ4DOks1zhS_3zHZzd2R8FdzG_M/exec",

  // 2) Tu hoja publicada como CSV. Se usa solo si no hay script o si el script falla
  //    (algunos navegadores bloquean este link cuando se lee desde otra página).
  urlCSV: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnP52iZV_APvewBsvYOp8hyZWW4yOsJztFBTpaU5OUnQmeTqYvGRxcDg3tg-l68vAD9zuu3oiZZ7kB/pub?gid=0&single=true&output=csv",

  // Cada cuántos minutos vuelve a leer la hoja mientras la página está abierta
  refrescarCadaMinutos: 5,

  // Nombres mal escritos en la hoja  →  cómo tienen que verse
  // (no importan mayúsculas, tildes ni espacios de más)
  correccionesDeNombres: {
    "rio iv": "Rio IV",
    "rio cuarto": "Rio IV",
    "yerba": "Yerba Buena"
  },

  // Une nombres cortados (ej. "Yerba" con "Yerba Buena") si nunca aparecen en la misma semana
  unirNombresCortados: true
};

/* Copia de respaldo: se usa solo si no hay conexión y nunca se pudo leer la hoja en este equipo */
const COPIA_INCLUIDA = `,SEMANA,31/8/2026,AL,4/9/2026,
Módulo,Lunes,Martes,Miércoles,Jueves,Viernes
0010,Alta Cba,Alberdi,Rio Iv,Alta Cba,Alberdi
,Carlos Paz,Cerro,,Carlos Paz,Cerro
,General Paz,Colon,,General Paz,Colon
,Jardin,Monseñor,,Jardin,Monseñor
,Manantiales,Recta,,Manantiales,Recta
,Nueva Cordoba,Villa Allende,,Nueva Cordoba,Villa Allende
,Sabattini,Calera,,Residencial,Calera
,,,,Sabattini,
,,,,Manantiales 2,
,Palermo,,Tucuman,Rafaela,Neuquen
,Recoleta,,Yerba Buena,Santa Fe,
,Residencial,,Salta,,
,Rosario,,,,
,Villa Maria,,,,
,SEMANA,7/9/2026,AL,11/9/2026,
Módulo,Lunes,Martes,Miércoles,Jueves,Viernes
0010,Alta Cba,Alberdi,Rio IV,Alta Cba,Alberdi
,Carlos Paz,Cerro,,Carlos Paz,Cerro
,General Paz,Colon,,General Paz,Colon
,Jardin,Monseñor,,Jardin,Monseñor
,Manantiales,Recta,,Manantiales,Recta
,Nueva Cordoba,Villa Allende,,Nueva Cordoba,Villa Allende
,Residencial,Calera,,Residencial,Calera
,Sabattini,,,Sabattini,
,,,,Manantiales 2,
,Palermo,Mendoza,La Rioja,,
,Recoleta,Godoy Cruz,San Juan,,
,Rosario,San Rafael,Santa Lucia,,
,Villa Maria,,,,
,SEMANA,14/9/2026,AL,18/9/2026,
Módulo,Lunes,Martes,Miércoles,Jueves,Viernes
0010,Alta Cba,Alberdi,Rio Iv,Alta Cba,Alberdi
,Carlos Paz,Cerro,,Carlos Paz,Cerro
,General Paz,Colon,,General Paz,Colon
,Jardin,Recta,,Jardin,Recta
,Manantiales,Villa Allende,,Manantiales,Villa Allende
,Nueva Cordoba,Monseñor,,Nueva Cordoba,Monseñor
,Sabattini,Calera,,Sabattini,Calera
,Residencial,,,Residencial,
,,,,Manantiales 2,
,Palermo,,Tucuman,Rafaela,Neuquen
,Rosario,,Yerba Buena,Santa Fe,
,Villa Maria,,Salta,,
,Recoleta,,,,
,SEMANA,21/9/2026,AL,25/9/2026,
Módulo,Lunes,Martes,Miércoles,Jueves,Viernes
0010,Alta Cba,Alberdi,Rio Iv,Alta Cba,Alberdi
,Carlos Paz,Cerro,,Carlos Paz,Cerro
,General Paz,Colon,,General Paz,Colon
,Jardin,Recta,,Jardin,Recta
,Manantiales,Villa Allende,,Manantiales,Villa Allende
,Nueva Cordoba,Monseñor,,Nueva Cordoba,Monseñor
,Sabattini,Calera,,Sabattini,Calera
,Residencial,,,Residencial,
,,,,Manantiales 2,
,Palermo,Mendoza,La Rioja,,
,Recoleta,Godoy Cruz,San Juan,,
,Rosario,San Rafael,Santa Lucia,,
,Villa Maria,,,,
,SEMANA,28/9/2026,AL,2/10/2026,
Módulo,Lunes,Martes,Miércoles,Jueves,Viernes
0010,Alta Cba,Alberdi,Rio iv,Alta Cba,Alberdi
,Carlos Paz,Cerro,,Carlos Paz,Cerro
,General Paz,Colon,,General Paz,Colon
,Jardin,Villa Allende,,Jardin,Recta
,Manantiales,Recta,,Manantiales,Villa Allende
,Nueva Cordoba,Monseñor,,Nueva Cordoba,Monseñor
,Sabattini,Calera,,Sabattini,Calera
,Residencial,,,Residencial,
,,,,Manantiales 2,
,Palermo,,,Santa Fe ,Neuquen
,Recoleta,,Tucuman,Rafaela,
,Villa Maria,,Yerba,,
,Rosario,,Salta,,
,SEMANA,5/10/2026,AL,9/10/2026,
Módulo,Lunes,Martes,Miércoles,Jueves,Viernes
0010,Alta Cba,Alberdi,Rio Iv,Alta Cba,Alberdi
,Carlos Paz,Cerro,,Carlos Paz,Cerro
,General Paz,Colon,,General Paz,Colon
,Jardin,Recta,,Jardin,Recta
,Manantiales,Villa Allende,,Manantiales,Villa Allende
,Nueva Cordoba,Monseñor,,Nueva Cordoba,Monseñor
,Sabattini,Calera,,Sabattini,Calera
,Residencial,,,Residencial,
,,,,Manantiales 2,
,Palermo,Mendoza,La Rioja,,
,Recoleta,Godoy Cruz,San Juan,,
,Rosario,San Rafael,Santa Lucia,,
,Villa Maria,,,,`;

/* --------------------------------------------------------------------- */

const DAY = 86400000;
const DIAS_NOMBRE = {lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5};
const DIA_ABREV = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const DIA_LARGO = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const unir = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];
const p2 = n => String(n).padStart(2, '0');

/* ---------------- Lectura del CSV ---------------- */
function parseCSV(text) {
  text = String(text).replace(/^\uFEFF/, '');
  const filas = []; let fila = [], celda = '', comillas = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (comillas) {
      if (c === '"') { if (text[i + 1] === '"') { celda += '"'; i++; } else comillas = false; }
      else celda += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(celda); celda = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      fila.push(celda); filas.push(fila); fila = []; celda = '';
    } else celda += c;
  }
  if (celda !== '' || fila.length) { fila.push(celda); filas.push(fila); }
  return filas;
}

function parseFecha(c) {
  const m = String(c == null ? '' : c).match(/^\s*(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\s*$/);
  if (!m) return null;
  let d = +m[1], mo = +m[2], y = +m[3];
  if (y < 100) y += 2000;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return Date.UTC(y, mo - 1, d);
}

function lunesDe(ms) {
  const wd = new Date(ms).getUTCDay();
  if (wd >= 1 && wd <= 5) return ms - (wd - 1) * DAY;
  return wd === 6 ? ms + 2 * DAY : ms + DAY;
}

const RE_AVISO = /^avisos?\s*:\s*(.+)$/i;
const RE_HORARIO = /^(?:horario(?:\s+l[ií]mite)?|hora\s+l[ií]mite|cierre(?:\s+de\s+pedidos?)?)\s*:\s*(.+)$/i;
const esParametro = t => RE_AVISO.test((t || '').trim()) || RE_HORARIO.test((t || '').trim());

function leerHoja(grid) {
  const avisos = []; let horario = '';
  grid.forEach(fila => fila.forEach(c => {
    const t = (c || '').trim(); let m;
    if ((m = t.match(RE_AVISO))) avisos.push(m[1].trim());
    else if ((m = t.match(RE_HORARIO))) horario = m[1].trim();
  }));

  const inicios = [];
  grid.forEach((f, i) => { if (f.some(c => norm(c) === 'semana')) inicios.push(i); });

  const porInicio = new Map();
  inicios.forEach((si, k) => {
    const fin = k + 1 < inicios.length ? inicios[k + 1] : grid.length;
    const fechas = grid[si].map(parseFecha).filter(x => x !== null);
    if (!fechas.length) return;

    let hi = -1, cols = {};
    for (let r = si + 1; r < Math.min(fin, si + 5); r++) {
      const tmp = {};
      grid[r].forEach((c, ci) => { const d = DIAS_NOMBRE[norm(c)]; if (d) tmp[d] = ci; });
      if (Object.keys(tmp).length >= 3) { hi = r; cols = tmp; break; }
    }
    if (hi < 0) return;

    const primera = Math.min.apply(null, Object.keys(cols).map(d => cols[d]));
    const dias = {1: [], 2: [], 3: [], 4: [], 5: []}; let modulo = '';
    for (let r = hi + 1; r < fin; r++) {
      const fila = grid[r];
      if (!modulo) {
        for (let ci = 0; ci < primera; ci++) {
          const t = (fila[ci] || '').trim();
          if (t && !esParametro(t)) { modulo = t; break; }
        }
      }
      Object.keys(cols).forEach(d => {
        const t = (fila[cols[d]] || '').replace(/\s+/g, ' ').trim();
        if (t && !esParametro(t)) dias[d].push(t);
      });
    }
    const ini = lunesDe(fechas[0]);
    const previa = porInicio.get(ini);
    if (previa) {
      for (let d = 1; d <= 5; d++) dias[d].forEach(n => { if (previa.dias[d].indexOf(n) < 0) previa.dias[d].push(n); });
    } else porInicio.set(ini, {inicio: ini, dias: dias, modulo: modulo});
  });

  const semanas = Array.from(porInicio.values())
    .filter(s => [1, 2, 3, 4, 5].some(d => s.dias[d].length))
    .sort((a, b) => a.inicio - b.inicio);
  return {semanas: semanas, avisos: avisos, horario: horario};
}

/* ---------------- Fechas ---------------- */
const fmtCorta = ms => { const d = new Date(ms); return d.getUTCDate() + '/' + (d.getUTCMonth() + 1); };
const rangoSemana = s => fmtCorta(s.inicio) + ' al ' + fmtCorta(s.inicio + 4 * DAY);
function hoyUTC() { const n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); }
const esActual = s => { const h = hoyUTC(); return h >= s.inicio && h <= s.inicio + 4 * DAY; };
const esPasada = s => hoyUTC() > s.inicio + 4 * DAY;
const fmtFechaHora = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());

/* ---------------- Armado de los datos ---------------- */
function construirModelo(semanas) {
  const N = semanas.length;
  const reglas = {};
  Object.keys(CONFIG.correccionesDeNombres || {}).forEach(k => { reglas[norm(k)] = CONFIG.correccionesDeNombres[k]; });
  const destinoDe = raw => { const k = norm(raw); return reglas[k] !== undefined ? norm(reglas[k]) : k; };

  const info = new Map();
  semanas.forEach((s, si) => {
    for (let d = 1; d <= 5; d++) s.dias[d].forEach(raw => {
      const ck = destinoDe(raw);
      let it = info.get(ck);
      if (!it) { it = {conteo: {}, semanas: new Set()}; info.set(ck, it); }
      it.conteo[raw] = (it.conteo[raw] || 0) + 1;
      it.semanas.add(si);
    });
  });

  const objetivos = Object.keys(reglas).map(k => reglas[k]);
  const nombre = new Map();
  info.forEach((it, ck) => {
    const t = objetivos.find(x => norm(x) === ck);
    if (t !== undefined) { nombre.set(ck, t); return; }
    let mejor = '', n = -1;
    Object.keys(it.conteo).forEach(sp => { if (it.conteo[sp] > n) { mejor = sp; n = it.conteo[sp]; } });
    nombre.set(ck, mejor);
  });

  const union = new Map();
  if (CONFIG.unirNombresCortados) {
    const claves = Array.from(info.keys());
    claves.forEach(a => {
      const cand = claves.filter(b => b !== a && b.indexOf(a + ' ') === 0);
      if (cand.length !== 1) return;
      const A = info.get(a), B = info.get(cand[0]);
      let conviven = false;
      A.semanas.forEach(x => { if (B.semanas.has(x)) conviven = true; });
      if (!conviven) union.set(a, cand[0]);
    });
  }
  const resolver = ck => { let n = 0; while (union.has(ck) && n++ < 10) ck = union.get(ck); return ck; };

  const franq = new Map(), correcciones = new Map();
  semanas.forEach((s, si) => {
    for (let d = 1; d <= 5; d++) s.dias[d].forEach(raw => {
      const ck = resolver(destinoDe(raw));
      let f = franq.get(ck);
      if (!f) { f = {clave: ck, nombre: nombre.get(ck), sem: new Array(N).fill(null)}; franq.set(ck, f); }
      if (!f.sem[si]) f.sem[si] = [];
      if (f.sem[si].indexOf(d) < 0) f.sem[si].push(d);
      if (raw !== f.nombre) correcciones.set(raw + '>' + f.nombre, {de: raw, a: f.nombre});
    });
  });

  const lista = Array.from(franq.values());
  lista.forEach(f => {
    f.sem.forEach(a => { if (a) a.sort((x, y) => x - y); });
    f.pres = f.sem.map(x => x ? '1' : '0').join('');
    if (f.pres.indexOf('0') < 0) {
      const firmas = f.sem.map(x => x.join(''));
      if (firmas.every(x => x === firmas[0])) f.grupo = f.sem[0].length === 1 ? 'unico' : 'fijo:' + firmas[0];
      else f.grupo = 'variable';
    } else f.grupo = 'ruta:' + f.pres;
  });

  const mapa = new Map();
  lista.forEach(f => { if (!mapa.has(f.grupo)) mapa.set(f.grupo, []); mapa.get(f.grupo).push(f); });
  const rango = k => {
    if (k.indexOf('fijo:') === 0) return '0' + k;
    if (k === 'unico') return '1';
    if (k === 'variable') return '2';
    const p = k.slice(5);
    return '3' + String(p.indexOf('1')).padStart(3, '0') + p;
  };
  const claves = Array.from(mapa.keys()).sort((a, b) => rango(a) < rango(b) ? -1 : rango(a) > rango(b) ? 1 : 0);

  let nRuta = 0;
  const grupos = claves.map(k => {
    const franqs = mapa.get(k).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', {sensitivity: 'base', numeric: true}));
    let titulo = '', detalle = '';
    if (k.indexOf('fijo:') === 0) {
      titulo = cap(unir(k.slice(5).split('').map(x => DIA_LARGO[+x])));
    } else if (k === 'unico') {
      titulo = 'Un solo día por semana';
    } else if (k === 'variable') {
      titulo = 'Días que cambian según la semana';
    } else {
      nRuta++; titulo = 'Ruta ' + nRuta;
      const fs = [];
      k.slice(5).split('').forEach((c, j) => { if (c === '1') fs.push(fmtCorta(semanas[j].inicio)); });
      detalle = 'semanas del ' + unir(fs);
    }
    return {clave: k, titulo: titulo, detalle: detalle, franqs: franqs};
  });

  const anomalias = [];
  if (N >= 4) {
    const porPatron = {};
    lista.forEach(f => { porPatron[f.pres] = (porPatron[f.pres] || 0) + 1; });
    lista.forEach(f => {
      const faltan = [];
      f.pres.split('').forEach((c, j) => { if (c === '0') faltan.push(j); });
      if (faltan.length === 1 && porPatron[f.pres] === 1)
        anomalias.push(f.nombre + ' no aparece en la semana del ' + rangoSemana(semanas[faltan[0]]) + ', pero sí en todas las demás.');
    });
  }

  return {semanas: semanas, grupos: grupos, correcciones: Array.from(correcciones.values()), anomalias: anomalias, total: lista.length};
}

function leer(texto) {
  const hoja = leerHoja(parseCSV(texto));
  return {hoja: hoja, modelo: hoja.semanas.length ? construirModelo(hoja.semanas) : null};
}

/* ---------------- Descarga de la hoja ---------------- */
/* JSONP: el script de Google se carga como <script>, así ningún navegador lo bloquea por CORS */
function jsonp(url, ms) {
  return new Promise((resolve, reject) => {
    const cb = '__cal_' + Date.now().toString(36) + Math.floor(Math.random() * 1e6);
    const s = document.createElement('script');
    let listo = false;
    const limpiar = () => { listo = true; clearTimeout(t); global.removeEventListener('error', alFallar); try { delete global[cb]; } catch (e) { global[cb] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); };
    // Si Google devuelve una página (por ejemplo, pidiendo autorización) en vez de datos, el navegador lo informa como error de script
    const alFallar = ev => {
      if (listo || !ev) return;
      const propio = ev.filename && ev.filename.indexOf(url.split('?')[0]) === 0;
      const anonimo = !ev.filename && /script error/i.test(ev.message || '');
      if (propio || anonimo) {
        limpiar(); reject(new Error('el script de Google devolvió una página en vez de datos (¿falta autorizarlo o elegir "Cualquier persona" al implementarlo?)'));
      }
    };
    global.addEventListener('error', alFallar);
    const t = setTimeout(() => { if (!listo) { limpiar(); reject(new Error('el script de Google tardó demasiado en responder')); } }, ms || 15000);
    global[cb] = d => { if (!listo) { limpiar(); resolve(d); } };
    s.onerror = () => { if (!listo) { limpiar(); reject(new Error('no se pudo cargar el script de Google; revisá que esté implementado para "Cualquier persona"')); } };
    s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cb + '&_=' + Date.now();
    document.head.appendChild(s);
  });
}

async function obtenerTexto() {
  const errores = [];
  if (CONFIG.urlScript) {
    try {
      const t = await jsonp(CONFIG.urlScript);
      if (typeof t === 'string' && /semana/i.test(t)) return t;
      errores.push('el script respondió, pero sin datos del calendario');
    } catch (e) { errores.push('Script de Google: ' + e.message); }
  }
  if (CONFIG.urlCSV) {
    try {
      const r = await fetch(CONFIG.urlCSV);
      if (!r.ok) throw new Error('la hoja respondió ' + r.status);
      const t = await r.text();
      if (!/semana/i.test(t)) throw new Error('la hoja publicada no tiene el formato esperado');
      return t;
    } catch (e) { errores.push('Hoja publicada: ' + e.message); }
  }
  throw new Error(errores.join(' | ') || 'no hay ninguna fuente de datos configurada');
}

const LS_KEY = 'calendarioPedidos:ultimaCopia';
function leerCopia() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; } }
function guardarCopia(t) { try { localStorage.setItem(LS_KEY, JSON.stringify({t: t, ts: Date.now()})); } catch (e) {} }

/* Devuelve {texto, fuente, ts, error}. fuente: 'hoja' (en vivo), 'guardada' (última lectura en este equipo) o 'incluida' */
async function cargar() {
  try {
    const texto = await obtenerTexto();
    guardarCopia(texto);
    return {texto: texto, fuente: 'hoja', ts: Date.now(), error: null};
  } catch (error) {
    const c = leerCopia();
    if (c && c.t) return {texto: c.t, fuente: 'guardada', ts: c.ts, error: error};
    return {texto: COPIA_INCLUIDA, fuente: 'incluida', ts: null, error: error};
  }
}

global.CalendarioDatos = {
  CONFIG: CONFIG, cargar: cargar, leer: leer,
  DAY: DAY, DIA_ABREV: DIA_ABREV, DIA_LARGO: DIA_LARGO, MESES: MESES,
  norm: norm, esc: esc, cap: cap, unir: unir, p2: p2,
  fmtCorta: fmtCorta, rangoSemana: rangoSemana, hoyUTC: hoyUTC, esActual: esActual, esPasada: esPasada, fmtFechaHora: fmtFechaHora
};
})(window);
