/* Pruebas unitarias de la lógica pura: filtrado, orden, clasificación y formato.
   Correr con:  node --test tests/ */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const HC = require('../assets/js/core.js');

const auto = (extra) => Object.assign({
  id: 1, titulo: 'Ford Ka S 1.5', marca: 'Ford', modelo: 'Ka S 1.5',
  anio: 2017, km: 82000, combustible: 'Nafta', tipo: 'Auto o Camioneta',
  condicion: 'Usado', esNuevo: false, segmento: 'Hatchback', desc: '', fotos: ['a.webp']
}, extra);

describe('normalizarMarca', () => {
  test('toma la primera palabra del título', () => {
    assert.equal(HC.normalizarMarca('Ford Ka S 1.5'), 'Ford');
    assert.equal(HC.normalizarMarca('Audi A3'), 'Audi');
  });

  test('corrige el typo del sitio de origen', () => {
    assert.equal(HC.normalizarMarca('peuegot 2008'), 'Peugeot');
  });

  test('Mercedes-Benz es una marca de dos palabras', () => {
    assert.equal(HC.normalizarMarca('Mercedes-Benz Sprinter 314'), 'Mercedes-Benz');
  });

  test('respeta las mayúsculas de marcas cortas', () => {
    assert.equal(HC.normalizarMarca('BYD Atto 2'), 'BYD');
    assert.equal(HC.normalizarMarca('BMW 320i E30'), 'BMW');
  });
});

describe('inferirSegmento', () => {
  const casos = [
    ['Toyota Hilux SRX 4x4 AT', 'Auto o Camioneta', 'Pick-up'],
    ['Volkswagen Amarok 2.0 TDI 4x4 AT', 'Auto o Camioneta', 'Pick-up'],
    ['Ford Bronco Sport Wildtrak 2.0 4x4', 'Auto o Camioneta', 'SUV'],
    ['Nissan X-Trail 4x4 AT', 'Auto o Camioneta', 'SUV'],
    ['Mercedes-Benz Sprinter 314 Mixta', 'Auto o Camioneta', 'Utilitario'],
    ['Peugeot Partner Confort HDi 1.6', 'Auto o Camioneta', 'Utilitario'],
    ['Iveco Daily 55-170', 'Camión', 'Camión'],
    ['Mercedes-Benz Accelo 1016/39', 'Camión', 'Camión'],
    ['Audi A4 40 TFSI', 'Auto o Camioneta', 'Sedán'],
    ['Chevrolet Onix LT 1.4', 'Auto o Camioneta', 'Hatchback']
  ];
  for (const [titulo, tipo, esperado] of casos) {
    test(`${titulo} -> ${esperado}`, () => {
      assert.equal(HC.inferirSegmento(titulo, tipo), esperado);
    });
  }

  test('Corolla Cross es SUV y no sedán, aunque diga Corolla', () => {
    assert.equal(HC.inferirSegmento('Toyota Corolla Cross XLI', 'Auto o Camioneta'), 'SUV');
    assert.equal(HC.inferirSegmento('Toyota Corolla GR Sport', 'Auto o Camioneta'), 'Sedán');
  });
});

describe('coincideBusqueda', () => {
  const v = auto();
  test('vacía deja pasar todo', () => assert.equal(HC.coincideBusqueda(v, ''), true));
  test('no distingue mayúsculas', () => assert.equal(HC.coincideBusqueda(v, 'FORD'), true));
  test('busca en el año', () => assert.equal(HC.coincideBusqueda(v, '2017'), true));
  test('todas las palabras tienen que estar', () => {
    assert.equal(HC.coincideBusqueda(v, 'ford ka'), true);
    assert.equal(HC.coincideBusqueda(v, 'ford audi'), false);
  });
  test('ignora espacios de más', () => {
    assert.equal(HC.coincideBusqueda(v, '  ford   ka  '), true);
  });
});

