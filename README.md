# Hudson Cars — Inventario

Página de inventario para **Hudson Cars Bs. As.**: 63 unidades entre 0 km multimarca
y usados seleccionados, con filtrado instantáneo, comparador de unidades y ficha con
galería. Sitio estático, sin dependencias ni framework.

Prototipo. Datos e imágenes del concesionario.

---

## Estructura

```
index.html                  página (versión de trabajo, multi-archivo)
assets/css/hudson.css       estilos (paleta Carbon tokenizada en :root)
assets/js/data.js           las 63 unidades (fotos apuntando al sitio original)
assets/js/app.js            filtros, comparador, ficha, favoritos
fotos/                      donde se dejan las fotos propias (una carpeta por unidad)
assets/fotos/               fotos servidas por el hosting (modo hosting)
assets/js/photos-local.js   mapa de fotos del hosting (vacío = usa las incrustadas)
build/preparar_fotos.py     crea las carpetas de fotos/ + LEEME
build/fotos.py              reemplaza fotos y regenera (modos artifact / hosting)
build/embed_photos.py       scraper original del sitio → data URI (WebP)
build/photos.json           fotos incrustadas (3 por unidad, WebP q80, 4,5 MB)
build/build-artifact.js     arma la versión de un solo archivo
build/hudson-inventario.html  ← lo que está publicado online (4,7 MB, autocontenido)
build/make_masks.py         logo -> máscaras CSS
build/theme_patch.py        tokenizó los colores (ya aplicado)
build/palette_patch.py      paleta v3: champán + monocromo (ya aplicado)
build/brand_patch.py        logo real y renombre de paletas (ya aplicado)
build/solo_carbon.py        saco el selector: queda solo Carbon (ya aplicado)
```

### Reemplazar las fotos

Para reemplazar las fotos de una unidad, sin tocar codigo:

1. Dejar los archivos en la carpeta de cada unidad:

       fotos/256-ford-bronco-sport-wildtrak-2-0-4x4/1.jpg
                                                    2.jpg
                                                    3.jpg

   El numero del archivo define el orden; la 1 es la portada de la grilla.
   Sirven .jpg .jpeg .png .webp, tal cual salen de la camara.
   El listado completo de carpetas esta en `fotos/LEEME.txt`.

2. Correr:

       python build/fotos.py
       node build/build-artifact.js

**Solo se reemplazan las unidades que tengan archivos en su carpeta.** Las carpetas
vacias conservan las fotos actuales. `python build/fotos.py --simular` muestra que haria
sin escribir nada.

#### Los dos modos

| | |
|---|---|
| `python build/fotos.py` | **artifact**: las fotos van incrustadas en un solo HTML. Permite publicarlo online al toque, pero hay techo de peso (16 MB): si se cargan muchas fotos grandes, el script baja resolucion y calidad por escalones hasta que entren, y avisa cual uso. |
| `python build/fotos.py --modo hosting` | **hosting**: escribe `assets/fotos/<id>/N.webp` a 1600 px / q82 y genera `assets/js/photos-local.js`. Sin techo, calidad plena. Es el modo para el sitio de verdad: se sube `index.html` + `assets/` y listo. |

Hoy `assets/fotos/` ya tiene las 189 fotos actuales exportadas, asi que `index.html` anda
sin depender del sitio original.

### Regenerar la version online

```bash
python build/fotos.py            # si cambiaron fotos
node build/build-artifact.js
```

`build/embed_photos.py` es el scraper original: vuelve a bajar todo del sitio de Hudson.
Solo hace falta si se cargan unidades nuevas alla.

## Dirección de diseño — "tablero de patio"

La grilla no se lee como catálogo parejo sino como el tablero de un patio de autos:

- **Numeración de inventario** (`001`, `002`…) en tipografía display calada sobre cada unidad.
- **Ritmo roto**: una de cada siete unidades ocupa doble ancho, con la descripción visible.
  La grilla usa `grid-auto-flow: dense` para que no queden huecos.
- **Cinta de obra** (rayas 45°) como divisor entre bloques.
- **Riel lateral fijo** (≥1400 px) con el progreso de lectura.
- **Cursor propio** sobre la grilla: un disco naranja con "VER" (solo en punteros finos).
- **Cinta "Ver ficha →"** que sube desde la foto al pasar el mouse.
- **Entrada al scroll** escalonada, con sonda: si el visor no entrega
  `IntersectionObserver` (pasa en algunos iframes), se desactiva el reveal y nada
  queda oculto. El grano fijo se apaga por debajo de 900 px por costo en móviles.

Tipografía: **Big Shoulders Display** (títulos, industrial y condensada),
**Archivo** (texto) y **JetBrains Mono** (datos y etiquetas).

## Paleta

El logo de la marca es **blanco sobre negro** con la silueta de un coupe: la marca es
monocromatica. La paleta arranca de ahi, no de un color inventado.

**Carbon** — negro calido (`#0A0908`) + hueso (`#F0ECE4`) + un unico acento champan
(`#C6AE7E`). El champan aparece solo en CTAs, etiquetas de marca, numerales y filetes;
todo lo demas es neutro, asi las fotos de patio quedan parejas.

El verde queda reservado a WhatsApp, y en las tarjetas es solo el glifo sobre boton
fantasma: el verde saturado le peleaba a todo lo demas.

Los colores estan tokenizados en `:root` (`assets/css/hudson.css`), asi que cambiar la
paleta entera es tocar ese bloque. Hubo un selector con tres paletas para comparar en vivo;
se saco con `build/solo_carbon.py` una vez elegida Carbon.

## El logo como sistema grafico

El logo original (`assets/img/logo-hudson-cars-2-*.png`) es un PNG de fondo negro opaco,
asi que no servia sobre ningun fondo. Se convirtio en **mascaras CSS** (alpha = las marcas
blancas), de modo que el logo toma el color del tema automaticamente:

| Archivo | Uso |
|---|---|
| `assets/img/word-mask.png` | lettering en la nav |
| `assets/img/logo-mask.png` | logo completo al pie |
| `assets/img/car-mask.png` | divisores entre bloques, marca de agua del hero, estado vacio |

Se regeneran con `python build/make_masks.py`. `build/build-artifact.js` las incrusta como
data URI al armar la version de un solo archivo.

## Correr en local

Es un sitio estático: alcanza con servir la carpeta.

```bash
python -m http.server 5173
```

Y abrir `http://localhost:5173`.

---

Hecho con [Claude Code](https://claude.com/claude-code).

