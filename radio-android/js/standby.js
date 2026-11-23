/* 1.44: el reloj negro (esfera negra, números grandes, agujas blancas con el caño finito al centro y el segundero
   naranja que barre) y la vista horizontal de la página 3: el reloj a la izquierda y el mes a la derecha. */
'use strict';
const NARANJA = '#f29d38';
const LETRA = '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif';

function relojNegro(ctx, cx, cy, R, d) {
	ctx.save();
	ctx.translate(cx, cy);
	ctx.fillStyle = '#000';
	ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
	/* las rayitas: 60, más largas y claras en las horas */
	for (let i = 0; i < 60; i++) {
		const hora = i % 5 === 0, a = i * Math.PI / 30, l = hora ? R * 0.075 : R * 0.045;
		ctx.strokeStyle = hora ? '#d6d6da' : '#6c6c70';
		ctx.lineWidth = hora ? R * 0.016 : R * 0.009;
		ctx.lineCap = 'butt';
		ctx.beginPath();
		ctx.moveTo(Math.sin(a) * (R * 0.97 - l), -Math.cos(a) * (R * 0.97 - l));
		ctx.lineTo(Math.sin(a) * R * 0.97, -Math.cos(a) * R * 0.97);
		ctx.stroke();
	}
	/* los números grandes */
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
	ctx.font = `500 ${Math.round(R * 0.25)}px ${LETRA}`;
	for (let h = 1; h <= 12; h++) {
		const a = h * Math.PI / 6, r = R * 0.71;
		ctx.fillText(String(h), Math.sin(a) * r, -Math.cos(a) * r + R * 0.012);
	}
	const s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, hh = (d.getHours() % 12) + m / 60;
	/* las agujas: un caño finito desde el centro y después la barra redondeada */
	function aguja(ang, largo, ancho) {
		ctx.save();
		ctx.rotate(ang);
		ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = R * 0.03;
		ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
		ctx.lineWidth = R * 0.022;
		ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -R * 0.12); ctx.stroke();
		ctx.lineWidth = ancho;
		ctx.beginPath(); ctx.moveTo(0, -R * 0.12); ctx.lineTo(0, -largo); ctx.stroke();
		ctx.restore();
	}
	aguja(hh / 12 * 2 * Math.PI, R * 0.52, R * 0.062);
	aguja(m / 60 * 2 * Math.PI, R * 0.86, R * 0.052);
	ctx.fillStyle = '#fff';
	ctx.beginPath(); ctx.arc(0, 0, R * 0.04, 0, 7); ctx.fill();
	/* el segundero naranja, con su colita, y el centro: anillo naranja y punto negro */
	ctx.save();
	ctx.rotate(s / 60 * 2 * Math.PI);
	ctx.strokeStyle = NARANJA; ctx.lineWidth = R * 0.011; ctx.lineCap = 'butt';
	ctx.beginPath(); ctx.moveTo(0, R * 0.18); ctx.lineTo(0, -R * 0.95); ctx.stroke();
	ctx.restore();
	ctx.fillStyle = NARANJA;
	ctx.beginPath(); ctx.arc(0, 0, R * 0.027, 0, 7); ctx.fill();
	ctx.fillStyle = '#000';
	ctx.beginPath(); ctx.arc(0, 0, R * 0.011, 0, 7); ctx.fill();
	ctx.restore();
}

/* el mes, como una hoja: el nombre en rojo, los días de la semana y hoy en un círculo rojo; sábado y domingo en gris */
const MESES_LARGOS = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
function calendarioNegro(ctx, x, y, w, h, d) {
	const col = w / 7, fila = h / 8, rojo = '#ff453a', gris = '#8e8e93';
	ctx.save();
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.fillStyle = rojo; ctx.font = `600 ${Math.round(fila * 0.62)}px ${LETRA}`;
	ctx.fillText(MESES_LARGOS[d.getMonth()], x + col * 0.08, y + fila * 0.5);
	ctx.textAlign = 'center';
	ctx.font = `600 ${Math.round(fila * 0.5)}px ${LETRA}`;
	'LMMJVSD'.split('').forEach((l, i) => { ctx.fillStyle = i >= 5 ? gris : '#fff'; ctx.fillText(l, x + col * (i + 0.5), y + fila * 1.5); });
	const a = d.getFullYear(), m = d.getMonth(), hoy = d.getDate();
	const primero = (new Date(a, m, 1).getDay() + 6) % 7, dias = new Date(a, m + 1, 0).getDate();
	ctx.font = `500 ${Math.round(fila * 0.5)}px ${LETRA}`;
	for (let n = 1; n <= dias; n++) {
		const k = primero + n - 1, cx = x + col * (k % 7 + 0.5), cy = y + fila * (2.5 + Math.floor(k / 7));
		if (n === hoy) { ctx.fillStyle = rojo; ctx.beginPath(); ctx.arc(cx, cy, fila * 0.42, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; }
		else ctx.fillStyle = k % 7 >= 5 ? gris : '#fff';
		ctx.fillText(String(n), cx, cy + fila * 0.02);
	}
	ctx.restore();
}

/* la vista horizontal: tapa todo mientras el teléfono está acostado en la página 3 */
const horizontal = (() => {
	const el = document.createElement('canvas');
	el.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;background:#000;z-index:100;display:none;touch-action:none';
	document.body.appendChild(el);
	const ctx = el.getContext('2d');
	let activa = false, w = 0, h = 0;
	function cuadro() {
		if (!activa) return;
		requestAnimationFrame(cuadro);
		const r = devicePixelRatio || 1, W = innerWidth, H = innerHeight;
		if (W !== w || H !== h) { w = W; h = H; el.width = Math.round(W * r); el.height = Math.round(H * r); }
		ctx.setTransform(r, 0, 0, r, 0, 0);
		ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
		const d = new Date(), R = Math.min(H * 0.44, W * 0.23);
		relojNegro(ctx, W * 0.27, H / 2, R, d);
		const cw = Math.min(W * 0.4, H * 1.0), ch = Math.min(H * 0.84, cw * 1.05);
		calendarioNegro(ctx, W * 0.53, (H - ch) / 2, cw, ch, d);
	}
	function revisar() {
		const si = innerWidth > innerHeight && pag.actual === 2;
		if (si === activa) return;
		activa = si;
		el.style.display = si ? 'block' : 'none';
		if (si) requestAnimationFrame(cuadro);
	}
	addEventListener('resize', revisar);
	pag.alCambiar.push(revisar);
	return { revisar };
})();
