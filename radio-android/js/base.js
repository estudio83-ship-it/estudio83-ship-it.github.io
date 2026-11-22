/* Radio B&O para Android (versión web de la app del iPod/iPhone).
   Todo se dibuja en un escenario de 320 puntos de ancho (como el iPhone) que se agranda hasta el ancho del teléfono;
   el alto se estira según la pantalla. Los lienzos se dibujan a la resolución real, así nada se ve borroso. */
'use strict';
const S = { W: 320, H: 460, esc: 1, R: 2 };
const app = document.getElementById('app');
const carril = document.getElementById('carril');

function medir() {
	const w = innerWidth, h = innerHeight;
	S.esc = Math.min(w / 320, h / 460);
	S.H = Math.max(460, Math.round(h / S.esc));
	S.R = Math.min(4, (devicePixelRatio || 1) * S.esc);
	app.style.transform = `translateX(${Math.round((w - 320 * S.esc) / 2)}px) scale(${S.esc})`;
	app.style.height = S.H + 'px';
}
medir();

const G = (r, g, b, a = 1) => `rgba(${r},${g},${b},${a})`;
const guardado = {
	leer(k, d) { try { const v = localStorage.getItem('rbo-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
	poner(k, v) { try { localStorage.setItem('rbo-' + k, JSON.stringify(v)); } catch (e) {} },
	sacar(k) { try { localStorage.removeItem('rbo-' + k); } catch (e) {} },
};

/* un lienzo de w x h puntos, dibujado a la resolución de la pantalla */
function lienzo(w, h, padre, x = 0, y = 0) {
	const c = document.createElement('canvas');
	c.width = Math.max(1, Math.round(w * S.R));
	c.height = Math.max(1, Math.round(h * S.R));
	c.style.width = w + 'px'; c.style.height = h + 'px';
	c.style.position = 'absolute'; c.style.left = x + 'px'; c.style.top = y + 'px';
	const ctx = c.getContext('2d');
	ctx.setTransform(S.R, 0, 0, S.R, 0, 0);
	c.ctx = ctx;
	if (padre) padre.appendChild(c);
	return c;
}
function div(padre, x, y, w, h, css = '') {
	const d = document.createElement('div');
	d.className = 'abs';
	d.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;` + css;
	if (padre) padre.appendChild(d);
	return d;
}
function imagen(src) { const i = new Image(); i.src = src; return i; }
const cargadas = {};
function img(nombre) { return cargadas[nombre] || (cargadas[nombre] = imagen('img/' + nombre + '.png')); }
function listas(nombres) { return Promise.all(nombres.map(n => { const i = img(n); return i.complete && i.naturalWidth ? 1 : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }); })); }

/* degradé lineal entre dos puntos (como el degrade() de la app) */
function degrade(ctx, colores, x0, y0, x1, y1, lugares) {
	const g = ctx.createLinearGradient(x0, y0, x1, y1);
	colores.forEach((c, i) => g.addColorStop(lugares ? lugares[i] : i / (colores.length - 1), c));
	return g;
}

/* grano fino: una baldosa de 64 puntos con puntitos, repetida */
const tejas = {};
function granulado(ctx, x, y, w, h, semilla) {
	let t = tejas[semilla];
	if (!t) {
		t = document.createElement('canvas');
		t.width = t.height = Math.round(64 * S.R);
		const c = t.getContext('2d');
		c.scale(S.R, S.R);
		let s = semilla;
		const az = () => { s = (s * 1103515245 + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; };
		for (let i = 0; i < 64 * 64 * 2; i++) {
			const px = az() * 64, py = az() * 64, claro = az() < 0.5, a = 0.03 + az() * 0.06;
			c.fillStyle = claro ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
			c.fillRect(px, py, 0.5, 0.5);
		}
		tejas[semilla] = t;
	}
	ctx.save();
	const p = ctx.createPattern(t, 'repeat');
	p.setTransform && p.setTransform(new DOMMatrix().scale(1 / S.R));
	ctx.fillStyle = p;
	ctx.fillRect(x, y, w, h);
	ctx.restore();
}

/* ---------- páginas ---------- */
const PAGINAS = 4;
const pag = { actual: Math.min(PAGINAS - 1, Math.max(0, guardado.leer('pagina', 0))), elementos: [], alCambiar: [] };
carril.style.width = PAGINAS * 320 + 'px';
for (let i = 0; i < PAGINAS; i++) {
	const p = document.createElement('div');
	p.className = 'pagina';
	p.style.left = i * 320 + 'px';
	carril.appendChild(p);
	pag.elementos.push(p);
}
const arribaDisco = () => Math.max(0, Math.round((S.H - 286) / 2 - 10));   /* donde empieza el bloque del disco */
const puntos = document.getElementById('puntos');
let escondePuntos = 0;
function pintarPuntos() {
	const oscuro = (pag.actual === 0 || pag.actual === 2) && noche.n >= 0.5;
	puntos.classList.toggle('oscuro', oscuro);
	[...puntos.children].forEach((p, i) => p.classList.toggle('esta', i === pag.actual));
}
function mostrarPuntos() { clearTimeout(escondePuntos); pintarPuntos(); puntos.style.opacity = 1; }
function esconderPuntosLuego() { clearTimeout(escondePuntos); escondePuntos = setTimeout(() => { puntos.style.opacity = 0; }, 1600); }
function moverCarril(x, animado) {
	carril.style.transition = animado ? 'transform .38s cubic-bezier(.2,.7,.3,1)' : 'none';
	carril.style.transform = `translateX(${x}px)`;
}
function irAPagina(p) {
	p = Math.min(PAGINAS - 1, Math.max(0, p));
	pag.actual = p;
	guardado.poner('pagina', p);
	moverCarril(-p * 320, true);
	pag.alCambiar.forEach(f => f(p));
	pintarPuntos();
	esconderPuntosLuego();
}

/* Deslizar de costado cambia de página. Como en el iPod, solo desde la parte de abajo (debajo del disco), salvo en la
   consola, donde vale todo lo que no sea un botón. Cada página puede reservar zonas (pag.reserva). */
pag.reserva = [];   /* funciones (página, x, y) → true si ese toque es de la página */
const gesto = { id: null, x0: 0, y0: 0, activo: false, paginando: false };
function enEscenario(e) {
	const r = app.getBoundingClientRect();
	return { x: (e.clientX - r.left) / S.esc, y: (e.clientY - r.top) / S.esc };
}
app.addEventListener('pointerdown', e => {
	if (gesto.id !== null) return;
	const p = enEscenario(e);
	const yHoja = arribaDisco() + 26 + 260 + 6;
	const libre = pag.actual === 3 ? true : p.y >= yHoja;
	if (!libre || pag.reserva.some(f => f(pag.actual, p.x, p.y))) return;
	gesto.id = e.pointerId; gesto.x0 = p.x; gesto.y0 = p.y; gesto.activo = true; gesto.paginando = false;
}, true);
app.addEventListener('pointermove', e => {
	if (e.pointerId !== gesto.id || !gesto.activo) return;
	const p = enEscenario(e), dx = p.x - gesto.x0, dy = p.y - gesto.y0;
	if (!gesto.paginando) {
		if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) { gesto.paginando = true; gesto.t0 = performance.now(); mostrarPuntos(); document.dispatchEvent(new Event('paginando')); }
		else if (Math.abs(dy) > 16) { gesto.activo = false; return; }
		else return;
	}
	let x = -pag.actual * 320 + dx;
	const min = -(PAGINAS - 1) * 320;
	if (x > 0) x /= 3;
	if (x < min) x = min + (x - min) / 3;
	moverCarril(x, false);
	gesto.ultimoDx = dx; gesto.ultimaT = performance.now();
}, true);
function soltarGesto(e) {
	if (e.pointerId !== gesto.id) return;
	if (gesto.paginando) {
		const p = enEscenario(e), dx = p.x - gesto.x0, dt = Math.max(1, performance.now() - gesto.t0);
		const vel = dx / dt * 1000;
		let n = pag.actual;
		if (dx < -80 || vel < -450) n++;
		else if (dx > 80 || vel > 450) n--;
		irAPagina(n);
		gesto.recien = performance.now();
	}
	gesto.id = null; gesto.activo = false; gesto.paginando = false;
}
app.addEventListener('pointerup', soltarGesto, true);
app.addEventListener('pointercancel', soltarGesto, true);
/* ¿el último toque fue un deslizamiento de página? (entonces no cuenta como apretar un botón) */
const fuePagina = () => gesto.paginando || (gesto.recien && performance.now() - gesto.recien < 80);

/* un botón que reacciona al soltar (si no se deslizó de página) */
function boton(el, alSoltar, opciones = {}) {
	let id = null, adentro = false;
	el.addEventListener('pointerdown', e => {
		if (id !== null) return;
		id = e.pointerId; adentro = true;
		try { el.setPointerCapture(e.pointerId); } catch (_) {}
		opciones.abajo && opciones.abajo(e);
	});
	el.addEventListener('pointermove', e => {
		if (e.pointerId !== id) return;
		const r = el.getBoundingClientRect();
		const ad = e.clientX >= r.left - 20 && e.clientX <= r.right + 20 && e.clientY >= r.top - 20 && e.clientY <= r.bottom + 20;
		if (gesto.paginando) { if (adentro) { adentro = false; opciones.cancelado && opciones.cancelado(); } return; }
		if (ad !== adentro) { adentro = ad; opciones.cambio && opciones.cambio(ad); }
	});
	const fin = (e, cancel) => {
		if (e.pointerId !== id) return;
		id = null;
		const vale = adentro && !cancel && !fuePagina();
		adentro = false;
		opciones.arriba && opciones.arriba(vale);
		if (vale) alSoltar(e);
	};
	el.addEventListener('pointerup', e => fin(e, false));
	el.addEventListener('pointercancel', e => fin(e, true));
}

/* ---------- modo noche (páginas 1 y 3): según la hora, o el que se pidió con las esquinas ---------- */
const noche = { n: 0, alCambiar: [] };
function nocheSegunHora() {
	const d = new Date(), h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
	let x;
	if (h >= 20 || h < 7) return 1;
	if (h >= 19) x = h - 19;
	else if (h < 8) x = 1 - (h - 7);
	else return 0;
	return x * x * (3 - 2 * x);
}
function proxima(hora) {
	const a = new Date(), f = new Date(a);
	f.setHours(hora, 0, 0, 0);
	if (f <= a) f.setDate(f.getDate() + 1);
	return f.getTime();
}
function cuantoDeNoche() {
	const m = guardado.leer('modoManual', -1);
	if (m >= 0) {
		if (Date.now() < guardado.leer('modoHasta', 0)) return m;
		guardado.poner('modoManual', -1);
	}
	return nocheSegunHora();
}
function ponerNoche(dura) {
	const n = cuantoDeNoche();
	if (Math.abs(n - noche.n) < 0.002 && dura > 0) return;
	noche.n = n;
	noche.alCambiar.forEach(f => f(n, dura));
	pintarPuntos();
}
function pedirModo(m) {
	const h = nocheSegunHora();
	if ((m === 1 && h >= 1) || (m === 0 && h <= 0)) guardado.poner('modoManual', -1);
	else { guardado.poner('modoManual', m); guardado.poner('modoHasta', proxima(m ? 20 : 8)); }
	ponerNoche(3);
}
