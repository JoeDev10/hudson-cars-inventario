/* ==================================================================
   HUDSON CARS — Inventario · lógica del prototipo (vanilla JS)
   ================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var PAGE = 12;

  var state = {
    q: '', marca: '', seg: '', comb: '', cond: '', quick: '',
    orden: 'rel', view: 'grid', shown: PAGE
  };

  var favs = load('hc_favs');
  var comp = [];

  function load(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var HC = HudsonCore;                     /* logica pura, testeada aparte */
  var km = HC.formatearKm;
  var esc = HC.escapar;
  function waLink(v) { return HC.enlaceWhatsApp(v, CONTACTO.wa); }

  /* ---------- filtrado (la logica vive en core.js) ---------- */
  function filtrar() { return HC.filtrar(VEHICULOS, state, favs); }

  /* ---------- tarjetas ---------- */
  function cardHTML(v, i) {
    var fav = favs.indexOf(v.id) > -1;
    var enComp = comp.indexOf(v.id) > -1;
    var wide = HC.esAncha(i);                     /* rompe el ritmo de la grilla */
    var n = HC.numeroInventario(i);
    return '' +
    '<article class="card' + (wide ? ' card--wide' : '') + '" data-id="' + v.id +
      '" style="transition-delay:' + Math.min(i % PAGE, 11) * 55 + 'ms">' +
      '<div class="shot" data-shot>' +
        '<img src="' + v.fotos[0] + '" alt="' + esc(v.titulo) + '" loading="lazy" decoding="async">' +
        '<div class="veil"></div>' +
        '<div class="badges">' +
          (v.esNuevo ? '<span class="badge new">0 km</span>' : '<span class="badge">' + v.anio + '</span>') +
          '<span class="badge seg">' + v.segmento + '</span>' +
        '</div>' +
        '<div class="tools">' +
          '<button class="tool' + (fav ? ' on' : '') + '" data-fav title="Guardar en favoritos" aria-label="Favorito">' +
            '<svg viewBox="0 0 24 24" fill="' + (fav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.6"><path d="M12 4.6l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 18l.9-5L4.8 9.9l5-.7z"/></svg>' +
          '</button>' +
          '<button class="tool' + (enComp ? ' on' : '') + '" data-comp title="Comparar" aria-label="Comparar">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h7M4 17h7M17 4v16M14 8l3-3 3 3"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="dots" data-dots>' + v.fotos.map(function (_, k) { return '<i class="' + (k === 0 ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
        '<div class="fotos">' + v.fotos.length + ' fotos</div>' +
        '<div class="peek"><span>Ver ficha</span><span>→</span></div>' +
      '</div>' +
      '<div class="card-body">' +
        '<span class="num">' + n + '</span>' +
        '<div>' +
          '<div class="marca">' + esc(v.marca) + '</div>' +
          '<h3>' + esc(v.modelo) + '</h3>' +
        '</div>' +
        (wide ? '<p class="extra">' + esc(v.desc) + '</p>' : '') +
        '<div class="specs">' +
          '<div><b>' + v.anio + '</b><span>Año</span></div>' +
          '<div><b>' + km(v.km) + '</b><span>Km</span></div>' +
          '<div><b>' + esc(v.combustible === 'No definido' ? 'Consultar' : v.combustible) + '</b><span>Combustible</span></div>' +
        '</div>' +
        '<div class="card-foot">' +
          '<div class="price"><b>Consultar</b><span>Precio · financiación</span></div>' +
          '<a class="go go--wa" href="' + waLink(v) + '" target="_blank" rel="noopener" aria-label="Consultar por WhatsApp" title="Consultar por WhatsApp">' +
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2"/></svg>' +
          '</a>' +
          '<button class="go" data-open aria-label="Ver ficha">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h13M12 5l7 7-7 7"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function render() {
    var list = filtrar();
    var grid = $('#grid');
    var visibles = list.slice(0, state.shown);

    grid.className = 'grid' + (state.view === 'list' ? ' list' : '');
    grid.innerHTML = visibles.length
      ? visibles.map(cardHTML).join('')
      : '<div class="empty" style="grid-column:1/-1">' +
          '<h3>Sin resultados</h3>' +
          '<p>No encontramos unidades con esos filtros. Probá ampliando la búsqueda o escribinos y la conseguimos.</p>' +
          '<a class="btn btn--wa" href="https://wa.me/' + CONTACTO.wa + '?text=' + encodeURIComponent('Hola! Busco un vehículo que no vi en el inventario.') + '" target="_blank" rel="noopener">Pedirlo por WhatsApp</a>' +
        '</div>';

    $('#count').innerHTML = '<b>' + list.length + '</b> / ' + VEHICULOS.length + ' unidades';
    $('#more').style.display = list.length > state.shown ? 'inline-flex' : 'none';
    $('#more').textContent = 'Ver más unidades (' + Math.max(0, list.length - state.shown) + ')';

    pills();
    dock();
    observar();
    sincronizarBotonFiltros();
  }

  /* ---------- entrada al scroll ---------- */
  var io_;

  /* Algunos visores (iframes en segundo plano) nunca entregan callbacks de
     IntersectionObserver. Si eso pasa, la grilla quedaría invisible: lo
     detectamos con una sonda y desactivamos el reveal. */
  function sondaIO() {
    function sinReveal() { document.body.classList.add('sin-reveal'); }
    if (!('IntersectionObserver' in window)) return sinReveal();
    var probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none';
    document.body.appendChild(probe);
    var ok = false;
    var o = new IntersectionObserver(function () { ok = true; limpiar(); }, {});
    o.observe(probe);
    setTimeout(function () { if (!ok) { limpiar(); sinReveal(); } }, 450);
    function limpiar() { o.disconnect(); if (probe.parentNode) probe.parentNode.removeChild(probe); }
  }
  function observar() {
    var items = $$('.card, .usp');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    if (!io_) {
      io_ = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io_.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    }
    items.forEach(function (el) { if (!el.classList.contains('in')) io_.observe(el); });
  }

  /* ---------- pills de filtros activos ---------- */
  var LABELS = { q: 'Búsqueda', marca: 'Marca', seg: 'Segmento', comb: 'Combustible', cond: 'Condición', quick: 'Filtro' };
  var QUICK_TXT = { suv: 'SUV & Pick-up', lowkm: 'Menos de 60.000 km', fav: 'Favoritos' };
  function pills() {
    var out = [];
    ['q', 'marca', 'seg', 'comb', 'cond', 'quick'].forEach(function (k) {
      if (!state[k]) return;
      var val = k === 'quick' ? QUICK_TXT[state[k]] : (k === 'cond' ? (state[k] === '0km' ? '0 km' : 'Usados') : state[k]);
      out.push('<span class="pill">' + LABELS[k] + ': ' + esc(val) + ' <button data-drop="' + k + '" aria-label="Quitar filtro">✕</button></span>');
    });
    $('#pills').innerHTML = out.join('');
  }

  /* ---------- comparador ---------- */
  function dock() {
    var d = $('#dock');
    d.classList.toggle('on', comp.length > 0);
    var t = comp.map(function (id) {
      var v = byId(id);
      return '<img src="' + v.fotos[0] + '" alt="' + esc(v.titulo) + '" title="' + esc(v.titulo) + '">';
    });
    while (t.length < 3) t.push('<div class="slot"></div>');
    $('#dockThumbs').innerHTML = t.join('');
  }
  function byId(id) { return VEHICULOS.filter(function (v) { return v.id === id; })[0]; }

  function compararHTML() {
    var vs = comp.map(byId);
    var filas = [
      ['Marca', function (v) { return v.marca; }],
      ['Versión', function (v) { return v.modelo; }],
      ['Año', function (v) { return v.anio; }],
      ['Kilómetros', function (v) { return km(v.km); }],
      ['Condición', function (v) { return v.condicion; }],
      ['Segmento', function (v) { return v.segmento; }],
      ['Combustible', function (v) { return v.combustible === 'No definido' ? 'Consultar' : v.combustible; }],
      ['Fotos', function (v) { return v.fotos.length; }]
    ];
    return '' +
    '<button class="close" data-close aria-label="Cerrar">✕</button>' +
    '<div class="info">' +
      '<div><div class="marca">Comparación</div><h2>' + vs.length + ' unidades</h2></div>' +
      '<div style="overflow-x:auto">' +
        '<table style="width:100%;border-collapse:collapse;min-width:' + (160 + vs.length * 190) + 'px">' +
          '<tr><td></td>' + vs.map(function (v) {
            return '<td style="padding:10px;border-bottom:1px solid var(--line)">' +
              '<img src="' + v.fotos[0] + '" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:2px;margin-bottom:9px">' +
              '<div class="mono" style="color:var(--oxide)">' + esc(v.marca) + '</div>' +
              '<div style="font-family:var(--f-display);font-weight:700;font-size:20px;text-transform:uppercase;line-height:1">' + esc(v.modelo) + '</div>' +
            '</td>';
          }).join('') + '</tr>' +
          filas.map(function (f) {
            return '<tr><td class="mono" style="padding:11px 10px;color:var(--bone-mute);border-bottom:1px solid var(--line-soft);white-space:nowrap">' + f[0] + '</td>' +
              vs.map(function (v) {
                return '<td style="padding:11px 10px;border-bottom:1px solid var(--line-soft);font-family:var(--f-mono);font-size:13px">' + esc(f[1](v)) + '</td>';
              }).join('') + '</tr>';
          }).join('') +
          '<tr><td></td>' + vs.map(function (v) {
            return '<td style="padding:14px 10px"><a class="btn btn--wa btn--sm" style="width:100%" href="' + waLink(v) + '" target="_blank" rel="noopener">Consultar</a></td>';
          }).join('') + '</tr>' +
        '</table>' +
      '</div>' +
    '</div>';
  }

  /* ---------- ficha ---------- */
  var galIdx = 0, galV = null;

  function fichaHTML(v) {
    galV = v; galIdx = 0;
    return '' +
    '<button class="close" data-close aria-label="Cerrar">✕</button>' +
    '<div class="sheet-grid">' +
      '<div class="gal">' +
        '<div class="main"><img id="galMain" src="' + v.fotos[0] + '" alt="' + esc(v.titulo) + '"></div>' +
        '<span class="idx mono" id="galIdx">01 / ' + String(v.fotos.length).padStart(2, '0') + '</span>' +
        (v.fotos.length > 1 ? '<button class="arrow prev" data-gal="-1" aria-label="Anterior">‹</button><button class="arrow next" data-gal="1" aria-label="Siguiente">›</button>' : '') +
        '<div class="strip2" id="galStrip">' + v.fotos.map(function (f, k) {
          return '<img src="' + f + '" class="' + (k === 0 ? 'on' : '') + '" data-i="' + k + '" alt="">';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="info">' +
        '<div>' +
          '<div class="marca">' + esc(v.marca) + ' · ' + v.segmento + '</div>' +
          '<h2>' + esc(v.modelo) + '</h2>' +
        '</div>' +
        '<div class="tabla">' +
          '<div><span>Año</span><b>' + v.anio + '</b></div>' +
          '<div><span>Kilómetros</span><b>' + km(v.km) + '</b></div>' +
          '<div><span>Condición</span><b>' + v.condicion + '</b></div>' +
          '<div><span>Combustible</span><b>' + esc(v.combustible === 'No definido' ? 'Consultar' : v.combustible) + '</b></div>' +
          '<div><span>Tipo</span><b>' + esc(v.tipo) + '</b></div>' +
          '<div><span>Referencia</span><b>#' + v.id + '</b></div>' +
        '</div>' +
        '<p>' + esc(v.desc) + '</p>' +
        '<div class="cta-row">' +
          '<a class="btn btn--wa" href="' + waLink(v) + '" target="_blank" rel="noopener">Consultar por WhatsApp</a>' +
          '<a class="btn" href="tel:' + CONTACTO.telHref + '">Llamar ahora</a>' +
        '</div>' +
        '<div class="notice">' +
          'Tomamos tu usado en parte de pago · Financiación prendaria y bancaria<br>' +
          'Showroom: ' + CONTACTO.dir + ' · ' + CONTACTO.cp +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function galGo(dir, abs) {
    if (!galV) return;
    galIdx = abs != null ? abs : (galIdx + dir + galV.fotos.length) % galV.fotos.length;
    var m = $('#galMain');
    m.src = galV.fotos[galIdx];
    m.style.animation = 'none'; void m.offsetWidth; m.style.animation = '';
    $('#galIdx').textContent = String(galIdx + 1).padStart(2, '0') + ' / ' + String(galV.fotos.length).padStart(2, '0');
    $$('#galStrip img').forEach(function (t, k) { t.classList.toggle('on', k === galIdx); });
  }

  function openModal(html) {
    $('#sheet').innerHTML = html;
    $('#modal').classList.add('on');
    document.body.classList.add('is-locked');
  }
  function closeModal() {
    $('#modal').classList.remove('on');
    document.body.classList.remove('is-locked');
    galV = null;
    setTimeout(function () { if (!$('#modal').classList.contains('on')) $('#sheet').innerHTML = ''; }, 320);
  }

  /* cuántos filtros hay puestos, para el botón de mobile */
  function sincronizarBotonFiltros() {
    var n = HC.filtrosActivos(state).length;
    var badge = $('#filtrosN');
    if (!badge) return;
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  /* ---------- toast ---------- */
  var tTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove('on'); }, 2200);
  }

  /* ---------- init ---------- */
  function init() {
    /* contadores */
    var nuevos = VEHICULOS.filter(function (v) { return v.esNuevo; }).length;
    var marcas = uniq(VEHICULOS.map(function (v) { return v.marca; })).sort();
    animate('#cTotal', VEHICULOS.length);
    animate('#cNuevos', nuevos);
    animate('#cUsados', VEHICULOS.length - nuevos);
    animate('#cMarcas', marcas.length);

    /* marquee */
    var ms = marcas.concat(marcas);
    $('#marquee').innerHTML = ms.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');

    /* selects */
    fill('#fMarca', marcas);
    fill('#fSeg', uniq(VEHICULOS.map(function (v) { return v.segmento; })).sort());
    fill('#fComb', uniq(VEHICULOS.map(function (v) { return v.combustible; })).filter(function (c) { return c !== 'No definido'; }).sort());

    $('#year').textContent = new Date().getFullYear();
    sondaIO();

    /* esqueletos → contenido */
    $('#grid').innerHTML = Array(6).join('x').split('x').map(function () {
      return '<div class="sk"><div class="a"></div><div class="b"></div><div class="c"></div></div>';
    }).join('');
    setTimeout(render, 380);
    observar();

    bind();
  }

  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
  function fill(sel, arr) {
    $(sel).insertAdjacentHTML('beforeend', arr.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join(''));
  }
  function animate(sel, to) {
    var el = $(sel), t0 = null, dur = 900;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return; }
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }

  /* ---------- eventos ---------- */
  function bind() {
    var q = $('#q'), deb;
    q.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(function () { state.q = q.value; state.shown = PAGE; render(); }, 180);
    });

    [['#fMarca', 'marca'], ['#fSeg', 'seg'], ['#fComb', 'comb'], ['#fOrden', 'orden']].forEach(function (p) {
      $(p[0]).addEventListener('change', function () { state[p[1]] = this.value; state.shown = PAGE; render(); });
    });

    $('#chips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      if (b.hasAttribute('data-cond')) {
        state.cond = b.getAttribute('data-cond');
        $$('#chips .chip[data-cond]').forEach(function (c) { c.classList.toggle('on', c === b); });
      } else {
        var k = b.getAttribute('data-quick');
        state.quick = state.quick === k ? '' : k;
        b.classList.toggle('on', state.quick === k);
      }
      state.shown = PAGE; render();
    });

    $('#pills').addEventListener('click', function (e) {
      var b = e.target.closest('[data-drop]'); if (!b) return;
      var k = b.getAttribute('data-drop');
      state[k] = '';
      if (k === 'q') $('#q').value = '';
      if (k === 'marca') $('#fMarca').value = '';
      if (k === 'seg') $('#fSeg').value = '';
      if (k === 'comb') $('#fComb').value = '';
      if (k === 'cond') $$('#chips .chip[data-cond]').forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-cond') === ''); });
      if (k === 'quick') $$('#chips .chip[data-quick]').forEach(function (c) { c.classList.remove('on'); });
      state.shown = PAGE; render();
    });

    $('#clear').addEventListener('click', function () {
      state.q = state.marca = state.seg = state.comb = state.cond = state.quick = '';
      state.orden = 'rel'; state.shown = PAGE;
      $('#q').value = ''; $('#fMarca').value = ''; $('#fSeg').value = ''; $('#fComb').value = ''; $('#fOrden').value = 'rel';
      $$('#chips .chip').forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-cond') === ''); });
      render();
    });

    $('#vGrid').addEventListener('click', function () { setView('grid'); });
    $('#vList').addEventListener('click', function () { setView('list'); });
    function setView(v) {
      state.view = v;
      $('#vGrid').classList.toggle('on', v === 'grid');
      $('#vList').classList.toggle('on', v === 'list');
      render();
    }

    $('#more').addEventListener('click', function () { state.shown += PAGE; render(); });

    /* grilla: favoritos, comparar, abrir ficha, carrusel al hover */
    var grid = $('#grid');
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.card'); if (!card) return;
      var id = +card.getAttribute('data-id');
      if (e.target.closest('[data-fav]')) {
        var i = favs.indexOf(id);
        if (i > -1) { favs.splice(i, 1); toast('Quitado de favoritos'); }
        else { favs.push(id); toast('Guardado en favoritos'); }
        save('hc_favs', favs); render(); return;
      }
      if (e.target.closest('[data-comp]')) {
        var j = comp.indexOf(id);
        if (j > -1) comp.splice(j, 1);
        else if (comp.length >= 3) { toast('Podés comparar hasta 3 unidades'); return; }
        else comp.push(id);
        render(); return;
      }
      if (e.target.closest('a')) return;
      openModal(fichaHTML(byId(id)));
    });

    grid.addEventListener('mouseover', function (e) {
      var shot = e.target.closest('[data-shot]'); if (!shot || shot._t) return;
      var card = shot.closest('.card');
      var v = byId(+card.getAttribute('data-id'));
      if (v.fotos.length < 2) return;
      var img = shot.querySelector('img'), dots = $$('i', shot.querySelector('[data-dots]')), k = 0;
      shot._t = setInterval(function () {
        k = (k + 1) % v.fotos.length;
        img.src = v.fotos[k];
        dots.forEach(function (d, n) { d.classList.toggle('on', n === k); });
      }, 1050);
    });
    grid.addEventListener('mouseout', function (e) {
      var shot = e.target.closest('[data-shot]');
      if (!shot || shot.contains(e.relatedTarget) || !shot._t) return;
      clearInterval(shot._t); shot._t = null;
      var card = shot.closest('.card');
      var v = byId(+card.getAttribute('data-id'));
      shot.querySelector('img').src = v.fotos[0];
      $$('i', shot.querySelector('[data-dots]')).forEach(function (d, n) { d.classList.toggle('on', n === 0); });
    });

    /* comparador */
    $('#doCompare').addEventListener('click', function () {
      if (comp.length < 2) { toast('Elegí al menos 2 unidades'); return; }
      openModal(compararHTML());
    });
    $('#clearCompare').addEventListener('click', function () { comp = []; render(); });

    /* modal */
    $('#modal').addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) return closeModal();
      var g = e.target.closest('[data-gal]');
      if (g) return galGo(+g.getAttribute('data-gal'));
      var t = e.target.closest('#galStrip img');
      if (t) return galGo(0, +t.getAttribute('data-i'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); $('#drawer').classList.remove('on'); }
      if (e.key === '/' && document.activeElement !== $('#q')) { e.preventDefault(); $('#q').focus(); }
      if (galV && e.key === 'ArrowRight') galGo(1);
      if (galV && e.key === 'ArrowLeft') galGo(-1);
    });

    /* modo claro / oscuro */
    var btnModo = $('#modo');
    btnModo.addEventListener('click', function () {
      var claro = document.documentElement.getAttribute('data-modo') === 'claro';
      aplicarModo(claro ? 'oscuro' : 'claro');
      toast(claro ? 'Modo oscuro' : 'Modo claro');
    });
    function aplicarModo(m) {
      if (m === 'claro') document.documentElement.setAttribute('data-modo', 'claro');
      else document.documentElement.removeAttribute('data-modo');
      btnModo.setAttribute('aria-label', m === 'claro' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
      try { localStorage.setItem('hc_modo', m); } catch (err) {}
    }
    aplicarModo(document.documentElement.getAttribute('data-modo') === 'claro' ? 'claro' : 'oscuro');

    /* filtros colapsables en pantallas angostas */
    var consola = $('.console-in'), btnFiltros = $('#filtrosToggle');
    btnFiltros.addEventListener('click', function () {
      var abierto = consola.classList.toggle('abierto');
      btnFiltros.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });

    /* menú móvil */
    $('#burger').addEventListener('click', function () { $('#drawer').classList.add('on'); });
    $('#closeDrawer').addEventListener('click', function () { $('#drawer').classList.remove('on'); });
    $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { $('#drawer').classList.remove('on'); }); });

    /* newsletter (demo) */
    $('#subForm').addEventListener('submit', function (e) {
      e.preventDefault(); this.reset(); toast('¡Listo! Te sumamos a las novedades');
    });

    /* cursor propio sobre la grilla */
    var cur = $('#cursor'), fino = matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (fino) {
      grid.addEventListener('mousemove', function (e) {
        cur.style.setProperty('--x', e.clientX + 'px');
        cur.style.setProperty('--y', e.clientY + 'px');
        cur.classList.toggle('on', !!e.target.closest('.card') && !e.target.closest('a,button'));
      });
      grid.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
    }

    /* progreso de lectura en el riel */
    var bar = $('#railBar');
    if (bar) {
      addEventListener('scroll', function () {
        var max = document.body.scrollHeight - innerHeight;
        bar.style.height = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
      }, { passive: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
