# -*- coding: utf-8 -*-
"""Reemplaza las fotos de las unidades que tengan archivos propios en fotos/<id>-.../
   y deja intactas las que no. Optimiza y ajusta la calidad sola para que la página
   entre en el límite del visor.

   Uso:
     python build/fotos.py                 reemplaza y escribe build/photos.json
     python build/fotos.py --simular       muestra qué haría, sin escribir nada
     python build/fotos.py --max 5         hasta 5 fotos por unidad (por defecto 4)
     python build/fotos.py --modo hosting  escribe archivos sueltos a calidad plena
                                           en assets/fotos/ (para servidor propio)

   Los dos modos:
     artifact (por defecto) — las fotos van incrustadas en un solo archivo HTML.
       Es lo que permite publicarlo online al instante, pero hay un techo de peso:
       si se cargan muchas fotos grandes, el script baja la calidad para que entren.
     hosting — las fotos se guardan como archivos y las sirve el servidor.
       Sin techo, calidad plena. Es el modo para el sitio de verdad.
"""
import io, os, re, sys, json, base64
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOTOS = os.path.join(ROOT, 'fotos')
JSON_ = os.path.join(ROOT, 'build', 'photos.json')
DATA = os.path.join(ROOT, 'assets', 'js', 'data.js')

EXT = ('.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff')
# El visor admite 16 MB por página. Dejamos margen para el resto del HTML.
PRESUPUESTO = 9.0 * 1024 * 1024          # bytes de imagen (antes de base64)
ESCALONES = [(1400, 82), (1200, 80), (1000, 78), (850, 76), (700, 72), (600, 68)]

simular = '--simular' in sys.argv
MODO = 'artifact'
if '--modo' in sys.argv:
    MODO = sys.argv[sys.argv.index('--modo') + 1]
    if MODO not in ('artifact', 'hosting'):
        sys.exit('--modo acepta: artifact | hosting')
MAX = 4
if '--max' in sys.argv:
    MAX = int(sys.argv[sys.argv.index('--max') + 1])


def orden_natural(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', s)]


def titulos():
    src = io.open(DATA, encoding='utf-8').read()
    return dict(re.findall(r'^\[(\d+),"((?:[^"\\]|\\.)*)",', src, re.M))


def codificar(ruta, lado, calidad):
    im = Image.open(ruta)
    im = ImageOps.exif_transpose(im)          # respeta la rotación del celular
    im = im.convert('RGB')
    if max(im.size) > lado:
        f = lado / max(im.size)
        im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=calidad, method=6)
    return buf.getvalue(), im.size


# ---------- qué hay para reemplazar ----------
if not os.path.isdir(FOTOS):
    sys.exit('No existe la carpeta fotos/. Corré antes:  python build/preparar_fotos.py')

nombres = titulos()
pendientes = {}
avisos = []
for carpeta in sorted(os.listdir(FOTOS)):
    ruta = os.path.join(FOTOS, carpeta)
    if not os.path.isdir(ruta):
        continue
    m = re.match(r'(\d+)', carpeta)
    if not m:
        avisos.append('carpeta ignorada (no empieza con el numero de unidad): ' + carpeta)
        continue
    vid = m.group(1)
    if vid not in nombres:
        avisos.append('carpeta ignorada (unidad %s inexistente): %s' % (vid, carpeta))
        continue
    archivos = [f for f in sorted(os.listdir(ruta), key=orden_natural)
                if f.lower().endswith(EXT) and not f.startswith('.')]
    otros = [f for f in os.listdir(ruta)
             if not f.lower().endswith(EXT) and not f.startswith('.') and not f.startswith('_')
             and os.path.isfile(os.path.join(ruta, f))]
    if otros:
        avisos.append('%s: formato no soportado, se saltea: %s' % (carpeta, ', '.join(otros[:3])))
    if archivos:
        pendientes[vid] = [os.path.join(ruta, f) for f in archivos[:MAX]]

actuales = json.load(io.open(JSON_, encoding='utf-8'))

if not pendientes and MODO == 'hosting':
    print('Sin fotos nuevas: se exportan las %d unidades actuales tal cual.' % len(actuales))

if not pendientes and MODO != 'hosting':
    print('No hay fotos nuevas en fotos/. Las %d unidades quedan como estan.' % len(actuales))
    for a in avisos:
        print('  ! ' + a)
    print('\nDejá las fotos en fotos/<carpeta de la unidad>/ y volvé a correr esto.')
    sys.exit(0)

