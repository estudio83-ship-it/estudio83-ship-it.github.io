/* Página 2: el tocadiscos de panel gris claro, con el display de puntos calado en la carcasa (dos filas; deslizándolo
   hacia abajo se abre con el clima, el despertador y las geometrías), el plato que gira, las teclas y los vúmetros. */
'use strict';
const kR = 130, kRCentro = 34, kAltoTecla = 78, kAnchoTecla = 64, kMarco = 6, kP = 2;

/* los tres estilos de luz del display: negro, verde y turquesa */
const ESTILOS = [
	{ vidrio: [10, 10, 10], apagado: [255, 255, 255, 0.06], punto: [246, 246, 240], halo: [255, 250, 235, 0.16], brillo: 0.045 },
	{ vidrio: [208, 232, 80], apagado: [52, 66, 8, 0.11], punto: [38, 48, 10], halo: [40, 52, 6, 0.2], brillo: 0.2 },
	{ vidrio: [104, 170, 166], apagado: [6, 40, 40, 0.12], punto: [12, 22, 24], halo: [0, 30, 30, 0.22], brillo: 0.16 },
];
const rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a === undefined ? (c[3] === undefined ? 1 : c[3]) : a})`;

const tocadiscos = (() => {
	const p = pag.elementos[1];
	const W = 320, H = S.H;
	const tfy = H - kAltoTecla;                       /* arriba de las teclas */
	const c = { x: Math.round(W / 2) + 3, y: Math.round(tfy - 13 - kR) };   /* el centro del plato */
	const altoDisplay = c.y - kR - 13;                /* la franja de arriba del plato */
	const cerrada = { x: 12, y: 12, w: W - 24, h: Math.max(72, altoDisplay - 12 - 10) };   /* arriba de todo, hasta el disco */
	const abierta = { x: 12, y: 12, w: W - 24, h: tfy - 10 - 12 };

	/* ---------- el panel (quieto) ---------- */
	const panel = lienzo(W, H, p);
	function frente(ctx) {
		const d = 2 * kR;
		ctx.save();
		ctx.beginPath(); ctx.arc(kR, kR, kR, 0, 7); ctx.clip();
		const g = ctx.createLinearGradient(d * 0.15, d * 0.05, d * 0.85, d * 0.95);
		g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.05)');
		ctx.fillStyle = g; ctx.fillRect(0, 0, d, d);
		ctx.restore();
		/* la buña entre el panel y el plato */
		ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,.45)';
		ctx.beginPath(); ctx.arc(kR, kR, kR + 1.6, 0, 7); ctx.stroke();
		ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(52,52,52,.7)';
		ctx.beginPath(); ctx.arc(kR, kR, kR + 0.4, 0, 7); ctx.stroke();
		ctx.save();
		ctx.beginPath(); ctx.arc(kR, kR, kR - 0.2, 0, 7); ctx.arc(kR, kR, kR - 1.9, 0, 7, true); ctx.clip('evenodd');
		const ca = ctx.createLinearGradient(d * 0.3, 0, d * 0.7, d);
		ca.addColorStop(0, 'rgba(255,255,255,.25)'); ca.addColorStop(1, 'rgba(255,255,255,.95)');
		ctx.fillStyle = ca; ctx.fillRect(0, 0, d, d);
		ctx.restore();
		ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(0,0,0,.12)';
		ctx.beginPath(); ctx.arc(kR, kR, kR - 2.2, 0, 7); ctx.stroke();
		/* el centro cromado, con el reflejo oscuro en diagonal */
		const r = kRCentro;
		ctx.save();
		ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowOffsetY = 0.6 * S.R; ctx.shadowBlur = 0.8 * S.R;
		ctx.fillStyle = G(150, 150, 152); ctx.beginPath(); ctx.arc(kR, kR, r, 0, 7); ctx.fill();
		ctx.restore();
		ctx.save();
		ctx.beginPath(); ctx.arc(kR, kR, r, 0, 7); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgb(237,237,240)', 'rgb(204,204,207)', 'rgb(179,179,181)'], kR - r, kR - r, kR + r, kR + r, [0, .55, 1]);
		ctx.fillRect(kR - r, kR - r, 2 * r, 2 * r);
		ctx.beginPath();
		ctx.moveTo(kR + 0.2 * r, kR - 1.2 * r); ctx.lineTo(kR + 1.3 * r, kR - 1.2 * r); ctx.lineTo(kR + 1.3 * r, kR + 1.2 * r); ctx.lineTo(kR - 0.5 * r, kR + 1.2 * r);
		ctx.closePath(); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgb(128,128,133)', 'rgb(148,148,153)', 'rgb(168,168,173)'], kR - 0.15 * r, kR, kR + r, kR - 0.2 * r, [0, .55, 1]);
		ctx.fillRect(kR - r, kR - r, 2 * r, 2 * r);
		ctx.restore();
		ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(80,80,82,.85)';
		ctx.beginPath(); ctx.arc(kR, kR, r - 0.3, 0, 7); ctx.stroke();
		ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(255,255,255,.8)';
		ctx.beginPath(); ctx.arc(kR, kR, r - 1, Math.PI * 0.95, Math.PI * 1.5); ctx.stroke();
		ctx.strokeStyle = 'rgba(255,255,255,.45)';
		ctx.beginPath(); ctx.arc(kR, kR, r - 1, Math.PI * 0.05, Math.PI * 0.45); ctx.stroke();
	}
	function pintarPanel() {
		const ctx = panel.ctx;
		ctx.fillStyle = degrade(ctx, ['rgb(208,208,206)', 'rgb(192,192,190)'], W, 0, 0, H);
		ctx.fillRect(0, 0, W, H);
		granulado(ctx, 0, 0, W, H, 19);
		/* un satinado muy suave: la luz que cae de arriba a la izquierda sobre el arenado */
		const sat = ctx.createRadialGradient(W * 0.2, H * 0.1, 0, W * 0.2, H * 0.1, H * 0.9);
		sat.addColorStop(0, 'rgba(255,255,255,.10)'); sat.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = sat; ctx.fillRect(0, 0, W, H);
	}
	pintarPanel();

	/* ---------- lo que gira: la raya, los tornillos y las inscripciones ---------- */
	const plato = lienzo(2 * kR, 2 * kR, p, c.x - kR, c.y - kR);
	plato.style.pointerEvents = 'none';
	(function detalles(ctx) {
		/* el disco de aluminio granallado; el arenado tiene zonas apenas más claras u oscuras, y como giran con el
		   plato se nota que da vueltas */
		ctx.save();
		ctx.beginPath(); ctx.arc(kR, kR, kR, 0, 7); ctx.clip();
		ctx.fillStyle = G(204, 204, 202); ctx.fillRect(0, 0, 2 * kR, 2 * kR);
		let s = 4242;
		const az = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return (s >>> 8) / 16777216; };
		for (let i = 0; i < 70; i++) {
			const a = az() * 2 * Math.PI, r = Math.sqrt(az()) * kR, x = kR + r * Math.cos(a), y = kR + r * Math.sin(a), rr = 8 + az() * 34;
			const g = ctx.createRadialGradient(x, y, 0, x, y, rr), cl = az() < 0.5;
			g.addColorStop(0, cl ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.032)'); g.addColorStop(1, cl ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)');
			ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
		}
		granulado(ctx, 0, 0, 2 * kR, 2 * kR, 83, 0.16);
		ctx.restore();
		ctx.save();
		ctx.translate(kR, kR);
		ctx.strokeStyle = 'rgba(58,58,58,.8)'; ctx.lineWidth = 0.6;
		const a = -Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
		ctx.beginPath();
		for (const lado of [-1, 1]) { ctx.moveTo(lado * (kRCentro + 5) * ca, lado * (kRCentro + 5) * sa); ctx.lineTo(lado * (kR - 6) * ca, lado * (kR - 6) * sa); }
		ctx.stroke();
		const tinta = 'rgba(62,62,62,.9)';
		ctx.fillStyle = tinta; ctx.strokeStyle = tinta;
		ctx.font = '300 10.5px "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif';
		ctx.textBaseline = 'middle';
		ctx.save(); ctx.translate(-57, -58); ctx.rotate(Math.PI / 4); ctx.textAlign = 'center'; ctx.fillText('96 / 24', 0, 0); ctx.restore();
		ctx.save(); ctx.translate(54, 55); ctx.rotate(Math.PI / 4);
		const tres = ctx.measureText('3').width, ancho = tres + 3 + 10 + 3.5 + 10;
		let x = -ancho / 2;
		ctx.textAlign = 'left'; ctx.fillText('3', x, 0.5);
		x += tres + 3;
		ctx.lineWidth = 0.6;
		ctx.beginPath(); ctx.arc(x + 3.2, 0, 3.2, 0, 7); ctx.stroke();
		ctx.beginPath(); ctx.arc(x + 6.8, 0, 3.2, 0, 7); ctx.stroke();
		x += 13.5;
		ctx.strokeRect(x, -5, 10, 10);
		ctx.font = '300 9px "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif'; ctx.textAlign = 'center';
		ctx.fillText('M', x + 5, 0.5);
		ctx.restore();
		ctx.restore();
	})(plato.ctx);
	/* la luz quieta sobre el disco (el brillo, la buña y el centro cromado) y arriba los tres tornillos, que giran */
	const luces = lienzo(2 * kR, 2 * kR, p, c.x - kR, c.y - kR);
	luces.style.pointerEvents = 'none';
	frente(luces.ctx);
	const tornillos = lienzo(2 * kR, 2 * kR, p, c.x - kR, c.y - kR);
	tornillos.style.pointerEvents = 'none';
	(ctx => {
		ctx.save(); ctx.translate(kR, kR);
		for (const an of [-1.861, 0.220, 2.381]) {
			const px = 22.5 * Math.cos(an), py = 22.5 * Math.sin(an);
			const el = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7); ctx.fill(); };
			el(px - 2.4, py - 2.0, 4.8, 4.8, 'rgba(255,255,255,.6)');
			el(px - 2.4, py - 2.4, 4.8, 4.8, G(62, 62, 64));
			el(px - 1.7, py - 1.7, 3.4, 3.4, G(196, 196, 198));
			el(px - 1.2, py - 1.3, 1.3, 1.1, 'rgba(255,255,255,.95)');
			el(px + 0.1, py + 0.2, 1.2, 1.2, G(110, 110, 112));
		}
		ctx.restore();
	})(tornillos.ctx);
	const girar = a => { plato.style.transform = tornillos.style.transform = `rotate(${a}rad)`; };
	const motor = { ang: guardado.leer('anguloPlato', 0), vel: 0 };
	const W33 = 2 * Math.PI * (100 / 3) / 60;   /* 33⅓ vueltas por minuto, en radianes por segundo */

	/* ---------- LED, flechas, volumen, teclas y vúmetros ---------- */
	const luz = div(p, W - 18 - 5.5, c.y - kR + 14 - 5.5, 11, 11, 'border-radius:5.5px;transition:background .3s,box-shadow .3s');
	function zonaFlechas(y, arriba, accion) {
		const z = div(p, Math.round((c.x - kR) / 2) - 18, y - 30, 36, 60);
		const l = lienzo(36, 60, z);
		const ctx = l.ctx, x = 18, y0 = 30 - 9;
		ctx.fillStyle = G(120, 120, 117);
		ctx.beginPath();
		for (let i = 0; i < (arriba ? 2 : 1); i++) {
			const yy = y0 + i * 9;
			if (arriba) { ctx.moveTo(x, yy); ctx.lineTo(x + 5, yy + 8); ctx.lineTo(x - 5, yy + 8); }
			else { ctx.moveTo(x - 5, yy); ctx.lineTo(x + 5, yy); ctx.lineTo(x, yy + 8); }
			ctx.closePath();
		}
		ctx.fill();
		if (!arriba) {
			ctx.save(); ctx.translate(x, y0 + 20); ctx.rotate(-Math.PI / 2);
			ctx.font = '300 11px "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
			ctx.fillText('R', 0, 0); ctx.restore();
		}
		boton(z, accion);
	}
	zonaFlechas(c.y - 80, true, () => paso(-1));
	zonaFlechas(c.y + 80, false, () => paso(1));
	const centro = div(p, c.x - kRCentro - 8, c.y - kRCentro - 8, 2 * (kRCentro + 8), 2 * (kRCentro + 8), 'border-radius:50%');
	let armado = 0, tc = 0;
	boton(centro, () => { if (armado === 1) alternarSleep(); else if (!armado) playPausa(); }, {
		abajo: () => { armado = 0; tc = setTimeout(() => { armado = 1; if (navigator.vibrate) navigator.vibrate(15); }, 700); },
		arriba: () => clearTimeout(tc), cancelado: () => { clearTimeout(tc); armado = 2; },
	});
	/* + y −: dos botones redondos en una canaleta en diagonal */
	const volumen = div(p, c.x + kR * 0.707 + 22 - 35, c.y + kR * 0.707 + 22 - 17, 70, 34,
		'background:rgba(178,178,176,.55);border-radius:17px;border:.5px solid rgba(255,255,255,.45);transform:rotate(-45deg);transition:opacity .4s');
	function botonRedondo(mas, ap) {
		const d = 30, l = lienzo(d, d), ctx = l.ctx;
		ctx.save(); ctx.shadowColor = `rgba(0,0,0,${ap ? .15 : .3})`; ctx.shadowOffsetY = S.R; ctx.shadowBlur = 1.5 * S.R;
		ctx.fillStyle = G(200, 200, 198); ctx.beginPath(); ctx.arc(d / 2, d / 2, d / 2 - 1, 0, 7); ctx.fill(); ctx.restore();
		ctx.save(); ctx.beginPath(); ctx.arc(d / 2, d / 2, d / 2 - 1, 0, 7); ctx.clip();
		ctx.fillStyle = degrade(ctx, ap ? ['rgb(188,188,186)', 'rgb(178,178,176)'] : ['rgb(222,222,220)', 'rgb(188,188,186)'], 0, 1, 0, d - 1); ctx.fillRect(0, 0, d, d); ctx.restore();
		ctx.strokeStyle = 'rgba(90,90,88,.8)'; ctx.lineWidth = 0.75; ctx.beginPath(); ctx.arc(d / 2, d / 2, d / 2 - 1, 0, 7); ctx.stroke();
		ctx.save(); ctx.translate(d / 2, d / 2); ctx.rotate(Math.PI / 4);
		ctx.strokeStyle = G(60, 60, 58); ctx.lineWidth = 1; const L = d * 0.22;
		ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(L, 0); if (mas) { ctx.moveTo(0, -L); ctx.lineTo(0, L); } ctx.stroke(); ctx.restore();
		return l;
	}
	function tecla(padre, x, y, w, h, suelta, apretada, accion) {
		const t = div(padre, x, y, w, h);
		suelta.style.left = apretada.style.left = '0px'; suelta.style.top = apretada.style.top = '0px';
		apretada.style.visibility = 'hidden';
		t.appendChild(suelta); t.appendChild(apretada);
		const ver = ap => { suelta.style.visibility = ap ? 'hidden' : 'visible'; apretada.style.visibility = ap ? 'visible' : 'hidden'; };
		boton(t, accion, { abajo: () => ver(true), cambio: ver, arriba: () => ver(false), cancelado: () => ver(false) });
		return t;
	}
	const cambiarVolumen = d => { ponerVolumen(radio.vol + d); mostrarVolumen(radio.vol); };
	tecla(volumen, 2, 2, 30, 30, botonRedondo(false, false), botonRedondo(false, true), () => cambiarVolumen(-1 / 16));
	tecla(volumen, 38, 2, 30, 30, botonRedondo(true, false), botonRedondo(true, true), () => cambiarVolumen(1 / 16));
	/* las tres teclas de abajo, sobre una franja negra */
	function imagenTecla(icono, ap) {
		const w = kAnchoTecla, h = kAltoTecla + 4, l = lienzo(w, h), ctx = l.ctx;
		ctx.save();
		ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, 3); ctx.arcTo(0, 0, 3, 0, 3); ctx.lineTo(w - 3, 0); ctx.arcTo(w, 0, w, 3, 3); ctx.lineTo(w, h); ctx.closePath(); ctx.clip();
		ctx.fillStyle = degrade(ctx, ap ? ['rgb(188,188,186)', 'rgb(170,170,168)'] : ['rgb(216,216,214)', 'rgb(184,184,182)'], 0, 0, 0, h); ctx.fillRect(0, 0, w, h);
		granulado(ctx, 0, 0, w, h, 7);
		ctx.fillStyle = degrade(ctx, [`rgba(255,255,255,${ap ? .3 : .7})`, 'rgba(255,255,255,0)'], 0, 0, 0, 4); ctx.fillRect(0, 0, w, 4);
		ctx.fillStyle = `rgba(255,255,255,${ap ? .15 : .35})`; ctx.fillRect(0, 0, 1.5, h);
		ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(w - 2, 0, 2, h);
		ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fillRect(w - 4, 0, 2, h);
		ctx.restore();
		const cx = w / 2, cy = 30 + (ap ? 1 : 0);
		if (icono === 0) {
			ctx.fillStyle = G(236, 98, 44); ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 7); ctx.fill();   /* tinta plana, sin luz */
		} else if (icono === 1) {
			ctx.fillStyle = G(20, 20, 20); ctx.beginPath(); ctx.moveTo(cx - 5, cy - 7); ctx.lineTo(cx + 7, cy); ctx.lineTo(cx - 5, cy + 7); ctx.fill();
		} else { ctx.fillStyle = G(20, 20, 20); ctx.fillRect(cx - 5.5, cy - 5.5, 11, 11); }
		return l;
	}
	const teclas = div(p, 10, tfy, 3 * kAnchoTecla + 8, kAltoTecla + 6, 'background:#161616;border-radius:3px');
	[cambiarBanda, () => encender(true), () => encender(false)].forEach((f, i) =>
		tecla(teclas, 2 + i * (kAnchoTecla + 2), 2, kAnchoTecla, kAltoTecla + 4, imagenTecla(i, false), imagenTecla(i, true), f));

	/* los vúmetros: dos tiras de 22 micro LEDs blancos */
	const LEDS = 22, vw = 60, vh = kAltoTecla - 8, vx = Math.round((10 + 3 * kAnchoTecla + 8 + W) / 2) - vw / 2, vy = tfy + 6;
	const vumetro = lienzo(vw, vh + 4, p, vx, vy - 2);
	const pasoLed = vh / LEDS, xs = [Math.round(vw / 2) - 9, Math.round(vw / 2) + 4];
	const fondoVu = lienzo(vw, vh + 4);
	(ctx => {
		ctx.translate(0, 2);
		ctx.fillStyle = 'rgba(90,90,88,.6)'; ctx.fillRect(0, Math.round(vh * 0.3), vw, 0.5);
		for (const x of xs) {
			ctx.fillStyle = 'rgba(160,160,157,.55)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 1.5, -1.5, 8, vh + 2, 2) : ctx.rect(x - 1.5, -1.5, 8, vh + 2); ctx.fill();
			ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 0.5; ctx.stroke();
			ctx.fillStyle = G(128, 128, 125);
			for (let i = 0; i < LEDS; i++) ctx.fillRect(x, vh - (i + 1) * pasoLed + 0.5, 5, pasoLed - 1.5);
		}
	})(fondoVu.ctx);
	const vuNivel = [0, 0], vuPico = [0, 0], vuQueda = [0, 0];
	let vuVisto = '';
	function pintarVu(a, b) {
		const obj = [a, b];
		for (let k = 0; k < 2; k++) {
			const t = Math.min(1, Math.max(0, obj[k]));
			if (t > vuNivel[k]) vuNivel[k] += (t - vuNivel[k]) * 0.65; else vuNivel[k] = Math.max(t, vuNivel[k] - 0.03);
			if (vuNivel[k] >= vuPico[k]) { vuPico[k] = vuNivel[k]; vuQueda[k] = 22; }
			else if (vuQueda[k] > 0) vuQueda[k]--;
			else vuPico[k] = Math.max(vuNivel[k], vuPico[k] - 0.02);
		}
		const n = vuNivel.map(v => Math.round(v * LEDS)), pk = vuPico.map((v, k) => { const q = Math.round(v * LEDS) - 1; return q < n[k] ? -1 : q; });
		const clave = n.join() + pk.join();
		if (clave === vuVisto) return;
		vuVisto = clave;
		const ctx = vumetro.ctx;
		ctx.clearRect(0, 0, vw, vh + 4);
		ctx.drawImage(fondoVu, 0, 0, vw, vh + 4);
		ctx.save(); ctx.translate(0, 2);
		ctx.fillStyle = G(250, 252, 255); ctx.shadowColor = 'rgba(250,252,255,.9)'; ctx.shadowBlur = 2.5 * S.R;
		for (let k = 0; k < 2; k++) for (let i = 0; i < LEDS; i++)
			if (i < n[k] || i === pk[k]) ctx.fillRect(xs[k], vh - (i + 1) * pasoLed + 0.5, 5, pasoLed - 1.5);
		ctx.restore();
	}
	pintarVu(0, 0);

	/* ---------- el display ---------- */
	let estilo = guardado.leer('estiloDisplay', 0), abiertoDisp = false, geometria = false, geo = null;
	function imagenMarco() {
		const m = kMarco, lado = 2 * m + 20, l = lienzo(lado, lado), ctx = l.ctx;
		const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
		ctx.save(); rr(0, 0, lado, lado, m + 2); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgb(150,150,148)', 'rgb(236,236,234)'], 0, 0, 0, lado); ctx.fillRect(0, 0, lado, lado); ctx.restore();
		ctx.save(); rr(0.75, 0.75, lado - 1.5, lado - 1.5, m + 1.25); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgb(238,238,236)', 'rgb(176,176,174)'], 0, 0, 0, lado); ctx.fillRect(0, 0, lado, lado);
		let s = 5;
		for (let y = 0; y < lado; y += 0.5) { s = (s * 1103515245 + 12345) >>> 0; const k = (s >>> 16) & 0xff; ctx.fillStyle = (k & 1 ? 'rgba(255,255,255,' : 'rgba(0,0,0,') + (0.03 + k / 255 * 0.05) + ')'; ctx.fillRect(0, y, lado, 0.5); }
		const b = m - 1.5;
		ctx.save(); rr(b, b, lado - 2 * b, lado - 2 * b, 3.5); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgb(90,90,90)', 'rgb(250,250,248)'], 0, b, 0, lado - b); ctx.fillRect(0, 0, lado, lado); ctx.restore();
		ctx.restore();
		ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 0.5; rr(1.25, 1.25, lado - 2.5, lado - 2.5, m + 0.75); ctx.stroke();
		ctx.fillStyle = 'rgba(0,0,0,.85)'; rr(m - 0.5, m - 0.5, lado - 2 * m + 1, lado - 2 * m + 1, 3); ctx.fill();
		return l.toDataURL();
	}
	const marco = div(p, 0, 0, 0, 0, `border:10px solid transparent;border-image:url(${imagenMarco()}) ${Math.round(10 * S.R)} fill / 10px stretch;`);
	const ventana = div(p, 0, 0, 0, 0, 'overflow:hidden;border-radius:2px');
	const anim = 'left .42s ease-in-out,top .42s ease-in-out,width .42s ease-in-out,height .42s ease-in-out';
	function ponerVentana(r, animado) {
		for (const el of [marco, ventana, toque]) el.style.transition = animado ? anim : 'none';
		const q = [[marco, r.x - kMarco, r.y - kMarco, r.w + 2 * kMarco, r.h + 2 * kMarco], [ventana, r.x, r.y, r.w, r.h], [toque, r.x - kMarco, r.y - kMarco, r.w + 2 * kMarco, r.h + 2 * kMarco]];
		for (const [el, x, y, w, h] of q) { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px'; }
	}
	/* las dos filas */
	const filas = lienzo(296, 72, ventana, 0, 0);
	const letras = Math.floor((296 - 20 + kP) / (6 * kP));
	const origen = { x: Math.round((296 - (letras * 6 * kP - kP)) / 2), y: Math.round((72 - (7 + 4 + 7) * kP) / 2) };
	const fondoFilas = lienzo(296, 72);
	const textos = ['', ''], corrido = [0, 0], espera = [0, 0];
	let volHasta = 0, volVal = 0, vistos = '';
	function vidrio(ctx, w, h, e) {
		const st = ESTILOS[e];
		ctx.fillStyle = rgb(st.vidrio); ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = degrade(ctx, [`rgba(255,255,255,${st.brillo})`, 'rgba(255,255,255,0)'], 0, 0, 0, h * 0.7); ctx.fillRect(0, 0, w, h);
	}
	function armarFondoFilas() {
		const ctx = fondoFilas.ctx;
		ctx.clearRect(0, 0, 296, 72);
		vidrio(ctx, 296, 72, estilo);
		ctx.fillStyle = rgb(ESTILOS[estilo].apagado);
		for (let f = 0; f < 2; f++) for (let ci = 0; ci < letras; ci++) for (let x = 0; x < 5; x++) for (let y = 0; y < 7; y++)
			ctx.fillRect(origen.x + (ci * 6 + x) * kP, origen.y + (f * 11 + y) * kP, 1.5, 1.5);
	}
	const limpio = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/…/g, '...').replace(/°/g, '\x7f').replace(/[^\x20-\x7f]/g, ' ').trim();
	const corre = i => textos[i].length > letras;
	function vista(i) {
		const t = textos[i];
		if (t.length <= letras) return t;
		return (t + '    ' + t).substr(corrido[i], letras);
	}
	function pintarFilas(forzar) {
		const v0 = vista(0), v1 = volHasta ? 'VOL' : vista(1);
		const clave = v0 + '|' + v1 + '|' + (volHasta ? volVal : '');
		if (clave === vistos && !forzar) return;
		vistos = clave;
		const ctx = filas.ctx, st = ESTILOS[estilo];
		ctx.clearRect(0, 0, 296, 72);
		ctx.drawImage(fondoFilas, 0, 0, 296, 72);
		const mapa = [];
		[v0, v1].forEach((t, f) => {
			for (let ci = 0; ci < Math.min(letras, t.length); ci++) {
				const ch = t.charCodeAt(ci);
				if (ch < 0x20 || ch > 0x7f) continue;
				for (let x = 0; x < 5; x++) for (let y = 0; y < 7; y++) if (PIX[ch - 0x20][x] >> y & 1) mapa.push([f, ci, x, y]);
			}
		});
		if (volHasta) {
			const desde = 4, cuantas = Math.min(16, letras - desde), llenas = Math.round(volVal * cuantas);
			for (let ci = 0; ci < cuantas; ci++) for (let x = 0; x < 5; x++) for (let y = 0; y < 7; y++)
				if (ci < llenas ? (y > 0 && y < 6) : (y === 3 && x === 2)) mapa.push([1, desde + ci, x, y]);
		}
		for (let capa = 0; capa < 2; capa++) {
			ctx.fillStyle = capa ? rgb(st.punto) : rgb(st.halo);
			for (const [f, ci, x, y] of mapa) {
				const px = origen.x + (ci * 6 + x) * kP, py = origen.y + (f * 11 + y) * kP;
				if (capa) ctx.fillRect(px, py, 1.5, 1.5);
				else if (estilo) ctx.fillRect(px + 0.5, py + 0.5, 1.5, 1.5);
				else { ctx.beginPath(); ctx.arc(px + 0.75, py + 0.75, 1.65, 0, 7); ctx.fill(); }
			}
		}
	}
	setInterval(() => {
		if (pag.actual !== 1 || document.hidden) return;
		if (volHasta && Date.now() > volHasta) volHasta = 0;
		for (let i = 0; i < 2; i++) {
			if (!corre(i)) continue;
			if (espera[i] > 0) { espera[i]--; continue; }
			corrido[i] = (corrido[i] + 1) % (textos[i].length + 4);
			if (corrido[i] === 0) espera[i] = 8;
		}
		pintarFilas();
	}, 250);
	function ponerFila(i, t) { t = limpio(t); if (t === textos[i]) return; textos[i] = t; corrido[i] = 0; espera[i] = 6; pintarFilas(); }
	function mostrarVolumen(v) { volVal = v; volHasta = Date.now() + 1500; pintarFilas(true); }

	/* el display grande: una grilla de puntos (un pixel por punto, agrandado sin suavizar) con la rejilla encima */
	const mw = abierta.w - 16, mh = Math.floor((abierta.h - 72 - 8) / kP) * kP;
	const cols = mw / kP, rows = mh / kP, oyMenu = 0;
	const matriz = div(ventana, 8, 72, mw, mh);   /* si el display cerrado es alto, ya se ve el clima de ahora */
	const chico = document.createElement('canvas'); chico.width = cols; chico.height = rows;
	chico.className = 'abs pix'; chico.style.cssText += `left:0;top:0;width:${mw}px;height:${mh}px`;
	const halo = document.createElement('canvas'); halo.width = cols; halo.height = rows;
	halo.className = 'abs'; halo.style.cssText += `left:0;top:0;width:${mw}px;height:${mh}px`;
	const rejilla = lienzo(mw, mh);
	matriz.appendChild(chico); matriz.appendChild(rejilla); matriz.appendChild(halo);
	const lz = Tab.lienzoPuntos(cols, rows);
	const imgD = chico.getContext('2d').createImageData(cols, rows), haloD = halo.getContext('2d').createImageData(cols, rows);
	let paleta = [], paletaHalo = [];
	function armarMatriz() {
		const st = ESTILOS[estilo], v = st.vidrio, ap = st.apagado, pr = st.punto;
		paleta = []; paletaHalo = [];
		for (let i = 0; i < 256; i++) {
			const t = i / 255, col = [0, 1, 2].map(k => { const ag = v[k] * (1 - ap[3]) + ap[k] * ap[3]; return Math.round(ag + (pr[k] - ag) * t); });
			paleta.push(col);
			paletaHalo.push(estilo ? [st.halo[0], st.halo[1], st.halo[2], Math.round(255 * st.halo[3] * t)] : [255, 250, 235, Math.round(255 * 0.55 * t)]);
		}
		const ctx = rejilla.ctx;
		ctx.clearRect(0, 0, mw, mh);
		ctx.fillStyle = rgb(v); ctx.fillRect(0, 0, mw, mh);
		for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) ctx.clearRect(x * kP, y * kP, 1.5, 1.5);
		halo.style.imageRendering = estilo ? 'pixelated' : 'auto';
		halo.style.transform = estilo ? 'translate(.5px,.5px)' : 'none';
		ventana.style.background = rgb(v);
		mostrarMatriz();
	}
	function mostrarMatriz() {
		const a = imgD.data, h = haloD.data, px = lz.px;
		for (let i = 0, j = 0; i < px.length; i++, j += 4) {
			const c1 = paleta[px[i]], c2 = paletaHalo[px[i]];
			a[j] = c1[0]; a[j + 1] = c1[1]; a[j + 2] = c1[2]; a[j + 3] = 255;
			h[j] = c2[0]; h[j + 1] = c2[1]; h[j + 2] = c2[2]; h[j + 3] = c2[3];
		}
		chico.getContext('2d').putImageData(imgD, 0, 0);
		halo.getContext('2d').putImageData(haloD, 0, 0);
	}
	function ponerEstilo(e) { estilo = e; guardado.poner('estiloDisplay', e); armarFondoFilas(); pintarFilas(true); armarMatriz(); pintarMenu(); }

	/* ---------- clima y despertador ---------- */
	let clima = null, climaPedido = 0;
	const DIAS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
	const cielo = c => c === 0 ? 'despejado' : c <= 2 ? 'algo nublado' : c === 3 ? 'nublado' : c <= 48 ? 'niebla' : c <= 57 ? 'llovizna' : c <= 67 ? 'lluvia' : c <= 77 ? 'nieve' : c <= 82 ? 'chaparrones' : c <= 86 ? 'nieve' : 'tormenta';
	function pedirClima() {
		const ahora = Date.now();
		if (clima && ahora - climaPedido < 20 * 60000) return;
		climaPedido = ahora;
		fetch('https://api.open-meteo.com/v1/forecast?latitude=-34.61&longitude=-58.38&current=temperature_2m,weather_code&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FArgentina%2FBuenos_Aires&forecast_days=6')
			.then(r => r.json()).then(j => {
				const cur = j.current, d = j.daily, h = j.hourly;
				if (!cur || !d) throw 0;
				const k = { hay: 1, temp: Math.round(cur.temperature_2m), max: Math.round(d.temperature_2m_max[0]), min: Math.round(d.temperature_2m_min[0]),
					codigo: cur.weather_code | 0, cielo: limpio(cielo(cur.weather_code | 0)).toUpperCase(), lluvia: [], hora0: 0, dias: [] };
				const ya = (cur.time || '').slice(0, 13);
				if (h && ya) { const i = h.time.findIndex(t => t.startsWith(ya)); if (i >= 0) { k.lluvia = h.precipitation_probability.slice(i, i + 24).map(v => v | 0); k.hora0 = parseInt(ya.slice(11), 10); } }
				for (let i = 1; i < d.time.length && k.dias.length < 4; i++) {
					const f = new Date(d.time[i] + 'T12:00:00');
					k.dias.push({ dia: DIAS[f.getDay()], codigo: d.weather_code[i] | 0, max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]), lluvia: (d.precipitation_probability_max || [])[i] | 0 });
				}
				clima = k; pintarDisplay(); pintarMenu();
			}).catch(() => { climaPedido = 0; });
	}
	const alarma = () => Object.assign({ on: false, h: 7, m: 0, b: radio.b, pos: radio.pos[radio.b], nombre: radio.actual()[0], ultima: '' }, guardado.leer('alarma', {}));
	function tocoDespertador(z) {
		const a = alarma();
		if (z === 'alarma') { a.on = !a.on; if (a.on) { a.b = radio.b; a.pos = radio.pos[radio.b]; a.nombre = radio.actual()[0]; } }
		else if (z === 'hora') a.h = (a.h + 1) % 24;
		else if (z === 'minutos') a.m = (a.m + 5) % 60;
		a.ultima = '';
		guardado.poner('alarma', a);
		if (a.on && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
		pintarMenu();
	}
	function vigilarDespertador() {
		const a = alarma(), d = new Date();
		if (!a.on || d.getHours() !== a.h || d.getMinutes() !== a.m) return;
		const hoy = d.toDateString();
		if (a.ultima === hoy) return;
		a.ultima = hoy; guardado.poner('alarma', a);
		if (a.b >= 0 && a.b < BANDAS.length && a.pos >= 0 && a.pos < BANDAS[a.b][1].length) { radio.b = a.b; radio.pos[a.b] = a.pos; guardarRadio(); pagina1.mostrar(); }
		if (radio.on) tocar(); else encender(true);
		mediaSesion(); radio.avisar();
		try { if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification('Radio B&O', { body: 'Despertador: ' + a.nombre, icon: 'icon-192.png' }); } catch (e) {}
	}
	function datosMenu() {
		const a = alarma();
		const k = clima || { hay: 0, lluvia: [], hora0: 0, dias: [] };
		return Object.assign({}, k, { alarma: a.on, alarmaH: a.h, alarmaM: a.m, alarmaRadio: limpio(a.on ? a.nombre : radio.actual()[0]).toUpperCase() });
	}
	function pintarMenu() {
		if (geometria) return;
		Tab.menu(lz, datosMenu(), performance.now() / 1000, oyMenu);
		mostrarMatriz();
	}
	/* filas fijas: arriba la banda, la radio y la frecuencia; abajo el día, la temperatura y la hora */
	function alinear(a, b) { const hueco = letras - a.length - b.length; return hueco < 1 ? (b ? a + ' ' + b : a) : a + ' '.repeat(hueco) + b; }
	function pintarDisplay() {
		const s = radio.actual(), fr = s[2] || '';
		let f1 = alinear(radio.banda() + ' ' + s[0], fr);
		if (f1.length > letras) f1 = alinear(radio.banda() + ' ' + s[0], fr.split(' ')[0]);
		let f2;
		if (radio.msg) f2 = radio.msg;
		else {
			const d = new Date(), hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
			f2 = alinear(DIAS[d.getDay()] + ' ' + d.getDate() + '  ' + (clima ? clima.temp + '°' : '--°'), hh);
		}
		ponerFila(0, f1); ponerFila(1, f2);
	}

	/* ---------- abrir y cerrar ---------- */
	function abrir() {
		if (abiertoDisp) return;
		abiertoDisp = true; geometria = false;
		pedirClima(); pintarMenu();
		ponerVentana(abierta, true);
		volumen.style.opacity = 0; volumen.style.pointerEvents = 'none';
		setTimeout(() => { if (abiertoDisp) plato.style.visibility = tornillos.style.visibility = 'hidden'; }, 420);
	}
	function cerrar() {
		if (!abiertoDisp) return;
		abiertoDisp = false; geometria = false;
		plato.style.visibility = tornillos.style.visibility = 'visible';
		ponerVentana(cerrada, true);
		volumen.style.opacity = 1; volumen.style.pointerEvents = '';
		pintarMenu();
	}
	const toque = div(p, 0, 0, 0, 0, 'z-index:5');
	ponerVentana(cerrada, false);
	pag.reserva.push((pg, x, y) => {
		if (pg !== 1) return false;
		const r = abiertoDisp ? abierta : cerrada;
		return x >= r.x - kMarco && x <= r.x + r.w + kMarco && y >= r.y - kMarco && y <= r.y + r.h + kMarco;
	});
	let td = null;
	toque.addEventListener('pointerdown', e => {
		if (td) return;
		const q = enEscenario(e);
		td = { id: e.pointerId, x: q.x, y: q.y, hecho: false, largo: setTimeout(() => { if (td && !td.hecho) { td.hecho = true; ponerEstilo((estilo + 1) % 3); if (navigator.vibrate) navigator.vibrate(20); } }, 700) };
		try { toque.setPointerCapture(e.pointerId); } catch (_) {}
	});
	toque.addEventListener('pointermove', e => {
		if (!td || e.pointerId !== td.id || td.hecho) return;
		const q = enEscenario(e), dx = q.x - td.x, dy = q.y - td.y;
		if (Math.abs(dy) > 22 && Math.abs(dy) > Math.abs(dx)) {
			td.hecho = true; clearTimeout(td.largo);
			if (dy > 0) abrir(); else cerrar();
		} else if (Math.hypot(dx, dy) > 10) clearTimeout(td.largo);
	});
	const finToque = e => {
		if (!td || e.pointerId !== td.id) return;
		clearTimeout(td.largo);
		const q = enEscenario(e), movio = Math.hypot(q.x - td.x, q.y - td.y) > 10, hecho = td.hecho;
		td = null;
		if (hecho || movio || e.type === 'pointercancel') return;
		if (!abiertoDisp) return abrir();
		if (geometria) { geometria = false; pintarMenu(); return; }
		const mx = q.x - abierta.x - 8, my = q.y - abierta.y - 72;
		if (my < 0) return cerrar();
		const z = Tab.zona(Math.floor(mx / kP), Math.floor(my / kP) - oyMenu);
		if (z === 'atomo') { geometria = true; geo = Tab.geoEmpezar((Math.random() * 4e9) >>> 0); Tab.borrar(lz); antes = 0; return; }
		if (z) tocoDespertador(z);
	};
	toque.addEventListener('pointerup', finToque);
	toque.addEventListener('pointercancel', finToque);

	/* ---------- cada cuadro: el plato, los vúmetros y el display grande ---------- */
	let antes = 0, ultimoMenu = 0, ultimoGeo = 0, antesPlato = 0;
	function cuadro(t) {
		const dt = antesPlato ? Math.min(0.1, (t - antesPlato) / 1000) : 0;
		antesPlato = t;
		const objetivo = radio.on ? 1 : 0;
		if (motor.vel !== objetivo) motor.vel = objetivo > motor.vel ? Math.min(1, motor.vel + dt / 3) : Math.max(0, motor.vel - dt / 3);
		motor.ang = (motor.ang + motor.vel * W33 * dt) % (2 * Math.PI);
		if (pag.actual === 1 && !document.hidden) {
			if (!abiertoDisp && motor.vel > 0) girar(motor.ang);
			const n = nivelAudio(); pintarVu(n[0], n[1]);
			if (abiertoDisp || cerrada.h > 100) {
				if (geometria) { if (t - ultimoGeo >= 32) { const d2 = antes ? Math.min(0.1, (t - antes) / 1000) : 1 / 30; antes = t; ultimoGeo = t; Tab.geoPaso(geo, lz, d2); mostrarMatriz(); } }
				else if (t - ultimoMenu >= 66) { ultimoMenu = t; pintarMenu(); }
			}
		}
		requestAnimationFrame(cuadro);
	}
	setInterval(() => guardado.poner('anguloPlato', motor.ang), 5000);
	function pintarLuz() {
		const e = radio.estadoLed(), col = e === 2 ? '#a942e9' : '#e85d2a';
		luz.style.background = e ? col : G(150, 150, 146);
		luz.style.boxShadow = e ? `0 0 4px 1px ${col}b3` : 'none';
	}
	radio.alCambiar.push(() => { pintarDisplay(); pintarLuz(); if (abiertoDisp && !geometria) pintarMenu(); });
	pag.alCambiar.push(pg => { if (pg !== 1) cerrar(); });

	return {
		empezar() {
			armarFondoFilas(); armarMatriz(); pintarDisplay(); pintarLuz();
			girar(motor.ang);
			pedirClima();
			setInterval(() => { pintarDisplay(); vigilarDespertador(); }, 1000);
			setInterval(pedirClima, 60000);
			requestAnimationFrame(cuadro);
		},
		mostrarVolumen,
	};
})();
