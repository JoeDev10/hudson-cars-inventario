# -*- coding: utf-8 -*-
"""Descarga las fotos del inventario, las optimiza y las guarda como data URIs
   para poder publicar el prototipo online sin depender del sitio original."""
import re, io, json, base64, os, sys, time
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen, Request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'assets', 'js', 'data.js')
OUT  = os.path.join(ROOT, 'build', 'photos.json')
BASE = 'https://www.hudsoncars.com.ar/datos/uploads/mod_vehiculos/39156/'
N_PER_CAR = 3

src = open(DATA, encoding='utf-8').read()
entries = re.findall(r'^\[(\d+),"(?:[^"\\]|\\.)*",.*?\[((?:"[^"]+",?)+)\]', src, re.M)

jobs = []
for vid, files in entries:
    names = re.findall(r'"([^"]+)"', files)[:N_PER_CAR]
    for i, n in enumerate(names):
        jobs.append((int(vid), i, BASE + n))

print('vehiculos:', len(entries), '· imagenes:', len(jobs))

def grab(job, intentos=3):
    vid, i, url = job
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        for n in range(intentos):                 # el servidor corta conexiones al azar
            try:
                raw = urlopen(req, timeout=40).read()
                break
            except Exception:
                if n == intentos - 1:
                    raise
                time.sleep(1.5 * (n + 1))
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        # Las fuentes del sitio son 315x420: no hay nada que redimensionar.
        # Solo se achica lo que venga por encima de 900 px (no deberia pasar).
        if im.width > 900:
            im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=80, method=6)
        b = buf.getvalue()
        return vid, i, 'data:image/webp;base64,' + base64.b64encode(b).decode(), len(b)
    except Exception as e:
        print('  ! fallo', url.split('/')[-1][:40], e)
        return vid, i, None, 0

res, total = {}, 0
with ThreadPoolExecutor(max_workers=12) as ex:
    for vid, i, uri, n in ex.map(grab, jobs):
        if uri:
            res.setdefault(vid, {})[i] = uri
            total += n

out = {str(k): [v[i] for i in sorted(v)] for k, v in res.items()}
json.dump(out, open(OUT, 'w', encoding='utf-8'))
print('ok · %d vehiculos · %.2f MB de imagenes · json %.2f MB'
      % (len(out), total / 1e6, os.path.getsize(OUT) / 1e6))
