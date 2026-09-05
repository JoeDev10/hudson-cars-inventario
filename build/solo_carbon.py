# -*- coding: utf-8 -*-
"""Saca el selector de paletas: queda solo Carbón, que ya era la base (:root)."""
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


# ---------------- index.html: fuera los tres círculos ----------------
edit('index.html', [
    ("""      <span class="temas" id="temas">
        <b>Paleta</b>
        <button class="t-carbon"     data-tema="carbon"     aria-pressed="true"  title="Carbón · negro cálido + champán"  aria-label="Paleta carbón"></button>
        <button class="t-medianoche" data-tema="medianoche" aria-pressed="false" title="Medianoche · azul + blanco"        aria-label="Paleta medianoche"></button>
        <button class="t-alabastro"  data-tema="alabastro"  aria-pressed="false" title="Alabastro · claro + carbón"       aria-label="Paleta alabastro"></button>
      </span>
""", ""),
])

# ---------------- app.js: fuera la lógica (si no, $('#temas') es null y rompe) --------
edit('assets/js/app.js', [
    ("""
    /* selector de paleta */
    var NOM = { carbon: 'Carbón', medianoche: 'Medianoche', alabastro: 'Alabastro' };
    $('#temas').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tema]'); if (!b) return;
      setTema(b.getAttribute('data-tema'));
      toast('Paleta ' + NOM[b.getAttribute('data-tema')]);
    });
    function setTema(t) {
      if (!NOM[t]) t = 'carbon';
      if (t === 'carbon') document.body.removeAttribute('data-tema');
      else document.body.setAttribute('data-tema', t);
      $$('#temas [data-tema]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-tema') === t ? 'true' : 'false');
      });
      try { localStorage.setItem('hc_tema_v2', t); } catch (err) {}
    }
    var guardado = 'carbon';
    try { guardado = localStorage.getItem('hc_tema_v2') || 'carbon'; } catch (err) {}
    setTema(guardado);
""", ""),
])

# ---------------- hudson.css: fuera paletas alternativas y swatches ----------------
CSS = os.path.join(ROOT, 'assets', 'css', 'hudson.css')
c = io.open(CSS, encoding='utf-8').read()

a = c.index('/* ---------- 14. Paletas ---------- */')
b = c.rindex('/* ==============', 0, c.index('   15. v2'))
c = c[:a] + c[b:]

c = c.replace('@media (max-width:899px){ .temas b{ display:none; } .strip .wrap{ gap:14px; } }',
              '@media (max-width:899px){ .strip .wrap{ gap:14px; } }')
io.open(CSS, 'w', encoding='utf-8').write(c)

print('fallos:', len(fallos))
for f in fallos:
    print('  x', f)
