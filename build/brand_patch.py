# -*- coding: utf-8 -*-
"""Marcado y lógica que acompañan la paleta v3: logo real, divisores con la
   silueta del coupé, nombres de paleta nuevos y CTA de WhatsApp sobrio."""
import io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fallos = []

def edit(path, pares):
    p = os.path.join(ROOT, path)
    s = io.open(p, encoding='utf-8').read()
    for a, b in pares:
        if a not in s:
            fallos.append(path + ' :: ' + a.strip().splitlines()[0][:64])
            continue
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

# ---------------- index.html ----------------
edit('index.html', [
    # logo real en la nav
    ("""      <a class="brand" href="#top">
        <b>Hudson</b><s>Cars</s><em>BS AS</em>
      </a>""",
     """      <a class="brand" href="#top" aria-label="Hudson Cars Bs. As. — inicio">
        <span class="brand-mark"></span>
      </a>"""),

    # divisores con la silueta
    ('  <hr class="tape">', '  <div class="tape" aria-hidden="true"><i></i></div>'),
    ('  <hr class="tape tape--thin">', '  <div class="tape tape--thin" aria-hidden="true"><i></i></div>'),

    # paletas renombradas
    ("""        <button class="t-oxido"  data-tema="oxido"  aria-pressed="true"  title="Óxido · grafito + naranja"   aria-label="Paleta óxido"></button>
        <button class="t-acero"  data-tema="acero"  aria-pressed="false" title="Acero · nocturno + cian"     aria-label="Paleta acero"></button>
        <button class="t-marfil" data-tema="marfil" aria-pressed="false" title="Marfil · claro + terracota"  aria-label="Paleta marfil"></button>""",
     """        <button class="t-carbon"     data-tema="carbon"     aria-pressed="true"  title="Carbón · negro cálido + champán"  aria-label="Paleta carbón"></button>
        <button class="t-medianoche" data-tema="medianoche" aria-pressed="false" title="Medianoche · azul + blanco"        aria-label="Paleta medianoche"></button>
        <button class="t-alabastro"  data-tema="alabastro"  aria-pressed="false" title="Alabastro · claro + carbón"       aria-label="Paleta alabastro"></button>"""),

    # el logo también cierra el footer
    ("""        <p class="big-mark">Hudson<br><span>Cars</span></p>""",
     """        <span class="brand-mark foot-mark"></span>"""),
])

# ---------------- app.js ----------------
edit('assets/js/app.js', [
    # CTA de WhatsApp sobrio en la tarjeta (el verde queda para el botón flotante)
    ("""'<a class="go btn--wa" href="' + waLink(v) + '" target="_blank" rel="noopener" aria-label="WhatsApp" style="background:var(--wa);border-color:var(--wa);color:#04220F">' +""",
     """'<a class="go go--wa" href="' + waLink(v) + '" target="_blank" rel="noopener" aria-label="Consultar por WhatsApp" title="Consultar por WhatsApp">' +"""),

    # nombres de paleta
    ("""    var NOM = { oxido: 'Óxido', acero: 'Acero', marfil: 'Marfil' };""",
     """    var NOM = { carbon: 'Carbón', medianoche: 'Medianoche', alabastro: 'Alabastro' };"""),
    ("""    function setTema(t) {
      if (t === 'oxido') document.body.removeAttribute('data-tema');""",
     """    function setTema(t) {
      if (!NOM[t]) t = 'carbon';
      if (t === 'carbon') document.body.removeAttribute('data-tema');"""),
    ("""    var guardado = 'oxido';
    try { guardado = localStorage.getItem('hc_tema') || 'oxido'; } catch (err) {}""",
     """    var guardado = 'carbon';
    try { guardado = localStorage.getItem('hc_tema') || 'carbon'; } catch (err) {}"""),
])

# ---------------- build-artifact.js: incrustar las máscaras ----------------
edit('build/build-artifact.js', [
    ("const photos = r('build/photos.json');",
     """const photos = r('build/photos.json');

// las máscaras del logo viajan incrustadas: el visor no puede pedir archivos externos
const b64 = f => fs.readFileSync(p.join(ROOT, f)).toString('base64');
const mask = n => `url('data:image/png;base64,${b64('assets/img/' + n)}')`;"""),
    ("const out = `<meta charset=\"utf-8\">",
     """const cssInline = css
  .replace("url('../img/logo-mask.png')", mask('logo-mask.png'))
  .replace("url('../img/car-mask.png')", mask('car-mask.png'));

const out = `<meta charset="utf-8">"""),
    ("<style>\n${css}\n</style>", "<style>\n${cssInline}\n</style>"),
])

print('fallos:', len(fallos))
for f in fallos:
    print('  x', f)
