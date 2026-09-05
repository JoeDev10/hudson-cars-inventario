/* Le pone ?v=<hash> a los assets de index.html.
   Sin esto, el navegador (y el CDN de GitHub Pages) siguen sirviendo el CSS viejo
   después de un deploy, y parece que el cambio no se aplicó. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const ASSETS = ['assets/css/hudson.css', 'assets/js/core.js', 'assets/js/data.js',
                'assets/js/photos-local.js', 'assets/js/app.js'];

const indexPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
let cambios = 0;

for (const rel of ASSETS) {
  const hash = crypto.createHash('sha1')
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest('hex').slice(0, 8);
  // reemplaza el archivo con o sin ?v= previo
  const re = new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\?v=[0-9a-f]+)?', 'g');
  const antes = html;
  html = html.replace(re, rel + '?v=' + hash);
  if (html !== antes) cambios++;
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('ok → index.html: %d assets con hash de versión', cambios);
