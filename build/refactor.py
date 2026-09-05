# -*- coding: utf-8 -*-
"""Conecta data.js y app.js a assets/js/core.js, y colapsa la consola de filtros
   en pantallas angostas (venia ocupando 517px de alto y tapaba la grilla)."""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fallos = []


def edit(path, pares):
    p = os.path.join(ROOT, path)
    s = io.open(p, encoding='utf-8').read()
    for a, b in pares:
        if a not in s:
            fallos.append(path + ' :: ' + a.strip().splitlines()[0][:66])
            continue
        s = s.replace(a, b, 1)
    io.open(p, 'w', encoding='utf-8').write(s)


# ---------------- data.js: usa core y se deja importar desde Node ----------------
edit('assets/js/data.js', [
    ("const IMG_BASE = ", "const HC = (typeof module === 'object' && module.exports)\n"
                          "  ? require('./core.js') : HudsonCore;\n\n"
                          "const IMG_BASE = "),
    ("""/* ---- Normalización: marca, segmento y URLs absolutas ---- */
const BRAND_FIX = { peuegot: 'Peugeot', vw: 'Volkswagen', byd: 'BYD', citroen: 'Citroën' };

function inferSegmento(titulo, tipo) {
  const t = titulo.toLowerCase();
  if (tipo === 'Camión' || /daily|accelo/.test(t)) return 'Camión';
  if (/sprinter|partner|kangoo/.test(t)) return 'Utilitario';
  if (/amarok|ranger|hilux|s10|frontier|toro/.test(t)) return 'Pick-up';
  if (/sw4|trailblazer|bronco|x-trail|taos|hr-v|corolla cross|journey|2008|territory|atto/.test(t)) return 'SUV';
  if (/a3|a4|cruze|c4 lounge|335i|430i|320i|500|corolla(?! cross)/.test(t)) return 'Sedán';
  return 'Hatchback';
}

const VEHICULOS = RAW.map(function (r) {""",
     """/* ---- Normalización: marca, segmento y URLs absolutas (ver core.js) ---- */
const VEHICULOS = RAW.map(function (r) {"""),
    ("""  const first = titulo.split(' ')[0];
  const marca = titulo.indexOf('Mercedes-Benz') === 0
    ? 'Mercedes-Benz'
    : (BRAND_FIX[first.toLowerCase()] || first);
  return {""",
     """  const marca = HC.normalizarMarca(titulo);
  return {"""),
    ("    segmento: inferSegmento(titulo, tipo),", "    segmento: HC.inferirSegmento(titulo, tipo),"),
])

# export para los tests
d = os.path.join(ROOT, 'assets', 'js', 'data.js')
s = io.open(d, encoding='utf-8').read().rstrip()
s += """

/* Para los tests en Node; en el navegador no cambia nada. */
if (typeof module === 'object' && module.exports) {
  module.exports = { RAW: RAW, VEHICULOS: VEHICULOS, CONTACTO: CONTACTO, IMG_BASE: IMG_BASE };
}
"""
io.open(d, 'w', encoding='utf-8').write(s)

# ---------------- app.js: delega en core ----------------
edit('assets/js/app.js', [
    ("""  var nf = new Intl.NumberFormat('es-AR');
  function km(v) { return v === 0 ? '0' : nf.format(v); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function waLink(v) {
    var t = 'Hola Hudson Cars! Me interesa el ' + v.titulo + ' (' + v.anio + ') que vi en el inventario. ¿Sigue disponible?';
    return 'https://wa.me/' + CONTACTO.wa + '?text=' + encodeURIComponent(t);
  }""",
     """  var HC = HudsonCore;                     /* logica pura, testeada aparte */
  var km = HC.formatearKm;
  var esc = HC.escapar;
  function waLink(v) { return HC.enlaceWhatsApp(v, CONTACTO.wa); }"""),

    ("""  /* ---------- filtrado ---------- */
  function filtrar() {
    var q = state.q.trim().toLowerCase();
    var out = VEHICULOS.filter(function (v) {
      if (q) {
        var hay = (v.titulo + ' ' + v.marca + ' ' + v.segmento + ' ' + v.anio + ' ' + v.combustible).toLowerCase();
        var ok = q.split(/\\s+/).every(function (w) { return hay.indexOf(w) > -1; });
        if (!ok) return false;
      }
      if (state.marca && v.marca !== state.marca) return false;
      if (state.seg && v.segmento !== state.seg) return false;
      if (state.comb && v.combustible !== state.comb) return false;
      if (state.cond === '0km' && !v.esNuevo) return false;
      if (state.cond === 'usado' && v.esNuevo) return false;
      if (state.quick === 'suv' && v.segmento !== 'SUV' && v.segmento !== 'Pick-up') return false;
      if (state.quick === 'lowkm' && !(v.esNuevo || v.km < 60000)) return false;
      if (state.quick === 'fav' && favs.indexOf(v.id) < 0) return false;
      return true;
    });

    var o = state.orden;
    out.sort(function (a, b) {
      if (o === 'anio-desc') return b.anio - a.anio;
      if (o === 'anio-asc') return a.anio - b.anio;
      if (o === 'km-asc') return a.km - b.km;
      if (o === 'km-desc') return b.km - a.km;
      if (o === 'az') return a.titulo.localeCompare(b.titulo, 'es');
      /* destacados: 0 km primero, después los más nuevos y con menos km */
      return (b.esNuevo - a.esNuevo) || (b.anio - a.anio) || (a.km - b.km);
    });
    return out;
  }""",
     """  /* ---------- filtrado (la logica vive en core.js) ---------- */
  function filtrar() { return HC.filtrar(VEHICULOS, state, favs); }"""),

    ("""    var wide = i % 7 === 0;                       /* rompe el ritmo de la grilla */
    var n = ('00' + (i + 1)).slice(-3);""",
     """    var wide = HC.esAncha(i);                     /* rompe el ritmo de la grilla */
    var n = HC.numeroInventario(i);"""),
])

# contador de filtros activos para el boton de mobile
edit('assets/js/app.js', [
    ("""    pills();
    dock();
    observar();""",
     """    pills();
    dock();
    observar();
    sincronizarBotonFiltros();"""),
])

print('fallos:', len(fallos))
for f in fallos:
    print('  x', f)
sys.exit(1 if fallos else 0)
