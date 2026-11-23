/* Página 3: los relojes (tres diseños; tocar el reloj cambia de diseño). Las imágenes son las de la app del iPhone.
   De noche solo se oscurece el fondo. */
'use strict';
const relojes = (() => {
	const p = pag.elementos[2];
	div(p, 0, 0, 320, S.H, 'background:linear-gradient(101deg,#c3c3c5 0%,#d1d1d3 45%,#dfdee1 75%,#e3e1e4 100%)');
	const oscuro = div(p, 0, 0, 320, S.H, 'background:#000;opacity:0');
	const c = { x: 160, y: arribaDisco() + 26 + 130.5 };
	const LADO = 300;
	const DISENOS = 4;
	let diseno = Math.min(DISENOS - 1, Math.max(0, guardado.leer('disenoReloj', 0))), actual = null, tic = 0;
	const negro = () => diseno === 3 || noche.n >= 0.5;   /* 1.44: el reloj nuevo va sobre negro */
	const capa = (v, nombre, cx, cy, op) => {
		const im = img(nombre);
		const el = document.createElement('div');
		el.className = 'abs';
		const poner = () => { const w = im.naturalWidth / 2, h = im.naturalHeight / 2; el.style.cssText += `left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;background:url(${im.src}) center/100% 100%;`; };
		if (im.complete && im.naturalWidth) poner(); else im.addEventListener('load', poner);
		if (op !== undefined) el.style.opacity = op;
		v.appendChild(el);
		return el;
	};
	function armar() {
		const v = div(p, c.x - LADO / 2, c.y - LADO / 2, LADO, LADO, 'transition:opacity .45s ease-in-out,transform .45s ease-in-out');
		if (diseno === 3) {   /* 1.44: esfera negra, números grandes, agujas blancas y segundero naranja (dibujado en vivo) */
			const l = lienzo(LADO, LADO, v);
			boton(v, siguiente);
			return { v, lienzo: l };
		}
		const pf = 'reloj' + diseno + '_', m = LADO / 2;
		capa(v, pf + 'esfera', m, m);
		const op = diseno === 0 ? 0.55 : diseno === 1 ? 0.4 : 0.45;
		const aguja = (n, cx, cy, dy, o) => [capa(v, pf + n + '_sombra', cx, cy + dy, o), capa(v, pf + n, cx, cy)];
		const r = { v };
		if (diseno === 1) r.seg = aguja('chico', m, m + 50, 0.8, op);
		r.hora = aguja('hora', m, m, 1.4, op);
		r.min = aguja('minuto', m, m, 2, op);
		if (diseno !== 1) r.seg = aguja('segundo', m, m, 2.6, diseno === 2 ? 0.35 : op);
		capa(v, pf + 'frente', m, m);
		boton(v, siguiente);
		return r;
	}
	const girar = (par, ang, salto) => par.forEach(el => {
		el.style.transition = salto ? 'transform .16s cubic-bezier(.3,1.6,.6,1)' : 'none';
		el.style.transform = `rotate(${ang}rad)`;
	});
	let ultSeg = -1, vueltasSeg = 0;
	function ponerHora() {
		if (!actual) return;
		if (actual.lienzo) { const ctx = actual.lienzo.ctx; ctx.clearRect(0, 0, LADO, LADO); relojNegro(ctx, LADO / 2, LADO / 2, LADO / 2 - 6, new Date()); return; }
		const d = new Date(), ms = d.getMilliseconds(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
		girar(actual.hora, h / 12 * 2 * Math.PI); girar(actual.min, m / 60 * 2 * Math.PI);
		if (diseno === 2) girar(actual.seg, (s + ms / 1000) / 60 * 2 * Math.PI);
		else if (s !== ultSeg) {
			if (s === 0 && ultSeg === 59) vueltasSeg++;   /* que no dé la vuelta para atrás al pasar por las 12 */
			ultSeg = s;
			girar(actual.seg, (vueltasSeg * 60 + s) / 60 * 2 * Math.PI, true);
		}
	}
	function siguiente() {
		diseno = (diseno + 1) % DISENOS;
		pintarOscuro(0.45);
		guardado.poner('disenoReloj', diseno);
		const viejo = actual.v;
		actual = armar(); ultSeg = -1; vueltasSeg = 0;
		actual.v.style.opacity = 0; actual.v.style.transform = 'scale(.97)';
		requestAnimationFrame(() => requestAnimationFrame(() => { actual.v.style.opacity = 1; actual.v.style.transform = 'none'; viejo.style.opacity = 0; }));
		setTimeout(() => viejo.remove(), 500);
		ponerHora(); arrancar();
		for (const el of [luz, botonPlay, puntosD]) p.appendChild(el);
		pintarPuntosDiseno();
		puntosD.style.transition = 'none'; puntosD.style.opacity = 1;
		setTimeout(() => { puntosD.style.transition = 'opacity .8s'; puntosD.style.opacity = 0; }, 1400);
	}
	/* el LED arriba (como en la página 1) y el botón play / pausa abajo */
	const luz = div(p, c.x - 4, c.y - 130 - 22 - 4, 8, 8, 'border-radius:4px;transition:background .4s,box-shadow .4s');
	const botonPlay = div(p, c.x - 22, Math.round(c.y + 130 + 22) - 22, 44, 44);
	const icono = lienzo(20, 20, botonPlay, 12, 12);
	boton(botonPlay, playPausa, { abajo: () => { icono.style.transform = 'translateY(.5px)'; icono.style.opacity = .7; }, arriba: () => { icono.style.transform = ''; icono.style.opacity = 1; } });
	const puntosD = div(p, c.x - 26, Math.round(c.y + 130 + 46) - 3, 52, 6, 'opacity:0;pointer-events:none');
	const pd = [0, 1, 2, 3].map(i => div(puntosD, 3.5 + 13 * i, 0, 6, 6, 'border-radius:3px'));
	function pintarPuntosDiseno() { pd.forEach((el, i) => { el.style.background = `rgba(${negro() ? '255,255,255' : '0,0,0'},${i === diseno ? .7 : .2})`; }); }
	function pintarIcono() {
		const ctx = icono.ctx, pausa = radio.on, nocheSi = negro(), d = 18;
		ctx.clearRect(0, 0, 20, 20);
		for (let k = 0; k < 2; k++) {
			let dy = k ? 0 : 0.6, col = k ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.55)';
			if (nocheSi) { if (!k) continue; col = 'rgba(236,242,255,.5)'; dy = 0; }
			ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = 0.8;
			ctx.beginPath(); ctx.arc(1 + d / 2, 1 + d / 2 + dy, (d - 0.8) / 2, 0, 7); ctx.stroke();
			const cx = 1 + d / 2, cy = 1 + d / 2 + dy;
			if (pausa) { ctx.fillRect(cx - 2.6, cy - 3, 1.6, 6); ctx.fillRect(cx + 1, cy - 3, 1.6, 6); }
			else { ctx.beginPath(); ctx.moveTo(cx - 1.9, cy - 3.3); ctx.lineTo(cx + 3.2, cy); ctx.lineTo(cx - 1.9, cy + 3.3); ctx.fill(); }
		}
		icono.style.filter = nocheSi ? 'drop-shadow(0 0 2px rgba(236,242,255,.5))' : 'none';
	}
	function pintarLuz() {
		const e = radio.estadoLed(), col = e ? COLOR_LED[e] : G(0x3a, 0x3a, 0x37);
		luz.style.background = col;
		luz.style.boxShadow = e ? `0 0 7px 1px ${col}aa, 0 0 22px 6px ${col}44` : 'none';
	}
	function pintarOscuro(dura) { oscuro.style.transition = dura > 0 ? `opacity ${dura}s ease-in-out` : 'none'; oscuro.style.opacity = diseno === 3 ? 1 : noche.n; pintarPuntosDiseno(); pintarIcono(); }
	noche.alCambiar.push((n, dura) => pintarOscuro(dura));
	radio.alCambiar.push(() => { pintarLuz(); pintarIcono(); });
	/* esquinas, igual que en la página 1 */
	boton(div(p, 0, 0, 64, 64), () => pedirModo(0));
	boton(div(p, 0, S.H - 64, 64, 64), () => pedirModo(1));
	let vuelta = 0;   /* un solo ciclo andando a la vez */
	function andar(v) {
		if (v !== vuelta) return;
		if (pag.actual === 2 && !document.hidden) ponerHora();
		if ((diseno === 2 || diseno === 3) && pag.actual === 2) requestAnimationFrame(() => andar(v));
		else tic = setTimeout(() => andar(v), 1000 - new Date().getMilliseconds() + 5);
	}
	const arrancar = () => { clearTimeout(tic); andar(++vuelta); };
	pag.alCambiar.push(pg => { if (pg === 2) arrancar(); });
	return {
		empezar() { pintarOscuro(0); actual = armar(); for (const el of [luz, botonPlay, puntosD]) p.appendChild(el); ponerHora(); pintarLuz(); pintarIcono(); pintarPuntosDiseno(); arrancar(); },
	};
})();
