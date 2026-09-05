/* La página y el build. El test clave es el de los ids: el JS le habla al HTML por
   id, y si uno no existe el script explota y se cae toda la página. Ya pasó una vez.
   Correr con:  node --test tests/ */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const leer = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');

const html = leer('index.html');
const app = leer('assets/js/app.js');
const css = leer('assets/css/hudson.css');

/* Los ids válidos son los del HTML más los que el propio JS genera al vuelo
   (la galería de la ficha, por ejemplo, se arma dentro del modal). */
const idsDelHtml = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const idsQueCreaElJs = new Set([...app.matchAll(/id="([A-Za-z0-9_-]+)"/g)].map(m => m[1]));
const idsDisponibles = new Set([...idsDelHtml, ...idsQueCreaElJs]);

describe('el JS y el HTML hablan el mismo idioma', () => {
  test('cada id que busca el JS existe en el HTML', () => {
    const buscados = new Set(
      [...app.matchAll(/\$\$?\('#([A-Za-z0-9_-]+)/g)].map(m => m[1]));
    const faltan = [...buscados].filter(id => !idsDisponibles.has(id));
    assert.deepEqual(faltan, [],
      `el JS busca ids que no están en index.html: ${faltan.join(', ')}`);
  });

  test('cada clase que busca el JS existe en el HTML o en el CSS', () => {
    const buscadas = new Set(
      [...app.matchAll(/\$\$?\('\.([A-Za-z0-9_-]+)'\)/g)].map(m => m[1]));
    const faltan = [...buscadas].filter(c =>
      !html.includes(`class="${c}`) && !html.includes(` ${c}"`) && !html.includes(` ${c} `));
    assert.deepEqual(faltan, [], `clases que el JS no va a encontrar: ${faltan.join(', ')}`);
  });

  test('los scripts se cargan en el orden correcto', () => {
    const orden = ['core.js', 'data.js', 'photos-local.js', 'app.js']
      .map(f => html.indexOf(f));
    assert.ok(orden.every(i => i > -1), 'falta cargar algún script');
    for (let i = 1; i < orden.length; i++) {
      assert.ok(orden[i] > orden[i - 1],
        'core.js y data.js tienen que venir antes que app.js');
    }
  });
});

describe('accesibilidad básica', () => {
  test('todos los botones sin texto tienen aria-label', () => {
    const sinNombre = [];
    for (const m of html.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)) {
      const attrs = m[1], contenido = m[2].replace(/<[^>]+>/g, '').trim();
      if (!contenido && !/aria-label=/.test(attrs)) sinNombre.push(m[0].slice(0, 60));
    }
    assert.deepEqual(sinNombre, []);
  });

  test('cada input tiene label o aria-label', () => {
    const sueltos = [];
    for (const m of html.matchAll(/<input([^>]*)>/g)) {
      const attrs = m[1];
      const id = (attrs.match(/id="([^"]+)"/) || [])[1];
      const tieneLabel = id && html.includes(`for="${id}"`);
      if (!tieneLabel && !/aria-label=/.test(attrs)) sueltos.push(m[0]);
    }
    assert.deepEqual(sueltos, []);
  });

  test('la página declara idioma', () => {
    assert.match(html, /<html lang="es/);
  });
});

describe('estilos', () => {
  test('no quedaron colores de la paleta vieja', () => {
    const naranjaViejo = /#FF5C1A|#FF8A4C/i;
    assert.ok(!naranjaViejo.test(css), 'quedó naranja de la paleta anterior en el CSS');
    assert.ok(!naranjaViejo.test(html), 'quedó naranja de la paleta anterior en el HTML');
  });

  test('el acento sale de una sola variable', () => {
    assert.match(css, /--oxide:\s*#C6AE7E/);
  });

  test('la consola de filtros no se queda fija tapando la grilla en mobile', () => {
    assert.match(css, /@media \(max-width:760px\)/,
      'falta el bloque que colapsa los filtros en pantallas angostas');
    assert.match(css, /\.console-in:not\(\.abierto\) \.console-row \.field\.sel\{ display:none/);
  });

  test('respeta prefers-reduced-motion', () => {
    assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  });
});

describe('build de un solo archivo', () => {
  const p = path.join(RAIZ, 'build', 'hudson-inventario.html');
  const existe = fs.existsSync(p);
  const build = existe ? fs.readFileSync(p, 'utf8') : '';

  test('está construido', () => {
    assert.ok(existe, 'falta correr: node build/build-artifact.js');
  });

  test('entra en el límite de 16 MB del visor', () => {
    const mb = fs.statSync(p).size / 1024 / 1024;
    assert.ok(mb < 16, `pesa ${mb.toFixed(1)} MB`);
  });

  test('tiene título y charset', () => {
    assert.match(build, /<title>[^<]+<\/title>/);
    assert.match(build, /<meta charset="utf-8">/);
  });

  test('no le quedó el bloque de fotos del hosting', () => {
    assert.ok(!build.includes('PHOTOS_LOCAL'),
      'ese bloque referencia una variable que no existe en el build y tira ReferenceError');
  });

  test('no pide imágenes por red: van incrustadas', () => {
    /* Se mira solo el HTML servido, no los <img> que viven dentro de strings de JS. */
    const soloHtml = build.replace(/<script[\s\S]*?<\/script>/g, '');
    const externas = [...soloHtml.matchAll(/<img[^>]+src="([^"]+)"/g)]
      .map(m => m[1]).filter(src => !src.startsWith('data:'));
    assert.deepEqual(externas, [],
      'el visor bloquea las imágenes externas: tienen que ir como data URI');
    assert.ok(!build.includes("url('../img/"), 'las máscaras del logo quedaron sin incrustar');
  });

  test('las fotos incrustadas cubren todas las unidades', () => {
    /* data.js deja las URLs del sitio de origen como valor por defecto; el build
       las tiene que pisar todas con data URIs, o alguna unidad saldría sin foto. */
    assert.match(build, /VEHICULOS\.forEach\(function \(v\) \{ if \(PHOTOS\[v\.id\]\)/);
    const unidades = require('../assets/js/data.js').VEHICULOS.length;
    const incrustadas = (build.match(/data:image\/webp;base64,/g) || []).length;
    assert.ok(incrustadas >= unidades,
      `hay ${incrustadas} fotos incrustadas para ${unidades} unidades`);
  });

  test('no arrastra los tags de script del sitio multi-archivo', () => {
    assert.ok(!build.includes('<script src="assets/'));
  });
});

describe('modo claro / oscuro', () => {
  test('existe el botón y es accesible', () => {
    assert.match(html, /<button class="modo" id="modo"[^>]*aria-label=/);
    assert.ok(html.includes('ico-sol') && html.includes('ico-luna'),
      'faltan los dos íconos del botón');
  });

  test('el modo se aplica antes de pintar, para que no parpadee', () => {
    const cabeza = html.slice(0, html.indexOf('<div class="shell">'));
    assert.match(cabeza, /localStorage\.getItem\('hc_modo'\)/,
      'el script del modo tiene que correr antes del contenido');
    assert.match(cabeza, /prefers-color-scheme: light/,
      'la primera visita debería respetar la preferencia del sistema');
  });

  test('la paleta clara redefine los tokens, no colores sueltos', () => {
    const bloque = css.slice(css.indexOf(':root[data-modo="claro"]'));
    for (const token of ['--ink', '--panel', '--bone', '--oxide', '--line', '--on-accent']) {
      assert.ok(bloque.includes(token + ':'), `falta redefinir ${token} en modo claro`);
    }
  });

  test('el acento claro tiene contraste suficiente para texto', () => {
    /* champán #C6AE7E sobre blanco no llega a 4.5:1, por eso en claro va bronce */
    const m = css.match(/:root\[data-modo="claro"\][\s\S]*?--oxide:\s*(#[0-9A-Fa-f]{6})/);
    assert.ok(m, 'no encontré el acento del modo claro');
    const [r, g, b] = [1, 3, 5].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255);
    const lin = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const fondo = 0.8713;                       /* luminancia de #F4F1EB */
    const ratio = (fondo + 0.05) / (L + 0.05);
    assert.ok(ratio >= 4.5, `contraste ${ratio.toFixed(2)}:1, hace falta 4.5:1`);
  });

  test('declara color-scheme en los dos modos', () => {
    assert.match(css, /:root\{ color-scheme:dark; \}/);
    assert.match(css, /color-scheme:light/);
  });
});

describe('íconos SVG', () => {
  /* Un path mal escrito no rompe la página pero deja el ícono deforme y un error
     en consola. Pasó al re-tipear a mano el logo de WhatsApp: se comió un espacio
     ("0-.5 0-.2" quedó "0-.50-.2") y eso corre los parámetros del comando. */
  const PARAMS = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };

  const paths = [...html.matchAll(/<path[^>]+d="([^"]+)"/g)].map(m => m[1]);

  test('hay íconos para revisar', () => assert.ok(paths.length > 0));

  test('todos los path tienen la cantidad de parámetros correcta', () => {
    const rotos = [];
    for (const d of paths) {
      for (const [, cmd, args] of d.matchAll(/([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g)) {
        const n = PARAMS[cmd.toLowerCase()];
        const nums = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).length;
        if (n === 0) { if (nums) rotos.push(`${cmd} no lleva parámetros`); continue; }
        if (nums % n !== 0) {
          rotos.push(`"${cmd}" espera múltiplos de ${n} y tiene ${nums}: ${args.slice(0, 40)}`);
        }
      }
    }
    assert.deepEqual(rotos, []);
  });

  test('el logo de WhatsApp es el mismo en todos lados', () => {
    const wa = paths.filter(d => d.startsWith('M17.5 14.4'));
    assert.ok(wa.length >= 2, 'debería estar en el CTA y en el botón flotante');
    assert.equal(new Set(wa).size, 1, 'hay copias distintas del mismo ícono');
  });
});
