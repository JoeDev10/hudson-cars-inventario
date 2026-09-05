/* ==================================================================
   HUDSON CARS — lógica pura, sin DOM.
   Vive acá para poder testearla en Node sin navegador.
   Funciona como global en el navegador (HudsonCore) y como módulo en Node.
   ================================================================== */
(function (global, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else global.HudsonCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var MARCAS_CORREGIDAS = { peuegot: 'Peugeot', vw: 'Volkswagen', byd: 'BYD', citroen: 'Citroën' };

  /* ---------- texto y formato ---------- */

  var nf = new Intl.NumberFormat('es-AR');
  function formatearKm(v) { return v === 0 ? '0' : nf.format(v); }

  function escapar(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function enlaceWhatsApp(v, numero) {
    var t = 'Hola Hudson Cars! Me interesa el ' + v.titulo + ' (' + v.anio +
            ') que vi en el inventario. ¿Sigue disponible?';
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(t);
  }

  /* ---------- clasificación ---------- */

  function normalizarMarca(titulo) {
    if (titulo.indexOf('Mercedes-Benz') === 0) return 'Mercedes-Benz';
    var primera = titulo.split(' ')[0];
    return MARCAS_CORREGIDAS[primera.toLowerCase()] || primera;
  }

  function inferirSegmento(titulo, tipo) {
    var t = titulo.toLowerCase();
    if (tipo === 'Camión' || /daily|accelo/.test(t)) return 'Camión';
    if (/sprinter|partner|kangoo/.test(t)) return 'Utilitario';
    if (/amarok|ranger|hilux|s10|frontier|toro/.test(t)) return 'Pick-up';
    if (/sw4|trailblazer|bronco|x-trail|taos|hr-v|corolla cross|journey|2008|territory|atto/.test(t)) return 'SUV';
    if (/a3|a4|cruze|c4 lounge|335i|430i|320i|500|corolla(?! cross)/.test(t)) return 'Sedán';
    return 'Hatchback';
  }

  /* ---------- filtrado ---------- */

  function coincideBusqueda(v, q) {
    if (!q) return true;
    var heno = (v.titulo + ' ' + v.marca + ' ' + v.segmento + ' ' + v.anio + ' ' +
                v.combustible).toLowerCase();
    return q.toLowerCase().trim().split(/\s+/).every(function (palabra) {
      return heno.indexOf(palabra) > -1;
    });
  }

  var KM_BAJO = 60000;

  function pasaFiltros(v, estado, favoritos) {
    favoritos = favoritos || [];
    if (!coincideBusqueda(v, estado.q)) return false;
    if (estado.marca && v.marca !== estado.marca) return false;
    if (estado.seg && v.segmento !== estado.seg) return false;
    if (estado.comb && v.combustible !== estado.comb) return false;
    if (estado.cond === '0km' && !v.esNuevo) return false;
    if (estado.cond === 'usado' && v.esNuevo) return false;
    if (estado.quick === 'suv' && v.segmento !== 'SUV' && v.segmento !== 'Pick-up') return false;
    if (estado.quick === 'lowkm' && !(v.esNuevo || v.km < KM_BAJO)) return false;
    if (estado.quick === 'fav' && favoritos.indexOf(v.id) < 0) return false;
    return true;
  }

  function comparador(orden) {
    return function (a, b) {
      if (orden === 'anio-desc') return b.anio - a.anio;
      if (orden === 'anio-asc') return a.anio - b.anio;
      if (orden === 'km-asc') return a.km - b.km;
      if (orden === 'km-desc') return b.km - a.km;
      if (orden === 'az') return a.titulo.localeCompare(b.titulo, 'es');
      /* destacados: 0 km primero, después los más nuevos y con menos km */
      return (b.esNuevo - a.esNuevo) || (b.anio - a.anio) || (a.km - b.km);
    };
  }

  function filtrar(vehiculos, estado, favoritos) {
    return vehiculos
      .filter(function (v) { return pasaFiltros(v, estado, favoritos); })
      .sort(comparador(estado.orden));
  }

  /* ---------- presentación de la grilla ---------- */

  function numeroInventario(i) { return ('00' + (i + 1)).slice(-3); }

  /* una de cada siete rompe el ritmo ocupando doble ancho */
  var CADA = 7;
  function esAncha(i) { return i % CADA === 0; }

  /* ---------- filtros activos ---------- */

  var CLAVES_FILTRO = ['q', 'marca', 'seg', 'comb', 'cond', 'quick'];

  function filtrosActivos(estado) {
    return CLAVES_FILTRO.filter(function (k) { return !!estado[k]; });
  }

  function estadoInicial(porPagina) {
    return {
      q: '', marca: '', seg: '', comb: '', cond: '', quick: '',
      orden: 'rel', view: 'grid', shown: porPagina
    };
  }

  return {
    MARCAS_CORREGIDAS: MARCAS_CORREGIDAS,
    KM_BAJO: KM_BAJO,
    CLAVES_FILTRO: CLAVES_FILTRO,
    formatearKm: formatearKm,
    escapar: escapar,
    enlaceWhatsApp: enlaceWhatsApp,
    normalizarMarca: normalizarMarca,
    inferirSegmento: inferirSegmento,
    coincideBusqueda: coincideBusqueda,
    pasaFiltros: pasaFiltros,
    comparador: comparador,
    filtrar: filtrar,
    numeroInventario: numeroInventario,
    esAncha: esAncha,
    filtrosActivos: filtrosActivos,
    estadoInicial: estadoInicial
  };
});
