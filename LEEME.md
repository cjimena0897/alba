# Alba — página del Collar Corazón de Perla Promesa

Sitio estático (HTML + CSS + JS, sin dependencias). Se puede subir tal cual a
Netlify, Vercel, Cloudflare Pages o GitHub Pages: arrastra esta carpeta.

## Qué editar

- **Precio, número de WhatsApp, cantidad máxima:** `CONFIG` al inicio de `script.js`.
  El precio también está escrito en `index.html` (para Google y para quien no
  tenga JavaScript): busca `98.90` y `119.90`.
- **Textos y preguntas frecuentes:** `index.html`.
- **Colores y tipografías:** variables al inicio de `styles.css`.
- **Fotos y videos:** carpetas `img/` y `media/`.

## Medición

`script.js` ya envía eventos si pegas el píxel de Meta, TikTok o GA4 en el
`<head>` de `index.html`: abrir el formulario (InitiateCheckout) y enviar el
pedido (Lead).

## Probar en tu computadora

    python3 -m http.server 8000

y abre http://localhost:8000
