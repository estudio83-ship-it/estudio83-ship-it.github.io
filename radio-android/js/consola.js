/* Página 4: la consola de bolsillo. Arriba la pantalla de 160 x 144 puntos (cuatro verdes) de borde a borde; abajo la
   cruz, A, B, ELEGIR e INICIO. También se juega con un control conectado al teléfono (USB o Bluetooth). */
'use strict';
const GB_W = 160, GB_H = 144;
const B = { arriba: 1, abajo: 2, izq: 4, der: 8, A: 16, B: 32, inicio: 64, elegir: 128 };
const VERDES = [[0x9b, 0xbc, 0x0f], [0x8b, 0xac, 0x0f], [0x30, 0x62, 0x30], [0x0f, 0x38, 0x0f]];

/* dibujo en la pantalla de la consola (px = Uint8Array de 160 x 144, tonos 0 claro a 3 oscuro) */
function gbPunto(px, x, y, t) { if (x >= 0 && y >= 0 && x < GB_W && y < GB_H) px[y * GB_W + x] = t; }
function gbCaja(px, x, y, w, h, t) {
	for (let f = Math.max(0, y); f < Math.min(GB_H, y + h); f++) for (let c = Math.max(0, x); c < Math.min(GB_W, x + w); c++) px[f * GB_W + c] = t;
}
function gbTexto(px, t, x, y, tono) {
	for (let i = 0; i < t.length; i++) {
		let ch = t.charCodeAt(i); if (ch < 0x20 || ch > 0x7f) ch = 0x20;
		for (let c = 0; c < 5; c++) for (let f = 0; f < 7; f++) if (PIX[ch - 0x20][c] >> f & 1) gbPunto(px, x + i * 6 + c, y + f, tono);
	}
}
function gbTexto8(px, t, x, y, tono) {
	for (let i = 0; i < t.length; i++) {
		let ch = t.charCodeAt(i); if (ch < 0x20 || ch > 0x7f) ch = 0x20;
		for (let c = 0; c < 5; c++) for (let f = 0; f < 7; f++) if (PIX[ch - 0x20][c] >> f & 1) { gbPunto(px, x + i * 8 + c, y + f, tono); gbPunto(px, x + i * 8 + c + 1, y + f, tono); }
	}
}
const gbCentrado = (px, t, y, tono) => gbTexto(px, t, (GB_W - t.length * 6 + 1) >> 1, y, tono);
const gbCentrado8 = (px, t, y, tono) => gbTexto8(px, t, (GB_W - t.length * 8 + 2) >> 1, y, tono);
function gbDibujo(px, d, x, y, espejo) {
	for (let f = 0; f < d.length; f++) {
		const w = d[f].length;
		for (let c = 0; c < w; c++) { const k = d[f][espejo ? w - 1 - c : c]; if (k >= '0' && k <= '3') gbPunto(px, x + c, y + f, k.charCodeAt(0) - 48); }
	}
}

