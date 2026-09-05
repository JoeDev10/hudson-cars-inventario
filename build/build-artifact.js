/* Arma la versión de un solo archivo (para publicarla online como Artifact):
   CSS + JS + fotos incrustadas como data URI. */
const fs = require('fs'), p = require('path');
const ROOT = p.join(__dirname, '..');
const r = f => fs.readFileSync(p.join(ROOT, f), 'utf8');

const html = r('index.html');
const css = r('assets/css/hudson.css');
const data = r('assets/js/data.js');
const app = r('assets/js/app.js');
const photos = r('build/photos.json');

// las máscaras del logo viajan incrustadas: el visor no puede pedir archivos externos
const b64 = f => fs.readFileSync(p.join(ROOT, f)).toString('base64');
const mask = n => `url('data:image/png;base64,${b64('assets/img/' + n)}')`;

let body = html.split('<body>')[1].split('</body>')[0];
body = body.replace(/<script src="assets\/js\/[^"]+"><\/script>\s*/g, '');
// el bloque de PHOTOS_LOCAL es solo para hosting propio: aca las fotos van incrustadas
body = body.replace(/<script>\s*\/\* Si hay fotos servidas[\s\S]*?<\/script>\s*/, '');

const cssInline = css
  .replace("url('../img/logo-mask.png')", mask('logo-mask.png'))
  .replace("url('../img/car-mask.png')", mask('car-mask.png'))
  .replace("url('../img/word-mask.png')", mask('word-mask.png'));

const out = `<meta charset="utf-8">
<title>Inventario Hudson Cars</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Archivo:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
${cssInline}
</style>
${body}
<script>
${data}
/* fotos incrustadas: el prototipo funciona sin depender del sitio original */
var PHOTOS = ${photos};
VEHICULOS.forEach(function (v) { if (PHOTOS[v.id]) v.fotos = PHOTOS[v.id]; });
</script>
<script>
${app}
</script>
`;

const dest = p.join(ROOT, 'build', 'hudson-inventario.html');
fs.writeFileSync(dest, out, 'utf8');
console.log('ok →', dest, (fs.statSync(dest).size / 1e6).toFixed(2), 'MB');
