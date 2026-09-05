# -*- coding: utf-8 -*-
"""Crea una carpeta por unidad dentro de fotos/ para que se puedan dejar ahí las
   fotos propias. No toca nada de lo que ya está publicado."""
import io, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'assets', 'js', 'data.js')
FOTOS = os.path.join(ROOT, 'fotos')


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return re.sub(r'-+', '-', s)[:46]


src = io.open(DATA, encoding='utf-8').read()
unidades = re.findall(r'^\[(\d+),"((?:[^"\\]|\\.)*)",(\d+),(\d)', src, re.M)

os.makedirs(FOTOS, exist_ok=True)
nuevas = 0
lineas = []
for vid, titulo, anio, cond in unidades:
    carpeta = '%s-%s' % (vid, slug(titulo))
    ruta = os.path.join(FOTOS, carpeta)
    if not os.path.isdir(ruta):
        os.makedirs(ruta)
        nuevas += 1
    lineas.append('  %-52s  %s (%s, %s)' % (carpeta, titulo, anio, '0 km' if cond == '1' else 'usado'))

LEEME = """COMO REEMPLAZAR LAS FOTOS
=========================

1. Buscá abajo la carpeta de la unidad y metele adentro las fotos.

2. El nombre del archivo define el orden. Lo mas simple es numerarlas:
       1.jpg   2.jpg   3.jpg   4.jpg
   La numero 1 es la portada: la que se ve en la grilla.

3. Formatos: .jpg  .jpeg  .png  .webp
   Mandalas tal cual salen de la camara o del celular, sin achicar:
   el script se encarga de optimizarlas.

4. Cuando termines, corre:
       python build/fotos.py
       node build/build-artifact.js

   Solo se reemplazan las unidades que tengan fotos en su carpeta.
   Las carpetas vacias quedan con las fotos actuales, intactas.

5. Para ver que va a pasar antes de tocar nada:
       python build/fotos.py --simular

CONSEJOS DE FOTO
----------------
- Lo que mas levanta la pagina es un fondo parejo: siempre el mismo lugar,
  el auto entero, de 3/4 adelante. Con eso la grilla se ve profesional.
- Horizontales (apaisadas) entran mejor que verticales en las tarjetas.
- Las actuales del sitio son de 315x420 px y se muestran a 420: por eso se
  ven blandas. Con 1600 px de lado largo ya sobra.

UNIDADES
--------
""" + '\n'.join(sorted(lineas))

io.open(os.path.join(FOTOS, 'LEEME.txt'), 'w', encoding='utf-8').write(LEEME)
print('carpetas creadas: %d (total %d unidades)' % (nuevas, len(unidades)))
print('instrucciones en fotos/LEEME.txt')