const consola = (() => {
	const p = pag.elementos[3];
	const W = 320, H = S.H, PUNTO = 2;
	const pantalla = { x: 0, y: 0, w: GB_W * PUNTO, h: GB_H * PUNTO };
	const arriba = pantalla.h, alto = H - arriba;
	const cruz = { x: 80, y: Math.round(arriba + alto * 0.49) }, bA = { x: W - 50, y: Math.round(arriba + alto * 0.37) }, bB = { x: W - 110, y: Math.round(arriba + alto * 0.53) };
	const elegir = { x: W / 2 - 34, y: H - 40 }, inicio = { x: W / 2 + 20, y: H - 40 };

	function cruzCamino(ctx, c, largo, ancho, r) {
		const l = largo / 2, a = ancho / 2;
		const v = [[-a, -l], [a, -l], [a, -a], [l, -a], [l, a], [a, a], [a, l], [-a, l], [-a, a], [-l, a], [-l, -a], [-a, -a]];
		ctx.beginPath();
		for (let i = 0; i < 12; i++) {
			const q = v[i], prev = v[(i + 11) % 12], next = v[(i + 1) % 12];
			const rr = (i === 2 || i === 5 || i === 8 || i === 11) ? 0 : r;
			const d1 = [prev[0] - q[0], prev[1] - q[1]], d2 = [next[0] - q[0], next[1] - q[1]];
			const n1 = Math.hypot(...d1), n2 = Math.hypot(...d2);
			const p1 = [c.x + q[0] + d1[0] / n1 * rr, c.y + q[1] + d1[1] / n1 * rr], p2 = [c.x + q[0] + d2[0] / n2 * rr, c.y + q[1] + d2[1] / n2 * rr];
			if (i === 0) ctx.moveTo(...p1); else ctx.lineTo(...p1);
			ctx.quadraticCurveTo(c.x + q[0], c.y + q[1], ...p2);
		}
		ctx.closePath();
	}
	const sombra = (ctx, dy, blur, col) => { ctx.shadowColor = col; ctx.shadowOffsetY = dy * S.R; ctx.shadowBlur = blur * S.R; };
	/* el plástico, la cruz hundida, A y B bordó y ELEGIR / INICIO de goma */
	const frente = lienzo(W, H, p);
	(ctx => {
		ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, arriba);
		ctx.save(); ctx.beginPath(); ctx.rect(0, arriba, W, H - arriba); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgb(224,222,217)', 'rgb(205,203,197)'], 0, arriba, W * 0.25, H); ctx.fillRect(0, arriba, W, H);
		let s = 7;
		const az = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s >>> 16; };
		for (let i = 0; i < 9000; i++) { const x = (az() % 6400) / 20, y = arriba + (az() % 3440) / 20 * (H - arriba) / 172; ctx.fillStyle = az() & 1 ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.05)'; ctx.fillRect(x, y, 0.5, 0.5); }
		ctx.restore();
		ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, arriba, W, 0.5);
		ctx.fillStyle = degrade(ctx, ['rgba(0,0,0,.16)', 'rgba(0,0,0,0)'], 0, arriba + 0.5, 0, arriba + 8); ctx.fillRect(0, arriba + 0.5, W, 7.5);
		const largo = 88, ancho = 28;
		ctx.save(); cruzCamino(ctx, cruz, largo + 8, ancho + 8, 6); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgba(0,0,0,.2)', 'rgba(0,0,0,.06)'], 0, cruz.y - largo / 2, 0, cruz.y + largo / 2); ctx.fillRect(0, 0, W, H); ctx.restore();
		ctx.save(); ctx.translate(0, 0.6); cruzCamino(ctx, cruz, largo + 8, ancho + 8, 6); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.7; ctx.stroke(); ctx.restore();
		ctx.fillStyle = 'rgba(0,0,0,.16)';
		for (let i = 0; i < 4; i++) {
			const a = i * Math.PI / 2, d = largo / 2 + 11, q = { x: cruz.x + d * Math.cos(a), y: cruz.y + d * Math.sin(a) };
			ctx.beginPath(); ctx.moveTo(q.x + 3 * Math.cos(a), q.y + 3 * Math.sin(a)); ctx.lineTo(q.x + 3 * Math.cos(a + 2.3), q.y + 3 * Math.sin(a + 2.3)); ctx.lineTo(q.x + 3 * Math.cos(a - 2.3), q.y + 3 * Math.sin(a - 2.3)); ctx.fill();
		}
		ctx.save(); sombra(ctx, 2.5, 4, 'rgba(0,0,0,.55)'); ctx.fillStyle = G(0x30, 0x33, 0x3d); cruzCamino(ctx, cruz, largo, ancho, 3.5); ctx.fill(); ctx.restore();
		ctx.save(); cruzCamino(ctx, cruz, largo, ancho, 3.5); ctx.clip();
		const rg = ctx.createRadialGradient(cruz.x - 10, cruz.y - 12, 0, cruz.x - 10, cruz.y - 12, largo * 0.6); rg.addColorStop(0, 'rgba(255,255,255,.10)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
		ctx.fillStyle = degrade(ctx, ['rgba(0,0,0,0)', 'rgba(0,0,0,.28)'], 0, cruz.y, 0, cruz.y + largo / 2); ctx.fillRect(0, 0, W, H);
		ctx.translate(0, 1); cruzCamino(ctx, cruz, largo - 1, ancho - 1, 3); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 0.8; ctx.stroke();
		ctx.restore();
		for (let i = 0; i < 4; i++) {
			const a = i * Math.PI / 2, d = largo / 2 - 10, q = { x: cruz.x + d * Math.cos(a), y: cruz.y + d * Math.sin(a) };
			for (let k = 0; k < 2; k++) {
				const dy = k ? 0 : 0.7;
				ctx.fillStyle = k ? G(0x1e, 0x20, 0x27) : 'rgba(255,255,255,.14)';
				ctx.beginPath(); ctx.moveTo(q.x + 4 * Math.cos(a), q.y + 4 * Math.sin(a) + dy); ctx.lineTo(q.x + 4 * Math.cos(a + 2.3), q.y + 4 * Math.sin(a + 2.3) + dy); ctx.lineTo(q.x + 4 * Math.cos(a - 2.3), q.y + 4 * Math.sin(a - 2.3) + dy); ctx.fill();
			}
		}
		ctx.save(); ctx.beginPath(); ctx.arc(cruz.x, cruz.y, 8, 0, 7); ctx.clip();
		ctx.fillStyle = degrade(ctx, ['rgba(0,0,0,.35)', 'rgba(255,255,255,.12)'], 0, cruz.y - 8, 0, cruz.y + 8); ctx.fillRect(cruz.x - 8, cruz.y - 8, 16, 16); ctx.restore();
		const azul = G(0x2b, 0x36, 0x9c), rb = 20;
		[bA, bB].forEach((c, i) => {
			ctx.save(); ctx.beginPath(); ctx.arc(c.x, c.y, rb + 4, 0, 7); ctx.clip();
			ctx.fillStyle = degrade(ctx, ['rgba(0,0,0,.18)', 'rgba(0,0,0,.05)'], 0, c.y - rb - 4, 0, c.y + rb + 4); ctx.fillRect(0, 0, W, H); ctx.restore();
			ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(c.x, c.y + 0.6, rb + 4, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
			ctx.save(); sombra(ctx, 2.5, 3.5, 'rgba(0,0,0,.5)'); ctx.fillStyle = G(0xa8, 0x22, 0x60); ctx.beginPath(); ctx.arc(c.x, c.y, rb, 0, 7); ctx.fill(); ctx.restore();
			ctx.save(); ctx.beginPath(); ctx.arc(c.x, c.y, rb, 0, 7); ctx.clip();
			ctx.fillStyle = degrade(ctx, ['rgba(0,0,0,0)', 'rgba(0,0,0,.3)'], 0, c.y - rb * 0.2, 0, c.y + rb); ctx.fillRect(0, 0, W, H);
			const br = ctx.createRadialGradient(c.x - rb * .35, c.y - rb * .45, 0, c.x - rb * .35, c.y - rb * .45, rb * .9); br.addColorStop(0, 'rgba(255,255,255,.38)'); br.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.fillStyle = br; ctx.fillRect(0, 0, W, H); ctx.restore();
			ctx.strokeStyle = 'rgba(110,16,60,.8)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(c.x, c.y, rb - 0.3, 0, 7); ctx.stroke();
			ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(c.x - rb * .34, c.y - rb * .56, rb * .21, rb * .12, 0, 0, 7); ctx.fill();
			ctx.fillStyle = azul; ctx.font = 'italic bold 13px "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif'; ctx.textBaseline = 'top';
			ctx.fillText(i ? 'B' : 'A', c.x + rb * 0.35, c.y + rb + 5);
		});
		[elegir, inicio].forEach((c, i) => {
			ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(-0.44);
			const pil = (x, y, w, h) => { ctx.beginPath(); ctx.moveTo(x + h / 2, y); ctx.arcTo(x + w, y, x + w, y + h, h / 2); ctx.arcTo(x + w, y + h, x, y + h, h / 2); ctx.arcTo(x, y + h, x, y, h / 2); ctx.arcTo(x, y, x + w, y, h / 2); ctx.closePath(); };
			ctx.save(); pil(-22, -7.5, 44, 15); ctx.clip(); ctx.fillStyle = degrade(ctx, ['rgba(0,0,0,.16)', 'rgba(0,0,0,.04)'], 0, -7.5, 0, 7.5); ctx.fillRect(-30, -10, 60, 20); ctx.restore();
			ctx.save(); ctx.translate(0, 0.6); pil(-22, -7.5, 44, 15); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 0.6; ctx.stroke(); ctx.restore();
			ctx.save(); sombra(ctx, 1.5, 2, 'rgba(0,0,0,.45)'); ctx.fillStyle = G(0x96, 0x97, 0x9e); pil(-17, -4.5, 34, 9); ctx.fill(); ctx.restore();
			ctx.save(); pil(-17, -4.5, 34, 9); ctx.clip(); ctx.fillStyle = degrade(ctx, ['rgba(255,255,255,.3)', 'rgba(0,0,0,.12)'], 0, -4.5, 0, 4.5); ctx.fillRect(-20, -6, 40, 12); ctx.restore();
			ctx.fillStyle = azul; ctx.font = 'italic bold 8.5px "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
			ctx.fillText(i ? 'INICIO' : 'ELEGIR', 0, 9);
			ctx.restore();
		});
	})(frente.ctx);

	/* la pantalla: un pixel por punto, agrandado sin suavizar, con la rejilla del LCD encima */
	const luces = document.createElement('canvas'); luces.width = GB_W; luces.height = GB_H;
	luces.className = 'abs pix'; luces.style.cssText += `left:0;top:0;width:${pantalla.w}px;height:${pantalla.h}px`;
	p.appendChild(luces);
	const rej = lienzo(pantalla.w, pantalla.h, p, 0, 0);
	(ctx => {
		ctx.fillStyle = 'rgba(15,56,15,.14)';
		const q = 1 / S.R;
		for (let x = 1; x < GB_W; x++) ctx.fillRect(x * PUNTO - q, 0, q, pantalla.h);
		for (let y = 1; y < GB_H; y++) ctx.fillRect(0, y * PUNTO - q, pantalla.w, q);
	})(rej.ctx);
	const lctx = luces.getContext('2d'), datos = lctx.createImageData(GB_W, GB_H), px = new Uint8Array(GB_W * GB_H);

	/* las sombritas de "apretado" */
	const marca = (x, y, w, h, redonda, rot) => div(p, x, y, w, h, `background:rgba(0,0,0,.28);border-radius:${redonda ? '50%' : '3px'};display:none;pointer-events:none;${rot ? 'transform:rotate(-0.44rad)' : ''}`);
	const marcas = [
		[B.arriba, marca(cruz.x - 14, cruz.y - 44, 28, 30)], [B.abajo, marca(cruz.x - 14, cruz.y + 14, 28, 30)],
		[B.izq, marca(cruz.x - 44, cruz.y - 14, 30, 28)], [B.der, marca(cruz.x + 14, cruz.y - 14, 30, 28)],
		[B.A, marca(bA.x - 20, bA.y - 20, 40, 40, true)], [B.B, marca(bB.x - 20, bB.y - 20, 40, 40, true)],
		[B.elegir, marca(elegir.x - 17, elegir.y - 4.5, 34, 9, false, true)], [B.inicio, marca(inicio.x - 17, inicio.y - 4.5, 34, 9, false, true)],
	];
	function botonesEn(q) {
		const dx = q.x - cruz.x, dy = q.y - cruz.y;
		if (Math.hypot(dx, dy) < 60) {
			let b = 0;
			if (Math.abs(dx) > 9 && Math.abs(dx) >= Math.abs(dy) * 0.45) b |= dx > 0 ? B.der : B.izq;
			if (Math.abs(dy) > 9 && Math.abs(dy) >= Math.abs(dx) * 0.45) b |= dy > 0 ? B.abajo : B.arriba;
			return b;
		}
		const da = Math.hypot(q.x - bA.x, q.y - bA.y), db = Math.hypot(q.x - bB.x, q.y - bB.y);
		if (Math.min(da, db) < 34) return da < db ? B.A : B.B;
		if (Math.hypot(q.x - elegir.x, q.y - elegir.y) < 24) return B.elegir;
		if (Math.hypot(q.x - inicio.x, q.y - inicio.y) < 24) return B.inicio;
		return 0;
	}
	const tomaToque = q => botonesEn(q) !== 0 || Math.hypot(q.x - cruz.x, q.y - cruz.y) < 60;
	pag.reserva.push((pg, x, y) => pg === 3 && tomaToque({ x, y }));
	const dedos = new Map();
	let apretados = 0, sueltos = 0, sueltosMando = 0, antes = 0;
	function botones() {
		let b = 0; for (const v of dedos.values()) b |= v;
		sueltos |= b & ~apretados;
		apretados = b;
		for (const [k, m] of marcas) m.style.display = b & k ? 'block' : 'none';
	}
	const dedo = e => { if (pag.actual !== 3 || fuePagina()) return; const q = enEscenario(e), b = botonesEn(q); if (b || dedos.has(e.pointerId)) { dedos.set(e.pointerId, b); botones(); } };
	p.addEventListener('pointerdown', e => { const q = enEscenario(e); if (tomaToque(q)) { try { p.setPointerCapture(e.pointerId); } catch (_) {} } dedo(e); });
	p.addEventListener('pointermove', e => { if (dedos.has(e.pointerId)) dedo(e); });
	const soltar = e => { if (dedos.delete(e.pointerId)) botones(); };
	p.addEventListener('pointerup', soltar); p.addEventListener('pointercancel', soltar);

	/* ---------- menú y programas ---------- */
	const NOMBRES = ['SALTARIN', 'BLOQUES', 'CAMARA', 'CONTROL'];
	const ICONOS = [
		['     3333     ', '    300003    ', '   30030303   ', '   30030303   ', '   30000003   ', '   32000023   ', '    322223    ', '     3333     ', '    33  33    ', '              ', '33333333333333', '21212121212121'],
		['              ', '  3333        ', '  3113        ', '  33333333    ', '  31131113    ', '  33333333    ', '              ', '3333333333  33', '3113113113  31', '3333333333  33', '              ', '              '],
		['              ', '   33         ', ' 333333333333 ', ' 300000000003 ', ' 300033330003 ', ' 300311113003 ', ' 300311113003 ', ' 300033330003 ', ' 300000000003 ', ' 333333333333 ', '              ', '              '],
		['              ', '  33333333333 ', ' 3000000000003', '30030000003003', '30333000030303', '30030000003003', '30000033000003', '3000033330000 3', ' 3003    3003 ', '  33      33  ', '              ', '              '],
	];
	let enMenu = true, elegido = 0, tic = 0, programa = null, activo = false;
	const PROGRAMAS = [() => new Saltarin(), () => new BloquesGB(), () => new Camara(), () => new PruebaControl()];
	function pintarMenu() {
		px.fill(0);
		gbCaja(px, 0, 0, GB_W, 22, 3);
		gbCentrado8(px, 'MAQUINITA', 4, 0);
		gbCaja(px, 0, 22, GB_W, 1, 2);
		for (let i = 0; i < 4; i++) {
			const y = 32 + i * 23;
			if (i === elegido) { gbCaja(px, 12, y - 5, GB_W - 24, 22, 1); if (((tic / 20) | 0) % 2 === 0) gbTexto(px, '>', 16, y + 2, 3); }
			gbDibujo(px, ICONOS[i], 26, y, false);
			gbTexto(px, NOMBRES[i], 48, y + 2, 3);
		}
		gbCaja(px, 0, GB_H - 18, GB_W, 1, 2);
		gbCentrado(px, 'A: JUGAR  ELEGIR: MENU', GB_H - 12, 2);
	}
	function pintar() {
		if (enMenu) pintarMenu(); else { px.fill(0); programa.dibujar(px); }
		const d = datos.data;
		for (let i = 0, j = 0; i < px.length; i++, j += 4) { const c = VERDES[px[i] & 3]; d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255; }
		lctx.putImageData(datos, 0, 0);
	}
	let ultimo = 0, sobra = 0;
	function cuadro(t) {
		if (!activo) return;
		requestAnimationFrame(cuadro);
		/* 60 pasos por segundo, aunque la pantalla vaya a 90 o 120 */
		sobra += ultimo ? Math.min(100, t - ultimo) : 16.7; ultimo = t;
		let pasos = 0;
		while (sobra >= 16.6 && pasos < 4) { sobra -= 16.6; pasos++; paso(); }
		if (pasos) pintar();
	}
	function paso() {
		tic++;
		const ahora = apretados | mando.botones8();
		const nuevos = (ahora & ~antes) | sueltos | sueltosMando;
		sueltos = sueltosMando = 0; antes = ahora;
		if (enMenu) {
			if (nuevos & B.arriba) elegido = (elegido + 3) % 4;
			if (nuevos & B.abajo) elegido = (elegido + 1) % 4;
			if (nuevos & (B.A | B.inicio)) { programa = PROGRAMAS[elegido](); programa.empezar(); enMenu = false; }
		} else if (nuevos & B.elegir) { programa.terminar(); programa = null; enMenu = true; }
		else programa.paso(ahora, nuevos);
	}
	function ponerActivo(si) {
		if (si === activo) return;
		activo = si;
		if (si) { ultimo = 0; sobra = 0; if (programa && programa.reanudar) programa.reanudar(); requestAnimationFrame(cuadro); }
		else { if (programa && programa.pausar) programa.pausar(); dedos.clear(); botones(); }
	}
	pag.alCambiar.push(pg => ponerActivo(pg === 3 && !document.hidden));
	document.addEventListener('visibilitychange', () => ponerActivo(pag.actual === 3 && !document.hidden));
	return {
		empezar() { pintar(); ponerActivo(pag.actual === 3); },
		mandoApreto(n) { sueltosMando |= n; },
	};
})();
