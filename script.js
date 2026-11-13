/* Alba — lógica de la página.
   Para cambiar precio, número de WhatsApp o nombre del producto, edita CONFIG. */
const CONFIG = {
  whatsapp: '51992270323',          // código de país + número, sin "+" ni espacios
  producto: 'Collar Corazón de Perla Promesa',
  precio: 98.90,
  precioAntes: 119.90,
  cantidadMaxima: 5,
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const soles = (n) => n.toFixed(2);

/* Medición: envía eventos a los píxeles que estén instalados (Meta, TikTok, GA4). */
function track(evento, datos = {}) {
  try {
    const valor = { value: datos.total ?? CONFIG.precio, currency: 'PEN' };
    if (window.fbq) fbq('track', evento === 'pedido_enviado' ? 'Lead' : evento === 'abrir_pedido' ? 'InitiateCheckout' : 'Contact', valor);
    if (window.ttq) ttq.track(evento === 'pedido_enviado' ? 'SubmitForm' : evento === 'abrir_pedido' ? 'InitiateCheckout' : 'Contact', valor);
    if (window.gtag) gtag('event', evento, valor);
  } catch (e) { /* la medición nunca debe romper la compra */ }
}

/* Precios desde CONFIG */
let cantidad = 1;
function pintar() {
  $$('[data-price]').forEach((e) => (e.textContent = soles(CONFIG.precio)));
  $$('[data-compare]').forEach((e) => (e.textContent = soles(CONFIG.precioAntes)));
  $$('[data-save]').forEach((e) => (e.textContent = Math.round(CONFIG.precioAntes - CONFIG.precio)));
  $$('[data-qty-out]').forEach((e) => (e.textContent = cantidad));
  $$('[data-total]').forEach((e) => (e.textContent = soles(CONFIG.precio * cantidad)));
  $$('[data-qty="-1"]').forEach((b) => (b.disabled = cantidad <= 1));
  $$('[data-qty="1"]').forEach((b) => (b.disabled = cantidad >= CONFIG.cantidadMaxima));
}
$$('[data-qty]').forEach((b) =>
  b.addEventListener('click', () => {
    cantidad = Math.min(CONFIG.cantidadMaxima, Math.max(1, cantidad + Number(b.dataset.qty)));
    pintar();
  })
);
pintar();

/* Galería */
const track_ = $('#track');
const slides = [...track_.children];
const thumbs = $('#thumbs');
function irA(i) {
  track_.scrollTo({ left: slides[i].offsetLeft - track_.offsetLeft, behavior: 'smooth' });
}
slides.forEach((el, i) => {
  const esVideo = el.tagName === 'VIDEO';
  const t = document.createElement('button');
  t.type = 'button';
  t.setAttribute('aria-label', esVideo ? `Video ${i + 1}` : `Foto ${i + 1}`);
  if (esVideo) t.className = 'is-video';
  const ti = document.createElement('img');
  ti.src = esVideo ? el.poster : el.getAttribute('src');
  ti.alt = '';
  t.append(ti);
  t.addEventListener('click', () => irA(i));
  thumbs.append(t);
});
let actual = -1;
function marcar() {
  const i = Math.round(track_.scrollLeft / track_.clientWidth);
  if (i === actual) return;
  actual = i;
  [...thumbs.children].forEach((b, n) => b.setAttribute('aria-current', n === i));
  slides.forEach((el, n) => {
    if (el.tagName !== 'VIDEO') return;
    if (n === i) el.play().catch(() => {}); else el.pause();
  });
}
track_.addEventListener('scroll', () => requestAnimationFrame(marcar), { passive: true });
track_.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') irA(Math.min(slides.length - 1, actual + 1));
  if (e.key === 'ArrowLeft') irA(Math.max(0, actual - 1));
});
marcar();

/* Barra fija: aparece cuando el botón principal sale de pantalla */
const sticky = $('#sticky');
new IntersectionObserver(([e]) => sticky.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0)).observe($('#buy-actions'));

/* Formulario de pedido */
const dialog = $('#order');
const form = $('#order-form');
if (dialog.showModal) {
  $$('[data-order]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
      track('abrir_pedido', { total: CONFIG.precio * cantidad });
    })
  );
}
$('#order-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

/* Zona de envío: Lima y Callao pide distrito; provincia pide departamento y localidad */
function zona() {
  const z = form.elements.zona.value;
  $$('[data-zona]', form).forEach((g) => (g.hidden = g.dataset.zona !== z));
  form.elements.distrito.required = z === 'lima';
  form.elements.departamento.required = z === 'provincia';
  form.elements.localidad.required = z === 'provincia';
}
$$('[name="zona"]', form).forEach((r) => r.addEventListener('change', zona));
zona();

const campos = () => $$('input[type="text"], select', form).filter((c) => c.required);
function validar(c) {
  const vacio = c.required && !c.value.trim();
  c.setAttribute('aria-invalid', vacio);
  let msg = c.parentElement.querySelector('.field-error');
  if (vacio && !msg) {
    msg = document.createElement('div');
    msg.className = 'field-error';
    msg.textContent = 'Completa este dato para preparar tu pedido.';
    c.parentElement.append(msg);
  } else if (!vacio && msg) msg.remove();
  return !vacio;
}
$$('input[type="text"], select', form).forEach((c) =>
  c.addEventListener('input', () => c.getAttribute('aria-invalid') === 'true' && validar(c))
);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const requeridos = campos();
  const ok = requeridos.map(validar);
  if (ok.includes(false)) { requeridos[ok.indexOf(false)].focus(); return; }

  const d = new FormData(form);
  const v = (k) => (d.get(k) || '').trim();
  const total = CONFIG.precio * cantidad;
  const lineas = [
    'Hola Alba, quiero hacer este pedido:',
    '',
    `${cantidad} × ${CONFIG.producto}`,
    `Total: S/ ${soles(total)} (envío gratis)`,
    '',
    `Nombre: ${v('nombre')}`,
  ];
  if (v('zona') === 'lima') lineas.push(`Zona: Lima y Callao, ${v('distrito')}`);
  else lineas.push(`Zona: ${v('departamento')}, ${v('localidad')}`);
  if (v('direccion')) lineas.push(`Dirección: ${v('direccion')}`);
  if (v('zona') === 'provincia' && v('dni')) lineas.push(`DNI: ${v('dni')}`);
  lineas.push(`Pago: ${v('pago')}`);

  track('pedido_enviado', { total });
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank', 'noopener');
  dialog.close();
});

$$('[data-track]').forEach((a) => a.addEventListener('click', () => track(a.dataset.track)));
