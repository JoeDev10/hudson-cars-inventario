/* Integridad del inventario: que no se cuele una unidad rota, una foto que falta
   o un dato imposible. Correr con:  node --test tests/ */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const { RAW, VEHICULOS, CONTACTO } = require('../assets/js/data.js');
const ANIO_ACTUAL = new Date().getFullYear();

describe('inventario', () => {
  test('hay unidades cargadas', () => {
    assert.ok(VEHICULOS.length > 0);
    assert.equal(VEHICULOS.length, RAW.length);
  });

  test('los ids no se repiten', () => {
    const ids = VEHICULOS.map(v => v.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  for (const v of require('../assets/js/data.js').VEHICULOS) {
    describe(`#${v.id} ${v.titulo}`, () => {
      test('tiene los campos obligatorios', () => {
        for (const campo of ['titulo', 'marca', 'modelo', 'segmento', 'combustible', 'condicion']) {
          assert.equal(typeof v[campo], 'string', `${campo} debe ser texto`);
          assert.ok(v[campo].length > 0, `${campo} no puede estar vacío`);
        }
      });

      test('el año es plausible', () => {
        assert.ok(Number.isInteger(v.anio));
        assert.ok(v.anio >= 1950 && v.anio <= ANIO_ACTUAL + 2,
          `año fuera de rango: ${v.anio}`);
      });

      test('los km son coherentes con la condición', () => {
        assert.ok(Number.isInteger(v.km) && v.km >= 0);
        assert.ok(v.km < 500000, `km sospechoso: ${v.km}`);
        if (v.esNuevo) assert.equal(v.km, 0, '0 km no puede tener kilómetros');
      });

      test('tiene al menos una foto', () => {
        assert.ok(Array.isArray(v.fotos) && v.fotos.length > 0);
        for (const f of v.fotos) assert.match(f, /\.(webp|png|jpe?g)$/i);
      });

      test('el modelo no repite la marca', () => {
        assert.ok(!v.modelo.startsWith(v.marca),
          `"${v.modelo}" arranca con la marca "${v.marca}"`);
      });

      test('no quedó texto mal codificado', () => {
        const texto = v.titulo + v.desc;
        assert.ok(!texto.includes('�'), 'hay caracteres rotos (mojibake)');
      });
    });
  }

  test('un km bajo con año viejo sería un error de carga', () => {
    /* Es el bug que traía el sitio: "209 km" en una unidad de 2012.
       Si un usado de más de 5 años declara menos de 1000 km, hay que mirarlo. */
    const sospechosas = VEHICULOS.filter(v =>
      !v.esNuevo && v.km > 0 && v.km < 1000 && (ANIO_ACTUAL - v.anio) > 5);
    assert.deepEqual(sospechosas.map(v => `#${v.id} ${v.titulo}: ${v.km} km`), []);
  });
});

describe('contacto', () => {
  test('el número de WhatsApp es válido para wa.me', () => {
    assert.match(CONTACTO.wa, /^\d{11,15}$/);
  });
  test('el teléfono para llamar está en formato internacional', () => {
    assert.match(CONTACTO.telHref, /^\+\d{8,15}$/);
  });
  test('hay dirección y link al mapa', () => {
    assert.ok(CONTACTO.dir.length > 0);
    assert.match(CONTACTO.maps, /^https:\/\//);
  });
});

describe('fotos en disco', () => {
  const mapaPath = path.join(RAIZ, 'assets', 'js', 'photos-local.js');
  const fuente = fs.readFileSync(mapaPath, 'utf8');
  const mapa = JSON.parse(fuente.slice(fuente.indexOf('{'), fuente.lastIndexOf('}') + 1));

  test('el mapa cubre todas las unidades', () => {
    const faltan = VEHICULOS.filter(v => !mapa[v.id]).map(v => v.id);
    assert.deepEqual(faltan, []);
  });

  test('todos los archivos existen', () => {
    const faltantes = [];
    for (const rutas of Object.values(mapa)) {
      for (const r of rutas) {
        if (!fs.existsSync(path.join(RAIZ, r))) faltantes.push(r);
      }
    }
    assert.deepEqual(faltantes, []);
  });

  test('ninguna foto está vacía', () => {
    const vacias = [];
    for (const rutas of Object.values(mapa)) {
      for (const r of rutas) {
        if (fs.statSync(path.join(RAIZ, r)).size < 1024) vacias.push(r);
      }
    }
    assert.deepEqual(vacias, []);
  });
});