describe('pasaFiltros', () => {
  test('marca, segmento y combustible', () => {
    const v = auto();
    assert.equal(HC.pasaFiltros(v, { marca: 'Ford' }, []), true);
    assert.equal(HC.pasaFiltros(v, { marca: 'Audi' }, []), false);
    assert.equal(HC.pasaFiltros(v, { seg: 'Hatchback' }, []), true);
    assert.equal(HC.pasaFiltros(v, { comb: 'Diesel' }, []), false);
  });

  test('condición 0 km vs usado', () => {
    const usado = auto(), nuevo = auto({ esNuevo: true, km: 0 });
    assert.equal(HC.pasaFiltros(usado, { cond: 'usado' }, []), true);
    assert.equal(HC.pasaFiltros(usado, { cond: '0km' }, []), false);
    assert.equal(HC.pasaFiltros(nuevo, { cond: '0km' }, []), true);
  });

  test('atajo SUV incluye pick-ups', () => {
    assert.equal(HC.pasaFiltros(auto({ segmento: 'SUV' }), { quick: 'suv' }, []), true);
    assert.equal(HC.pasaFiltros(auto({ segmento: 'Pick-up' }), { quick: 'suv' }, []), true);
    assert.equal(HC.pasaFiltros(auto({ segmento: 'Sedán' }), { quick: 'suv' }, []), false);
  });

  test('atajo pocos km: los 0 km siempre entran', () => {
    assert.equal(HC.pasaFiltros(auto({ km: 30000 }), { quick: 'lowkm' }, []), true);
    assert.equal(HC.pasaFiltros(auto({ km: 90000 }), { quick: 'lowkm' }, []), false);
    assert.equal(HC.pasaFiltros(auto({ km: 0, esNuevo: true }), { quick: 'lowkm' }, []), true);
  });

  test('el límite de pocos km es estricto', () => {
    assert.equal(HC.pasaFiltros(auto({ km: HC.KM_BAJO - 1 }), { quick: 'lowkm' }, []), true);
    assert.equal(HC.pasaFiltros(auto({ km: HC.KM_BAJO }), { quick: 'lowkm' }, []), false);
  });

  test('favoritos filtra por id', () => {
    const v = auto({ id: 42 });
    assert.equal(HC.pasaFiltros(v, { quick: 'fav' }, [42]), true);
    assert.equal(HC.pasaFiltros(v, { quick: 'fav' }, [7]), false);
    assert.equal(HC.pasaFiltros(v, { quick: 'fav' }, []), false);
  });

  test('los filtros se acumulan', () => {
    const v = auto();
    assert.equal(HC.pasaFiltros(v, { marca: 'Ford', seg: 'Hatchback' }, []), true);
    assert.equal(HC.pasaFiltros(v, { marca: 'Ford', seg: 'SUV' }, []), false);
  });

  test('estado vacío no filtra nada', () => {
    assert.equal(HC.pasaFiltros(auto(), HC.estadoInicial(12), []), true);
  });
});

describe('orden', () => {
  const lista = () => [
    auto({ id: 1, titulo: 'Zeta', anio: 2015, km: 50000 }),
    auto({ id: 2, titulo: 'Alfa', anio: 2020, km: 90000 }),
    auto({ id: 3, titulo: 'Beta', anio: 2018, km: 10000, esNuevo: true })
  ];
  const ids = (o) => HC.filtrar(lista(), Object.assign(HC.estadoInicial(12), { orden: o }), []).map(v => v.id);

  test('año descendente', () => assert.deepEqual(ids('anio-desc'), [2, 3, 1]));
  test('año ascendente', () => assert.deepEqual(ids('anio-asc'), [1, 3, 2]));
  test('km ascendente', () => assert.deepEqual(ids('km-asc'), [3, 1, 2]));
  test('km descendente', () => assert.deepEqual(ids('km-desc'), [2, 1, 3]));
  test('alfabético respeta el español', () => assert.deepEqual(ids('az'), [2, 3, 1]));
  test('destacados pone los 0 km primero', () => assert.equal(ids('rel')[0], 3));

  test('no muta el arreglo original', () => {
    const orig = lista();
    const copia = orig.slice();
    HC.filtrar(orig, Object.assign(HC.estadoInicial(12), { orden: 'az' }), []);
    assert.deepEqual(orig.map(v => v.id), copia.map(v => v.id));
  });
});

describe('formato', () => {
  test('km con separador de miles', () => {
    assert.equal(HC.formatearKm(0), '0');
    assert.match(HC.formatearKm(152600), /152.600/);
  });

  test('escapar evita inyección de HTML', () => {
    assert.equal(HC.escapar('<img src=x onerror=alert(1)>'),
      '&lt;img src=x onerror=alert(1)&gt;');
    assert.equal(HC.escapar('Citroën "C4" & más'), 'Citroën &quot;C4&quot; &amp; más');
  });

  test('el link de WhatsApp lleva el mensaje codificado', () => {
    const url = HC.enlaceWhatsApp(auto(), '5491130473778');
    assert.ok(url.startsWith('https://wa.me/5491130473778?text='));
    assert.ok(!/[ ¿]/.test(url), 'no puede haber espacios ni signos sin codificar');
    assert.match(decodeURIComponent(url), /Ford Ka S 1\.5 \(2017\)/);
  });
});

describe('grilla', () => {
  test('la numeración va con tres dígitos', () => {
    assert.equal(HC.numeroInventario(0), '001');
    assert.equal(HC.numeroInventario(9), '010');
    assert.equal(HC.numeroInventario(99), '100');
  });

  test('una de cada siete rompe el ritmo', () => {
    const anchas = Array.from({ length: 21 }, (_, i) => i).filter(HC.esAncha);
    assert.deepEqual(anchas, [0, 7, 14]);
  });
});

describe('filtrosActivos', () => {
  test('cuenta solo lo que está puesto', () => {
    assert.deepEqual(HC.filtrosActivos(HC.estadoInicial(12)), []);
    assert.deepEqual(HC.filtrosActivos({ q: 'bmw', marca: 'BMW', seg: '' }), ['q', 'marca']);
  });

  test('el orden y la vista no son filtros', () => {
    assert.deepEqual(HC.filtrosActivos({ orden: 'az', view: 'list' }), []);
  });
});
