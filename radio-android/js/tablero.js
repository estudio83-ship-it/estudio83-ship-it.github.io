/* Lo que se dibuja en el display grande de la página 2: el menú (clima, lluvia, pronóstico, despertador y el átomo) y
   las geometrías. Es Tablero.c de la app del iPhone pasado a JavaScript: un lienzo es una grilla de puntos con un
   brillo de 0 (apagado) a 255. */
'use strict';
const Tab = (() => {
	const lienzoPuntos = (ancho, alto) => ({ ancho, alto, px: new Uint8Array(ancho * alto) });
	function punto(l, x, y, b) {
		if (x < 0 || y < 0 || x >= l.ancho || y >= l.alto) return;
		const i = y * l.ancho + x;
		if (l.px[i] < b) l.px[i] = b;
	}
	function apagar(l, x, y) { if (x >= 0 && y >= 0 && x < l.ancho && y < l.alto) l.px[y * l.ancho + x] = 0; }
	const borrar = l => l.px.fill(0);
	const ancho = (t, e) => t.length ? (t.length * 6 - 1) * e : 0;
	function texto(l, t, x, y, e, br) {
		for (const ch0 of t) {
			let ch = ch0.charCodeAt(0);
			if (ch === 0xB0) ch = 0x7f;
			if (ch >= 0x20 && ch <= 0x7f)
				for (let cx = 0; cx < 5; cx++) for (let cy = 0; cy < 7; cy++)
					if (PIX[ch - 0x20][cx] >> cy & 1)
						for (let a = 0; a < e; a++) for (let b = 0; b < e; b++) {
							if (br) punto(l, x + cx * e + a, y + cy * e + b, br);
							else apagar(l, x + cx * e + a, y + cy * e + b);
						}
			x += 6 * e;
		}
	}
	const derecha = (l, t, xFin, y, e) => texto(l, t, xFin - ancho(t, e), y, e, 255);
	const centrado = (l, t, xm, y) => texto(l, t, xm - (ancho(t, 1) >> 1), y, 1, 255);
	function linea(l, x0, y0, x1, y1, b) {
		const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
		let e = dx + dy, n = 0;
		for (;;) {
			punto(l, x0, y0, b);
			if ((x0 === x1 && y0 === y1) || ++n > 2000) break;
			const e2 = 2 * e;
			if (e2 >= dy) { e += dy; x0 += sx; }
			if (e2 <= dx) { e += dx; y0 += sy; }
		}
	}
	const punteada = (l, y, x0, x1) => { for (let x = x0; x <= x1; x += 2) punto(l, x, y, 255); };

	/* íconos del tiempo (15 x 15) */
	const SOL = ['.......#.......', '.......#.......', '..#.........#..', '...#.......#...', '......###......', '.....#####.....', '....#######....', '##..#######..##',
		'....#######....', '.....#####.....', '......###......', '...#.......#...', '..#.........#..', '.......#.......', '.......#.......'];
	const NUBE = ['.....####......', '....#....#.....', '..###.....#....', '.#.........##..', '#............#.', '#............#.', '#............#.', '.############..'];
	const SOL_CHICO = ['..#.#.#', '...###.', '..#####', '#.#####', '..#####', '...###.', '..#.#.#'];
	function dibujo(l, d, x, y, e) {
		d.forEach((fila, f) => { for (let c = 0; c < fila.length; c++) if (fila[c] === '#') for (let a = 0; a < e; a++) for (let b = 0; b < e; b++) punto(l, x + c * e + a, y + f * e + b, 255); });
	}
	function nube(l, x, y, e) {
		NUBE.forEach((s, f) => {
			const a = s.indexOf('#'), b = s.lastIndexOf('#');
			for (let c = a; c <= b; c++) for (let i = 0; i < e; i++) for (let j = 0; j < e; j++) apagar(l, x + c * e + i, y + f * e + j);
		});
		dibujo(l, NUBE, x, y, e);
	}
	function tipo(c) {
		if (c <= 1) return 0; if (c === 2) return 1; if (c === 3) return 2; if (c <= 48) return 3; if (c <= 57) return 4;
		if (c <= 67 || (c >= 80 && c <= 82)) return 5; if (c <= 77 || c === 85 || c === 86) return 6; return 7;
	}
	function icono(l, codigo, x, y, e) {
		const k = tipo(codigo);
		if (k === 0) return dibujo(l, SOL, x, y, e);
		if (k === 1) { dibujo(l, SOL_CHICO, x + 7 * e, y + e, e); return nube(l, x, y + 6 * e, e); }
		if (k === 2) return nube(l, x + e, y + 4 * e, e);
		if (k === 3) {
			for (let f = 0; f < 4; f++) for (let c = 0; c < 15; c++) if ((c + f * 3) % 7 < 5)
				for (let a = 0; a < e; a++) for (let b = 0; b < e; b++) punto(l, x + c * e + a, y + (3 + f * 3) * e + b, 255);
			return;
		}
		nube(l, x, y + e, e);
		const y0 = y + 10 * e;
		for (let i = 0; i < 4; i++) {
			const cx = x + (2 + i * 3) * e;
			for (let a = 0; a < e; a++) for (let b = 0; b < e; b++) {
				if (k === 4) punto(l, cx + a, y0 + (i & 1) * 2 * e + b, 255);
				else if (k === 5) for (let s = 0; s < 3; s++) punto(l, cx - s * e + a + e, y0 + s * e + b + (i & 1) * e, 255);
				else if (k === 6) { punto(l, cx + a, y0 + (i & 1) * 2 * e + b, 255); punto(l, cx + a - e, y0 + (i & 1) * 2 * e + b + 2 * e, 255); }
			}
		}
		if (k === 7) dibujo(l, ['...##', '..##.', '.####', '..##.', '.#...'], x + 5 * e, y0, e);
	}
	function gota(l, x, y) {
		punto(l, x + 1, y, 255); punto(l, x + 1, y + 1, 255);
		for (let i = 0; i < 3; i++) { punto(l, x + i, y + 2, 255); punto(l, x + i, y + 3, 255); }
		punto(l, x + 1, y + 4, 255);
	}
	function elipse(l, cx, cy, a, b, giro, br) {
		const c = Math.cos(giro), s = Math.sin(giro);
		for (let i = 0; i < 160; i++) {
			const u = i * 2 * Math.PI / 160, x = a * Math.cos(u), y = b * Math.sin(u);
			punto(l, Math.round(cx + x * c - y * s), Math.round(cy + x * s + y * c), br);
		}
	}
	function atomo(l, cx, cy, t) {
		for (let k = 0; k < 3; k++) elipse(l, cx, cy, 14, 5, k * Math.PI / 3, 255);
		for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) punto(l, cx + a, cy + b, 255);
		for (let k = 0; k < 3; k++) {
			const u = t * 2.2 + k * 2.1, g = k * Math.PI / 3, x = 14 * Math.cos(u), y = 5 * Math.sin(u);
			const ex = Math.round(cx + x * Math.cos(g) - y * Math.sin(g)), ey = Math.round(cy + x * Math.sin(g) + y * Math.cos(g));
			for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (Math.abs(a) + Math.abs(b) < 2) punto(l, ex + a, ey + b, 255);
		}
	}
	const dos = n => String(n).padStart(2, '0');

	/* el menú entero en 140 x 140 puntos, desde la fila oy del lienzo */
	function menu(l, c, t, oy = 0) {
		borrar(l);
		const W = l.ancho, Y = y => y + oy;
		if (c.hay) {
			icono(l, c.codigo, 0, Y(0), 2);
			texto(l, c.temp + '\xb0', 36, Y(1), 2, 255);
			texto(l, c.cielo, 36, Y(20), 1, 255);
			derecha(l, 'MAX ' + c.max + '\xb0', W, Y(1), 1);
			derecha(l, 'MIN ' + c.min + '\xb0', W, Y(10), 1);
		} else {
			texto(l, 'BUSCANDO', 0, Y(6), 1, 255);
			texto(l, 'EL CLIMA...', 0, Y(16), 1, 255);
		}
		texto(l, 'LLUVIA PROXIMAS 24 HS', 0, Y(33), 1, 255);
		const base = Y(56);
		for (let h = 0; h < 24; h++) {
			const x = 10 + h * 5, alto = c.hay ? Math.floor(((c.lluvia[h] || 0) * 14 + 50) / 100) : 0;
			for (let i = 0; i < 4; i++) { punto(l, x + i, base, 255); for (let y = 1; y < alto; y++) punto(l, x + i, base - y, 255); }
		}
		for (let y = 0; y <= 14; y += 2) if (y % 7 === 0) punto(l, 7, base - y, 255);
		texto(l, '%', 0, Y(43), 1, 255);
		for (let h = 0; h < 24; h += 6) texto(l, dos((c.hora0 + h) % 24), 10 + h * 5, Y(59), 1, 255);
		punteada(l, Y(69), 0, W - 1);
		const n = c.hay ? c.dias.length : 0, col = Math.floor(W / 4);
		for (let d = 0; d < n && d < 4; d++) {
			const m = d * col + (col >> 1), k = c.dias[d];
			centrado(l, k.dia, m, Y(72));
			icono(l, k.codigo, m - 7, Y(80), 1);
			centrado(l, k.max + '/' + k.min, m, Y(96));
			const s = k.lluvia + '%', w = ancho(s, 1) + 5;
			gota(l, m - (w >> 1), Y(105));
			texto(l, s, m - (w >> 1) + 5, Y(104), 1, 255);
		}
		punteada(l, Y(113), 0, 102);
		texto(l, 'DESPERTADOR', 0, Y(117), 1, 255);
		for (let x = 70; x < 87; x++) for (let y = 115; y < 126; y++) punto(l, x, Y(y), 255);
		texto(l, c.alarma ? 'SI' : 'NO', 73, Y(117), 1, 0);
		texto(l, dos(c.alarmaH) + ':' + dos(c.alarmaM), 0, Y(127), 2, c.alarma ? 255 : 110);
		texto(l, c.alarmaRadio.slice(0, 6), 64, Y(131), 1, c.alarma ? 255 : 110);
		atomo(l, W - 15, Y(125), t);
	}
	function zona(x, y) {
		if (y >= 112 && y < 127 && x >= 66 && x < 92) return 'alarma';
		if (y >= 125 && x < 28) return 'hora';
		if (y >= 125 && x >= 28 && x < 62) return 'minutos';
		if (y >= 106 && x >= 104) return 'atomo';
		return '';
	}

	/* ---------- geometrías ---------- */
	const FAMILIAS = 9, ESCENA = 11, FUNDIDO = 3;
	function azar(g) { g.semilla = (Math.imul(g.semilla, 1103515245) + 12345) >>> 0; return ((g.semilla >>> 8) & 0xffff) / 65535; }
	function elegir(g, i) {
		let f;
		do f = Math.floor(azar(g) * FAMILIAS) % FAMILIAS; while (g.ultimas.includes(f));
		g.ultimas.pop(); g.ultimas.unshift(f);
		g.fam[i] = f;
		g.p[i] = Array.from({ length: 12 }, () => azar(g));
	}
	function geoEmpezar(semilla) {
		const g = { t: 0, desde: -FUNDIDO, semilla: (semilla >>> 0) || 1, fam: [-1, -1], p: [[], []], ultimas: [-1, -1, -1] };
		elegir(g, 1);
		g.fam[0] = -1;
		return g;
	}
	const V = { cy: 1, sy: 0, cx: 1, sx: 0, esc: 1, R: 1, cx0: 0, cy0: 0, br: 255, l: null };
	function proyectar(p) {
		const y1 = (p[1] * V.cx - p[2] * V.sx) * V.esc, z1 = p[1] * V.sx + p[2] * V.cx;
		const x2 = (p[0] * V.cy + z1 * V.sy) * V.esc, z2 = (-p[0] * V.sy + z1 * V.cy) * V.esc;
		const c45 = 0.70710678, s45 = 0.70710678, ca = 0.81649658, sa = 0.57735027;
		const xi = x2 * c45 - z2 * s45, zi = x2 * s45 + z2 * c45;
		const yi = y1 * ca + zi * sa, zz = -y1 * sa + zi * ca;
		return [V.cx0 + xi * V.R, V.cy0 - yi * V.R, zz];
	}
	function arista(a, b) {
		const A = proyectar(a), B = proyectar(b);
		let t = (1.3 - (A[2] + B[2]) / 2) / 2.6;
		t = t < 0 ? 0 : t > 1 ? 1 : t;
		const br = Math.floor(V.br * (0.5 + 0.5 * t));
		if (br) linea(V.l, Math.round(A[0]), Math.round(A[1]), Math.round(B[0]), Math.round(B[1]), br);
	}
	let caras = [];
	function cara(a, b, c, d) {
		const v = [a, b, c, d].map(proyectar);
		caras.push({ x: v.map(q => q[0]), y: v.map(q => q[1]), prof: (v[0][2] + v[1][2] + v[2][2] + v[3][2]) / 4 });
	}
	function pintarCaras() {
		caras.sort((a, b) => b.prof - a.prof);
		const l = V.l;
		for (const k of caras) {
			const y0 = Math.min(...k.y), y1 = Math.max(...k.y);
			for (let y = Math.ceil(y0); y <= Math.floor(y1); y++) {
				let xa = 1e9, xb = -1e9;
				for (let i = 0; i < 4; i++) {
					const j = (i + 1) & 3, ya = k.y[i], yb = k.y[j];
					if ((y < ya) === (y < yb) && y !== ya) continue;
					if (ya === yb) continue;
					const x = k.x[i] + (y - ya) * (k.x[j] - k.x[i]) / (yb - ya);
					if (x < xa) xa = x;
					if (x > xb) xb = x;
				}
				for (let x = Math.ceil(xa); x <= Math.floor(xb); x++) if (x >= 0 && y >= 0 && x < l.ancho && y < l.alto) l.px[y * l.ancho + x] = 0;
			}
			for (let i = 0; i < 4; i++) { const j = (i + 1) & 3; linea(l, Math.round(k.x[i]), Math.round(k.y[i]), Math.round(k.x[j]), Math.round(k.y[j]), V.br); }
		}
		caras = [];
	}
	function girar(p, eje, a) {
		const c = Math.cos(a), s = Math.sin(a);
		if (eje === 0) return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
		if (eje === 1) return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
		return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
	}
	const suave = x => { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); };
	function prisma(c, n, rr, h, rot) {
		const ab = [], ar = [];
		for (let i = 0; i < n; i++) {
			const u = rot + i * 2 * Math.PI / n;
			ab.push([c[0] + rr * Math.cos(u), c[1] - h, c[2] + rr * Math.sin(u)]);
			ar.push([c[0] + rr * Math.cos(u), c[1] + h, c[2] + rr * Math.sin(u)]);
		}
		for (let i = 0; i < n; i++) { const j = (i + 1) % n; arista(ab[i], ab[j]); arista(ar[i], ar[j]); arista(ab[i], ar[i]); }
	}
	const entero = (p, d, h) => Math.min(h, d + Math.floor(p * (h - d + 1)));

	function figura(l, f, p, t, r, br) {
		const giro = t * (0.12 + p[0] * 0.3) * (p[1] < 0.5 ? -1 : 1);
		V.l = l; V.br = br; V.esc = r;
		V.R = Math.min(l.ancho, l.alto) / 2 - 3;
		V.cx0 = l.ancho / 2; V.cy0 = l.alto / 2;
		const quieto = p[11] < 0.35;
		V.cy = quieto ? 1 : Math.cos(giro); V.sy = quieto ? 0 : Math.sin(giro); V.cx = 1; V.sx = 0;
		switch (f) {
		case 0: {   /* una sola línea sobre una esfera: espiral de polo a polo, o un ovillo */
			const incl = (p[3] - 0.5) * 1.2 + 0.2 * Math.sin(t * (0.2 + p[4] * 0.4));
			V.cx = Math.cos(incl); V.sx = Math.sin(incl);
			const n = 900, fase = t * (0.3 + p[5]), largo = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(t * (0.2 + p[6] * 0.4)));
			const vueltas = 5 + p[2] * 12, a = 1 + entero(p[7], 1, 6), b = a + 0.5 + entero(p[8], 0, 4) + p[9] * 0.02;
			let antes = null;
			for (let i = 0; i <= n * largo; i++) {
				const u = i / n;
				let lat, lon;
				if (p[10] < 0.5) { lat = -Math.PI / 2 + Math.PI * (0.03 + 0.94 * u); lon = vueltas * 2 * Math.PI * u + fase; }
				else { lon = a * 2 * Math.PI * u + fase; lat = (Math.PI / 2 - 0.1) * Math.sin(b * 2 * Math.PI * u + fase * 0.3); }
				const q = [0.92 * Math.cos(lat) * Math.cos(lon), 0.92 * Math.sin(lat), 0.92 * Math.cos(lat) * Math.sin(lon)];
				if (antes) arista(antes, q);
				antes = q;
			}
			break;
		}
		case 1: {   /* bloque macizo de cubitos que gira de a una rebanada */
			const N = [entero(p[2], 2, 4), entero(p[3], 1, 4), entero(p[4], 2, 4)], mayor = Math.max(...N);
			const m = 0.62 / mayor, paso = 1.1 + p[5] * 1.2, ciclo = (t % paso) / paso, mov = Math.floor(t / paso);
			let h = (Math.imul(mov, 2654435761) ^ Math.floor(p[6] * 65535)) >>> 0;
			h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 0x5bd1e995) >>> 0; h = (h ^ (h >>> 15)) >>> 0;
			const eje = h % 3, capa = (h >>> 4) % N[eje];
			const otros = [N[(eje + 1) % 3], N[(eje + 2) % 3]];
			const cuanto = otros[0] === otros[1] ? Math.PI / 2 : Math.PI;
			const ang = suave(ciclo / (0.5 + p[7] * 0.3)) * cuanto * ((h >>> 9) & 1 ? 1 : -1);
			for (let i = 0; i < N[0]; i++) for (let j = 0; j < N[1]; j++) for (let k = 0; k < N[2]; k++) {
				const pos = [i, j, k], gira = pos[eje] === capa;
				const cen = [(i - (N[0] - 1) / 2) * 2 * m, (j - (N[1] - 1) / 2) * 2 * m, (k - (N[2] - 1) / 2) * 2 * m];
				for (let e = 0; e < 3; e++) for (let sgn = -1; sgn <= 1; sgn += 2) {
					const q = [i, j, k]; q[e] += sgn;
					const afuera = q[e] < 0 || q[e] >= N[e];
					const borde = !afuera && ((q[eje] === capa) !== gira) && ang !== 0;
					if (!afuera && !borde) continue;
					const v = [];
					for (let c = 0; c < 4; c++) {
						const x = [0, 0, 0];
						x[e] = sgn * m; x[(e + 1) % 3] = (c === 0 || c === 3) ? -m : m; x[(e + 2) % 3] = c < 2 ? -m : m;
						const pt = [cen[0] + x[0], cen[1] + x[1], cen[2] + x[2]];
						v.push(gira ? girar(pt, eje, ang) : pt);
					}
					let cc = cen;
					const fc = [(v[0][0] + v[2][0]) / 2, (v[0][1] + v[2][1]) / 2, (v[0][2] + v[2][2]) / 2];
					if (gira) cc = girar(cc, eje, ang);
					if (proyectar(fc)[2] < proyectar(cc)[2]) cara(v[0], v[1], v[2], v[3]);
				}
			}
			pintarCaras();
			break;
		}
		case 2: {   /* prisma de alambre que atraviesan planos */
			const lados = entero(p[2], 3, 8), planos = entero(p[3], 2, 7), rr = 0.5 + p[4] * 0.3, h = 0.3 + p[5] * 0.35;
			prisma([0, 0, 0], lados, rr, h, Math.PI / 4);
			for (let n = 0; n < planos; n++) {
				const y = h * Math.sin(t * (0.5 + p[6]) + n * (0.3 + p[7] * 0.8));
				const rot = Math.PI / 4 + (p[8] > 0.5 ? Math.sin(t * 0.7 + n) * 0.6 * p[9] : 0);
				let a = null;
				for (let i = 0; i <= lados; i++) {
					const u = rot + i * 2 * Math.PI / lados, q = [rr * Math.cos(u), y, rr * Math.sin(u)];
					if (a) arista(a, q);
					a = q;
				}
			}
			break;
		}
		case 3: {   /* placas apiladas que se desfasan */
			const n = entero(p[2], 3, 8), lados = p[3] < 0.5 ? 4 : entero(p[4], 3, 8);
			const sep = 0.12 + p[5] * 0.14, amp = 0.2 + p[6] * 0.8, onda = 0.3 + p[7] * 0.9, vel = 0.5 + p[8] * 0.8;
			for (let i = 0; i < n; i++) {
				const y = (i - (n - 1) / 2) * sep * (1 + 0.25 * Math.sin(t * 0.6));
				const d = Math.sin(t * vel - i * onda) * amp, dx = 0.16 * p[9] * Math.sin(t * 0.6 - i * 0.7);
				prisma([dx, y, -dx], lados, 0.62 - (lados === 4 ? 0 : 0.05), 0.03 + p[10] * 0.04, Math.PI / 4 + d);
			}
			break;
		}
		case 4: {   /* hipercubo de 4 o 5 dimensiones */
			const D = p[2] < 0.6 ? 4 : 5, nv = 1 << D, P = [], Q = [];
			for (let i = 0; i < nv; i++) { P.push([]); for (let d = 0; d < D; d++) P[i].push((i >> d) & 1 ? 1 : -1); }
			for (let k = 0; k < 3; k++) {
				let a = entero(p[3 + k], 0, D - 1);
				const b = 3 + entero(p[6 + k], 0, D - 4) % (D - 3);
				if (a === b) a = (a + 1) % 3;
				const ang = t * (0.2 + p[9 - k] * 0.5) * (k & 1 ? -1 : 1);
				for (let i = 0; i < nv; i++) { const x = P[i][a], y = P[i][b]; P[i][a] = x * Math.cos(ang) - y * Math.sin(ang); P[i][b] = x * Math.sin(ang) + y * Math.cos(ang); }
			}
			for (let i = 0; i < nv; i++) {
				let k = 1;
				for (let d = D - 1; d >= 3; d--) k *= 0.62 / (2.6 - P[i][d] * (d === 4 ? 0.6 : 1));
				Q.push([0, 1, 2].map(d => P[i][d] * k * (D === 4 ? 1.9 : 4.4)));
			}
			for (let i = 0; i < nv; i++) for (let d = 0; d < D; d++) { const j = i ^ (1 << d); if (j > i) arista(Q[i], Q[j]); }
			break;
		}
		case 5: {   /* malla isométrica con ondas mezcladas */
			const n = entero(p[2], 9, 15), ondas = entero(p[3], 1, 3), Y = [];
			for (let i = 0; i < n; i++) {
				Y.push([]);
				for (let j = 0; j < n; j++) {
					const x = -1 + 2 * i / (n - 1), z = -1 + 2 * j / (n - 1);
					let y = 0;
					for (let w = 0; w < ondas; w++) {
						const fr = 2 + p[4 + w] * 5, ang = p[7 + w] * 2 * Math.PI, cx = (p[5 + w] - 0.5) * 1.4;
						const d = p[10] < 0.5 && w === 0 ? Math.hypot(x - cx, z) : x * Math.cos(ang) + z * Math.sin(ang);
						y += Math.sin(d * fr - t * (1.2 + p[8] * 1.5) * (w & 1 ? -1 : 1)) / ondas;
					}
					Y[i].push(0.2 * y);
				}
			}
			const L = 0.72, d = 2 * L / (n - 1);
			for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
				const x = -L + i * d, z = -L + j * d;
				if (i + 1 < n) arista([x, Y[i][j], z], [x + d, Y[i + 1][j], z]);
				if (j + 1 < n) arista([x, Y[i][j], z], [x, Y[i][j + 1], z + d]);
			}
			break;
		}
		case 6: {   /* nudo toroidal */
			const P = entero(p[2], 2, 7);
			let Q = entero(p[3], 3, 9);
			if (P === Q) Q++;
			while (Q % P === 0 && P > 1) Q++;
			const R1 = 0.55 + p[4] * 0.1, r1 = 0.18 + p[5] * 0.15 + 0.05 * Math.sin(t * 0.8), incl = (p[6] - 0.5) * 1.4;
			V.cx = Math.cos(incl); V.sx = Math.sin(incl);
			const n = 900;
			let antes = null;
			for (let i = 0; i <= n; i++) {
				const u = i * 2 * Math.PI / n, w = Q * u + t * (0.3 + p[7]);
				const q = [(R1 + r1 * Math.cos(w)) * Math.cos(P * u), r1 * Math.sin(w), (R1 + r1 * Math.cos(w)) * Math.sin(P * u)];
				if (antes) arista(antes, q);
				antes = q;
			}
			break;
		}
		case 7: {   /* torre de polígonos que se retuerce */
			const n = entero(p[2], 6, 14), lados = entero(p[3], 3, 8);
			const alto = 0.7 + p[4] * 0.25, tor = Math.sin(t * (0.3 + p[5] * 0.6)) * (0.8 + p[6] * 1.6);
			let ant = null;
			for (let i = 0; i < n; i++) {
				const y = -alto + 2 * alto * i / (n - 1), s2 = 1 - (i / (n - 1) - 0.5) * (p[7] - 0.5) * 1.2;
				const rr = (0.32 + p[8] * 0.3) * s2 * (1 + 0.15 * p[9] * Math.sin(t * 1.3 + i * 0.6));
				const v = [];
				for (let k = 0; k < lados; k++) { const u = k * 2 * Math.PI / lados + tor * i / n; v.push([rr * Math.cos(u), y, rr * Math.sin(u)]); }
				for (let k = 0; k < lados; k++) { arista(v[k], v[(k + 1) % lados]); if (ant) arista(ant[k], v[k]); }
				ant = v;
			}
			break;
		}
		default: {   /* figuras que nacen en el centro y crecen sin fin */
			const capas = entero(p[2], 4, 8), lados = p[3] < 0.4 ? 4 : entero(p[4], 3, 8);
			const fase = (t * (0.12 + p[5] * 0.15)) % 1, torsion = (p[6] - 0.5) * 2, alto = 0.25 + p[7] * 0.75;
			for (let c = 0; c < capas; c++) {
				const s2 = (c + fase) / capas;
				V.br = Math.floor(br * Math.min(1, s2 * 4) * Math.min(1, (1 - s2) * 5 + 0.15));
				prisma([0, 0, 0], lados, 0.85 * s2, 0.6 * s2 * alto, Math.PI / 4 + torsion * Math.log(s2 + 0.05) * 2);
			}
		}
		}
	}
	function geoPaso(g, l, dt) {
		g.t += dt;
		const px = l.px;
		for (let i = 0; i < px.length; i++) px[i] = (px[i] * 150) >> 8;   /* estela corta */
		if (g.t - g.desde > ESCENA) {
			g.fam[0] = g.fam[1]; g.p[0] = g.p[1].slice();
			elegir(g, 1);
			g.desde = g.t;
		}
		let m = Math.min(1, (g.t - g.desde) / FUNDIDO);
		m = m * m * (3 - 2 * m);
		const r = 0.92 + 0.08 * Math.sin(g.t * 2 * Math.PI / 4.5);
		if (g.fam[0] >= 0 && m < 1) figura(l, g.fam[0], g.p[0], g.t, r, Math.floor(255 * (1 - m)));
		figura(l, g.fam[1], g.p[1], g.t, r, Math.floor(255 * m));
	}
	return { lienzoPuntos, borrar, menu, zona, geoEmpezar, geoPaso };
})();