if pendientes:
    print('Unidades con fotos propias: %d' % len(pendientes))
for vid, fs in sorted(pendientes.items(), key=lambda x: int(x[0])):
    print('  %-4s %-44s %d foto(s)' % (vid, nombres[vid][:44], len(fs)))
for a in avisos:
    print('  ! ' + a)

# ---------- modo hosting: archivos sueltos, calidad plena ----------
if MODO == 'hosting':
    DEST = os.path.join(ROOT, 'assets', 'fotos')
    LADO_H, CAL_H = 1600, 82
    mapa = {}
    print('')
    print('Modo hosting: %d px de lado largo, calidad %d, sin techo de peso.' % (LADO_H, CAL_H))
    if simular:
        print('--simular: no se escribio nada.')
        sys.exit(0)
    total_h = 0
    for vid in sorted(actuales, key=int):
        carpeta = os.path.join(DEST, vid)
        os.makedirs(carpeta, exist_ok=True)
        rutas = []
        if vid in pendientes:                       # foto propia: se re-codifica
            for n, f in enumerate(pendientes[vid], 1):
                b, _ = codificar(f, LADO_H, CAL_H)
                io.open(os.path.join(carpeta, '%d.webp' % n), 'wb').write(b)
                rutas.append('assets/fotos/%s/%d.webp' % (vid, n))
                total_h += len(b)
        else:                                       # la actual se vuelca tal cual
            for n, uri in enumerate(actuales[vid], 1):
                b = base64.b64decode(uri.split(',')[1])
                io.open(os.path.join(carpeta, '%d.webp' % n), 'wb').write(b)
                rutas.append('assets/fotos/%s/%d.webp' % (vid, n))
                total_h += len(b)
        mapa[vid] = rutas
    js = '\n'.join([
        '/* Generado por build/fotos.py --modo hosting. Lo usa index.html cuando',
        '   las fotos las sirve el servidor en vez de ir incrustadas. */',
        'var PHOTOS_LOCAL = ' + json.dumps(mapa, indent=0) + ';',
        ''])
    io.open(os.path.join(ROOT, 'assets', 'js', 'photos-local.js'), 'w', encoding='utf-8').write(js)
    print('Escritas %d fotos en assets/fotos/ (%.1f MB) + assets/js/photos-local.js'
          % (sum(len(v) for v in mapa.values()), total_h / 1024 / 1024))
    print('Subi index.html y assets/ a tu hosting: no hace falta incrustar nada.')
    sys.exit(0)

# ---------- elegir el escalón que entre en el presupuesto ----------
def peso_conservado():
    return sum(len(base64.b64decode(u.split(',')[1]))
               for vid, us in actuales.items() if vid not in pendientes for u in us)

base = peso_conservado()
elegido = None
for lado, calidad in ESCALONES:
    total = base
    for fs in pendientes.values():
        for f in fs:
            total += len(codificar(f, lado, calidad)[0])
    print('  probando %d px / q%d  ->  %.1f MB totales' % (lado, calidad, total / 1024 / 1024))
    if total <= PRESUPUESTO:
        elegido = (lado, calidad, total)
        break

if not elegido:
    lado, calidad = ESCALONES[-1]
    elegido = (lado, calidad, total)
    print('  ! Ni en la calidad mas baja entra en el presupuesto.')
    print('  ! Bajá la cantidad de fotos por unidad:  python build/fotos.py --max 2')

lado, calidad, total = elegido
print('\nUsando %d px de lado largo, calidad %d  (%.1f MB de imagenes)' % (lado, calidad, total / 1024 / 1024))

if simular:
    print('\n--simular: no se escribio nada.')
    sys.exit(0)

# ---------- escribir ----------
for vid, fs in pendientes.items():
    uris = []
    for f in fs:
        b, size = codificar(f, lado, calidad)
        uris.append('data:image/webp;base64,' + base64.b64encode(b).decode())
        print('  %-4s %-30s %sx%s  %3.0f KB' % (vid, os.path.basename(f)[:30], size[0], size[1], len(b) / 1024))
    actuales[vid] = uris

json.dump(actuales, io.open(JSON_, 'w', encoding='utf-8'))
reemplazadas = len(pendientes)
print('\nListo: %d unidades reemplazadas, %d intactas.' % (reemplazadas, len(actuales) - reemplazadas))
print('Ahora corré:  node build/build-artifact.js')
