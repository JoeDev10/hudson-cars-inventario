# -*- coding: utf-8 -*-
"""El logo original es un PNG de fondo negro opaco: no sirve sobre ningún fondo.
   Acá se convierte en máscaras CSS (alpha = las marcas blancas) para que el logo
   tome el color del tema automáticamente."""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'img')
SRC = os.path.join(IMG, 'logo-hudson-cars-2-67c797fd66c31.png')

im = Image.open(SRC).convert('RGB')
w, h = im.size
CORTE = 0.42                      # el lettering ocupa el 42% superior; abajo va el coupé


def mascara(box=None):
    src = im.crop(box) if box else im
    out = Image.new('RGBA', src.size, (255, 255, 255, 0))
    out.putalpha(src.convert('L'))          # alpha = luminancia
    bb = out.getbbox()
    return out.crop(bb) if bb else out


def a_1bit(m):
    """PNG paletizado de 1 bit: pesa ~15x menos que RGBA. Solo para las marcas que
       siempre se muestran reducidas — al achicar, el navegador les devuelve el suavizado."""
    alpha = m.getchannel('A')
    pal = Image.new('P', m.size)
    pal.putpalette([255, 255, 255] + [0, 0, 0] * 255)
    pal.frombytes(bytes(1 if v < 128 else 0 for v in alpha.tobytes()))
    pal.info['transparency'] = 1
    return pal


for nombre, box, plano in (
    ('logo-mask.png', None, True),
    ('word-mask.png', (0, 0, w, int(h * CORTE)), True),
    # el coupe se agranda en el hero, asi que conserva el canal alpha completo
    ('car-mask.png',  (0, int(h * CORTE), w, h), False),
):
    m = mascara(box)
    p = os.path.join(IMG, nombre)
    if plano:
        a_1bit(m).save(p, optimize=True, bits=1)
    else:
        m.save(p, optimize=True)
    print('%-16s %-12s %6.1f KB' % (nombre, '%dx%d' % m.size, os.path.getsize(p) / 1024))
