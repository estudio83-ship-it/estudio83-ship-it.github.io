/* Los programas de la consola: Saltarín, Bloques, Cámara y la prueba del control. Dibujos y mundo propios. */
'use strict';
const kTiles = [
	[],
	["33333333", "33333333", "00000000", "20030020", "00000000", "02000300", "33333333", "22222222"],   
	["22222222", "33333333", "22222222", "11111111", "33333333", "22222222", "33333333", "22222222"],   
	["33333333", "31113111", "31113111", "33333333", "11311131", "11311131", "33333333", "31113111"],
	["  3333  ", " 300003 ", "30011003", "30010003", "30010003", "30011003", " 300003 ", "  3333  "],
	["33333333", "30000013", "30111123", "30111123", "30111123", "30111123", "31222223", "33333333"],
	["   23   ", "   23   ", "   23   ", "   23   ", "   23   ", "   23   ", "   23   ", "   23   "],
	["  3333  ", " 300013 ", " 301113 ", " 311123 ", "  3333  ", "   23   ", "   23   ", "   23   "],
];
const kMonedaCanto = ["   33   ", "  3003  ", "  3013  ", "  3013  ", "  3013  ", "  3013  ", "  3003  ", "   33   "];
const kHeroe = [
	["      3333      ", "    33222233    ", "   3222222223   ", "  322222222223  ", "  333333333333  ", "  300000000003  ", " 30003300330003 ", " 30003300330003 ", " 30000000000003 ", "  300033330003  ", "   3000000003   ", "    33333333    ", "   3112112113   ", "   3333333333   ", "    33    33    ", "   333    333   "],
	["      3333      ", "    33222233    ", "   3222222223   ", "  322222222223  ", "  333333333333  ", "  300000000003  ", " 30003300330003 ", " 30003300330003 ", " 30000000000003 ", "  300033330003  ", "   3000000003   ", "    33333333    ", "   3112112113   ", "   3333333333   ", "     33  33     ", "    333  333    "],
	["      3333      ", "    33222233    ", "   3222222223   ", "  322222222223  ", "  333333333333  ", "  300000000003  ", " 30003300330003 ", " 30003300330003 ", " 30000000000003 ", "  300003300003  ", "   3000330003   ", "  3333333333 3  ", " 3 3112112113   ", "   3333333333   ", "   33      33   ", "  333      333  "],   
];
const kEscarabajo = [
	["                ", "                ", "     333333     ", "   3322222233   ", "  322222222223  ", " 32222222222223 ", " 32200222200223 ", "3220330220330223", "3220330220330223", "3222222222222223", "3333333333333333", " 31111111111113 ", "  333333333333  ", "  3  3    3  3  ", " 3  3      3  3 ", "                "],
	["                ", "                ", "     333333     ", "   3322222233   ", "  322222222223  ", " 32222222222223 ", " 32200222200223 ", "3220330220330223", "3220330220330223", "3222222222222223", "3333333333333333", " 31111111111113 ", "  333333333333  ", "   3  3  3  3   ", "  3  3    3  3  ", "                "],
];
const kAplastado = ["   3333333333   ", " 32200222200223 ", "3333333333333333", " 31111111111113 ", "  333333333333  "];
const kNubeChica = ["               333333333", "              30000000003", "         3   3000000000003", "      333033300000000000003", "    330000000000000000000003 3", "   300000000000000000000000030333", "   3000000000000000000000000000003", "  300000000000000000000000000000003", "  3000000000000000000000000000000003", "  3000000000000000000000000000000003", " 30000000000000000000000000000000003", "  30000000000000000000000000000000003", "  3000000000000000000000000000000003", "  3101010101010101010101010101010103", "   310101010101010101010101010101013", "   30101010101010101010131010101013", "    33101010133333303333 310101013", "      3333333      3      3333333"];
const kNubeGrande = ["                 333333333       3", "                30000000003  333303333", "               300000000000330000000003", "         3    30000000000000000000000003", "      33303333000000000000000000000000003   3", "    33000000000000000000000000000000000003330333", "   3000000000000000000000000000000000000000000003", "   30000000000000000000000000000000000000000000003", "  3000000000000000000000000000000000000000000000003", "  3000000000000000000000000000000000000000000000003", "  3000000000000000000000000000000000000000000000003", " 300000000000000000000000000000000000000000000000003", "  3000000000000000000000000000000000000000000000003", "  3000000000000000000000000000000000000000000000003", "  3010101010101010101010101010101010101010101010103", "   30101010101013101010101330101010101030101010103", "   3101010101013 333303333  30101010103 301010103", "    33010101033      3       333313333   3330333", "      3333333                    3          3"];
const kPalma = ["  3333    3333  ", " 3    3  3    3 ", "3      33      3", "      3  3      ", "     3    3     ", "    3  33  3    ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       ", "        3       "];
const kMata = ["  2222    ", " 222222 22", "2222222222", "2222222222"];
const kBandera = ["3333333", "322222 ", "32223  ", "323    ", "33     "];
const kPiezasGB = [
	[0x0F00, 0x2222, 0x00F0, 0x4444], [0x8E00, 0x6440, 0x0E20, 0x44C0], [0x2E00, 0x4460, 0x0E80, 0xC440],
	[0x6600, 0x6600, 0x6600, 0x6600], [0x6C00, 0x4620, 0x06C0, 0x8C40], [0x4E00, 0x4640, 0x0E40, 0x4C40],
	[0xC600, 0x2640, 0x0C60, 0x4C80],
];
const kCuadros = [
	["33333333", "30000003", "30222203", "30222203", "30222203", "30222203", "30000003", "33333333"],
	["33333333", "32222223", "32111123", "32111123", "32111123", "32111123", "32222223", "33333333"],
	["33333333", "31111113", "31333313", "31300313", "31300313", "31333313", "31111113", "33333333"],
	["33333333", "30000023", "30000023", "30000023", "30000023", "30000023", "32222223", "33333333"],
];
const kPared = ["33333333", "21112111", "21112111", "33333333", "11211121", "11211121", "33333333", "21112111"];
const MONEDA_HUD = ['  3333  ', ' 300003 ', '30011003', '30110003', '30110003', '30000003', ' 300003 ', '  3333  '];
const MUNDO_W = 224, MUNDO_H = 18;
const T = { vacio: 0, pasto: 1, tierra: 2, ladrillo: 3, moneda: 4, piedra: 5, mastil: 6, punta: 7 };
const dos = n => String(n).padStart(2, '0');

/* ---------- Saltarín: corre y salta, junta monedas, rompe ladrillos de abajo y pisa escarabajos ---------- */
class Saltarin {
	azar(n) { this.semilla = (Math.imul(this.semilla, 1103515245) + 12345) >>> 0; return (this.semilla >>> 16) % n; }
	duro(c, f) {
		if (c < 0 || c >= MUNDO_W) return true;
		if (f < 0 || f >= MUNDO_H) return false;
		const k = this.t[f][c];
		return k === T.pasto || k === T.tierra || k === T.ladrillo || k === T.piedra;
	}
	armarNivel() {
		const t = this.t = Array.from({ length: MUNDO_H }, () => new Uint8Array(MUNDO_W));
		this.semilla = (977 * this.nivel + 31) >>> 0;
		for (let c = 0; c < MUNDO_W; c++) { t[15][c] = T.pasto; t[16][c] = t[17][c] = T.tierra; }
		const e = this.e = [], bicho = (x, y) => { if (e.length < 40) e.push({ x, y, vx: -0.45, vy: 0, estado: 0, t: 0 }); };
		let x = 16; const maxHueco = this.nivel >= 3 ? 3 : 2;
		while (x < MUNDO_W - 30) {
			const r = this.azar(100);
			if (r < 20) {
				const g = 2 + this.azar(maxHueco - 1);
				for (let c = x; c < x + g; c++) t[15][c] = t[16][c] = t[17][c] = T.vacio;
				if (this.azar(2)) for (let c = x - 1; c < x + g + 1; c++) t[10][c] = T.moneda;
				x += g + 3;
			} else if (r < 40) {
				const l = 3 + this.azar(3);
				for (let c = x; c < x + l; c++) { t[11][c] = T.ladrillo; if (this.azar(3)) t[10][c] = T.moneda; }
				if (e.length < 40 && this.azar(2)) bicho((x + l) * 8, 13 * 8);
				x += l + 3;
			} else if (r < 54) {
				const h = 2 + this.azar(2);
				for (let f = 15 - h; f < 15; f++) t[f][x] = t[f][x + 1] = T.piedra;
				x += 5;
			} else if (r < 66) {
				const alt = [1, 2, 3, 3, 2, 1];
				for (let i = 0; i < 6; i++) for (let f = 15 - alt[i]; f < 15; f++) t[f][x + i] = T.piedra;
				x += 8;
			} else if (r < 78) {
				const arco = [13, 12, 11, 12, 13];
				for (let i = 0; i < 5; i++) t[arco[i]][x + i] = T.moneda;
				x += 6;
			} else {
				const n = 1 + (this.nivel >= 2 ? this.azar(2) : 0);
				for (let i = 0; i < n; i++) bicho((x + 3 + i * 2) * 8, 13 * 8);
				x += 7;
			}
		}
		for (let c = MUNDO_W - 30; c < MUNDO_W; c++) { t[15][c] = T.pasto; t[16][c] = t[17][c] = T.tierra; }
		const base = MUNDO_W - 24;
		for (let i = 0; i < 4; i++) for (let f = 14 - i; f < 15; f++) t[f][base + i] = T.piedra;
		this.mastil = MUNDO_W - 14;
		for (let f = 5; f < 15; f++) t[f][this.mastil] = T.mastil;
		t[4][this.mastil] = T.punta; t[14][this.mastil] = T.piedra;
		this.nubes = []; this.matas = []; this.cerros = []; this.palmas = [];
		for (let c = 12; c < MUNDO_W && this.nubes.length < 24; c += 11 + this.azar(8)) this.nubes.push([c * 8, 26 + this.azar(3) * 8]);
		for (let c = 6; c < MUNDO_W && this.matas.length < 24; c += 7 + this.azar(9)) if (t[15][c] && t[15][c + 1] && !t[14][c] && !t[14][c + 1]) this.matas.push(c * 8);
		for (let x2 = 0; x2 < MUNDO_W * 4 && this.cerros.length < 24; x2 += 60 + this.azar(70)) this.cerros.push([x2, 28 + this.azar(40)]);
		for (let x2 = 40; x2 < MUNDO_W * 4 && this.palmas.length < 24; x2 += 70 + this.azar(120)) this.palmas.push(x2);
	}
	largar() {
		this.tiempo = 300 * 24;
		this.x = 24; this.y = 13 * 8; this.vx = this.vy = 0; this.cam = 0; this.suelo = false; this.mira = false; this.estado = 1; this.cuenta = 0;
		for (const b of this.e) if (b.estado !== -1) b.estado = 0;
	}
	empezar() {
		this.nivel = 1; this.vidas = 3; this.puntos = 0; this.monedas = 0; this.tic = 0; this.paso_ = 0; this.combo = 0;
		this.record = guardado.leer('record_saltarin', 0);
		this.armarNivel(); this.largar();
	}
	terminar() {}
	sumar(p) { this.puntos += p; if (this.puntos > this.record) { this.record = this.puntos; guardado.poner('record_saltarin', this.record); } }
	morir() { this.estado = 2; this.cuenta = 0; this.vy = -3.6; this.vx = 0; }
	tomarMonedas() {
		for (let f = Math.floor(this.y / 8); f <= Math.floor((this.y + 15) / 8); f++)
			for (let c = Math.floor((this.x + 2) / 8); c <= Math.floor((this.x + 13) / 8); c++)
				if (f >= 0 && f < MUNDO_H && c >= 0 && c < MUNDO_W && this.t[f][c] === T.moneda) {
					this.t[f][c] = T.vacio; this.monedas++; this.sumar(100);
					if (this.monedas >= 100) { this.monedas -= 100; this.vidas++; }
				}
	}
	/* mueve una caja (o: x, y, vx, vy) y la frena contra lo duro: 1 = chocó de costado, 2 = apoyó, 4 = cabeza */
	mover(o, ox, w, h, cabeza) {
		let r = 0;
		o.x += o.vx;
		const f0 = Math.floor(o.y / 8), f1 = Math.floor((o.y + h - 1) / 8);
		if (o.vx > 0) { const c = Math.floor((o.x + ox + w - 1) / 8); for (let f = f0; f <= f1; f++) if (this.duro(c, f)) { o.x = c * 8 - ox - w; o.vx = 0; r |= 1; break; } }
		else if (o.vx < 0) { const c = Math.floor((o.x + ox) / 8); for (let f = f0; f <= f1; f++) if (this.duro(c, f)) { o.x = (c + 1) * 8 - ox; o.vx = 0; r |= 1; break; } }
		o.y += o.vy;
		const c0 = Math.floor((o.x + ox) / 8), c1 = Math.floor((o.x + ox + w - 1) / 8);
		if (o.vy > 0) { const f = Math.floor((o.y + h - 1) / 8); for (let c = c0; c <= c1; c++) if (this.duro(c, f)) { o.y = f * 8 - h; o.vy = 0; r |= 2; break; } }
		else if (o.vy < 0) {
			const f = Math.floor(o.y / 8);
			for (let c = c0; c <= c1; c++) if (this.duro(c, f)) { o.y = (f + 1) * 8; o.vy = 0; r |= 4; if (cabeza) { cabeza[0] = c; cabeza[1] = f; } break; }
		}
		return r;
	}
	paso(ap, nu) {
		this.tic++;
		if (this.estado === 4) { if (nu & (B.A | B.inicio)) this.empezar(); return; }
		if (this.estado === 5) { if (nu & B.inicio) this.estado = 1; return; }
		if (this.estado === 1 && (nu & B.inicio)) { this.estado = 5; return; }
		if (this.estado === 2) {
			this.cuenta++;
			if (this.cuenta > 20) { this.vy = Math.min(this.vy + 0.25, 4); this.y += this.vy; }
			if (this.cuenta > 110) { this.vidas--; if (this.vidas <= 0) this.estado = 4; else { this.armarNivel(); this.largar(); } }
			return;
		}
		if (this.estado === 3) {
			this.cuenta++;
			if (this.y < 13 * 8 - 8) this.y += 1.5; else { this.x += 0.8; this.mira = false; this.paso_++; }
			if (this.cuenta > 160) { this.nivel++; this.armarNivel(); this.largar(); }
			return;
		}
		if (--this.tiempo <= 0) { this.morir(); return; }
		const corre = (ap & B.B) !== 0, tope = corre ? 2.0 : 1.3, ac = this.suelo ? 0.09 : 0.06;
		if (ap & B.der) { this.vx = Math.min(tope, this.vx + ac); this.mira = false; }
		else if (ap & B.izq) { this.vx = Math.max(-tope, this.vx - ac); this.mira = true; }
		else if (this.suelo) { this.vx *= 0.82; if (Math.abs(this.vx) < 0.05) this.vx = 0; }
		if (Math.abs(this.vx) > tope) this.vx *= 0.95;
		if ((nu & B.A) && this.suelo) this.vy = -4.3 - Math.abs(this.vx) * 0.25;
		this.vy = Math.min(4, this.vy + (((ap & B.A) && this.vy < 0) ? 0.15 : 0.32));
		if (this.y < 16) this.vy = Math.max(this.vy, 0.5);
		const cab = [-1, -1];
		const r = this.mover(this, 2, 12, 16, cab);
		this.suelo = (r & 2) !== 0;
		if (this.suelo) this.combo = 0;
		if (cab[0] >= 0 && this.t[cab[1]][cab[0]] === T.ladrillo) { this.t[cab[1]][cab[0]] = T.vacio; this.sumar(50); }
		if (this.x < this.cam) { this.x = this.cam; this.vx = Math.max(0, this.vx); }
		if (Math.abs(this.vx) > 0.1) this.paso_++;
		this.tomarMonedas();
		this.cam = Math.max(this.cam, Math.min(this.x - 64, MUNDO_W * 8 - GB_W));
		if (this.y > GB_H + 4) { this.morir(); return; }
		if (this.x + 14 >= this.mastil * 8) {
			this.sumar(Math.max(100, Math.trunc(15 * 8 - this.y) * 20));
			this.x = this.mastil * 8 - 4; this.vx = this.vy = 0; this.estado = 3; this.cuenta = 0;
			return;
		}
		for (const e of this.e) {
			if (e.estado === -1) continue;
			if (e.estado === 0) { if (e.x < this.cam + GB_W + 8) e.estado = 1; else continue; }
			if (e.estado === 2) { if (++e.t > 30) e.estado = -1; continue; }
			e.vy = Math.min(4, e.vy + 0.3);
			const antes = e.vx, g = this.mover(e, 1, 14, 16, null);
			if (g & 1) e.vx = -antes;
			if (e.y > GB_H || e.x < this.cam - 24) { e.estado = -1; continue; }
			if (this.x + 13 > e.x + 2 && this.x + 3 < e.x + 14 && this.y + 16 > e.y + 3 && this.y + 2 < e.y + 15) {
				if (this.vy > 0 && this.y + 16 - (e.y + 3) < 9) {
					e.estado = 2; e.t = 0; this.vy = (ap & B.A) ? -4.2 : -2.8; this.combo++; this.sumar(100 * Math.min(this.combo, 8));
				} else { this.morir(); return; }
			}
		}
	}
	dibujar(px) {
		const cam = Math.trunc(this.cam);
		gbCaja(px, 0, 16, GB_W, 8, 1); gbCaja(px, 0, 26, GB_W, 1, 1); gbCaja(px, 0, 28, GB_W, 1, 1);
		const fondo = Math.trunc(cam / 2);
		for (const [cx0, h] of this.cerros) {
			const cx = cx0 - fondo, base = 15 * 8 - 1;
			if (cx + h < 0 || cx - h > GB_W) continue;
			for (let k = 0; k <= h; k++) { gbPunto(px, cx - h + k, base - k, 3); gbPunto(px, cx + h - k, base - k, 3); }
		}
		for (const p of this.palmas) { const x = p - fondo; if (x > -16 && x < GB_W) gbDibujo(px, kPalma, x, 15 * 8 - 24); }
		this.nubes.forEach(([nx, ny], i) => { const x = nx - fondo; if (x > -56 && x < GB_W) gbDibujo(px, i % 2 ? kNubeGrande : kNubeChica, x, ny); });
		for (const m of this.matas) { const x = m - cam; if (x > -12 && x < GB_W) gbDibujo(px, kMata, x, 15 * 8 - 4); }
		const c0 = cam >> 3;
		for (let c = c0; c <= c0 + 20 && c < MUNDO_W; c++)
			for (let f = 0; f < MUNDO_H; f++) {
				const k = this.t[f][c];
				if (!k) continue;
				gbDibujo(px, (k === T.moneda && ((this.tic / 12) | 0) % 4 === 2) ? kMonedaCanto : kTiles[k], c * 8 - cam, f * 8);
			}
		const by = this.estado === 3 ? Math.min(13 * 8 - 4, Math.trunc(this.y)) : 5 * 8 + 2;
		gbDibujo(px, kBandera, this.mastil * 8 - cam - 3, by, true);
		for (const e of this.e) {
			if (e.estado < 0 || (e.estado === 0 && e.x > this.cam + GB_W + 8)) continue;
			const x = Math.round(e.x) - cam, y = Math.round(e.y);
			if (e.estado === 2) gbDibujo(px, kAplastado, x, y + 11); else gbDibujo(px, kEscarabajo[((this.tic / 10) | 0) % 2], x, y);
		}
		if (this.estado !== 4) {
			let cuadro = !this.suelo && this.estado === 1 ? 2 : ((this.paso_ / 6) | 0) % 2;
			if (this.estado === 2) cuadro = 2;
			gbDibujo(px, kHeroe[cuadro], Math.round(this.x) - cam, Math.round(this.y), this.mira);
		}
		gbCaja(px, 0, 0, GB_W, 16, 0);
		gbTexto8(px, 'PIPOx' + dos(Math.max(0, this.vidas)), 0, 0, 3);
		gbTexto8(px, 'NIVEL', 64, 0, 3); gbTexto8(px, 'TIEMPO', 112, 0, 3);
		gbTexto8(px, String(this.puntos).padStart(6), 0, 8, 3);
		gbDibujo(px, MONEDA_HUD, 48, 8);
		gbTexto8(px, 'x' + dos(this.monedas), 56, 8, 3);
		gbTexto8(px, '1-' + this.nivel, 88, 8, 3);
		gbTexto8(px, String(Math.max(0, (this.tiempo / 24) | 0)).padStart(3), 136, 8, 3);
		if (this.estado === 1 && this.x < 40 && this.tic < 150) gbCentrado(px, 'NIVEL ' + this.nivel, 50, 3);
		if (this.estado === 5) { gbCaja(px, 44, 60, 72, 20, 0); gbCaja(px, 44, 60, 72, 1, 3); gbCaja(px, 44, 79, 72, 1, 3); gbCentrado(px, 'PAUSA', 67, 3); }
		if (this.estado === 4) {
			gbCaja(px, 20, 44, 120, 56, 0); gbCaja(px, 20, 44, 120, 2, 3); gbCaja(px, 20, 98, 120, 2, 3);
			gbCentrado(px, 'FIN DEL JUEGO', 52, 3);
			gbCentrado(px, this.puntos + ' PUNTOS', 66, 2);
			gbCentrado(px, 'RECORD ' + this.record, 76, 2);
			if (((this.tic / 20) | 0) % 2) gbCentrado(px, 'A: OTRA', 88, 3);
		}
	}
}

/* ---------- Bloques de bolsillo: tablero de 10 x 18 entre dos paredes ---------- */
const BL_W = 10, BL_H = 18;
class BloquesGB {
	lleno(t, g, r, c) { return (kPiezasGB[t][g & 3] >> (15 - (r * 4 + c))) & 1; }
	entra(t, g, x, y) {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
			if (!this.lleno(t, g, r, c)) continue;
			const X = x + c, Y = y + r;
			if (X < 0 || X >= BL_W || Y >= BL_H) return false;
			if (Y >= 0 && this.t[Y][X]) return false;
		}
		return true;
	}
	sacar() {
		if (!this.bolsa.length) {
			this.bolsa = [0, 1, 2, 3, 4, 5, 6];
			for (let i = 6; i > 0; i--) { const k = (Math.random() * (i + 1)) | 0; [this.bolsa[i], this.bolsa[k]] = [this.bolsa[k], this.bolsa[i]]; }
		}
		return this.bolsa.pop();
	}
	otra() {
		this.tipo = this.sig; this.sig = this.sacar(); this.giro = 0; this.px = 3; this.py = this.tipo === 0 ? -1 : 0; this.caida = 0; this.apoyo = 0;
		if (!this.entra(this.tipo, 0, this.px, this.py)) {
			this.estado = 2;
			if (this.puntos > this.record) { this.record = this.puntos; guardado.poner('record_bloquesgb', this.record); }
		}
	}
	empezar() {
		this.t = Array.from({ length: BL_H }, () => new Uint8Array(BL_W)); this.llena = new Array(BL_H).fill(false);
		this.puntos = 0; this.filas = 0; this.nivel = 1; this.bolsa = []; this.borrando = 0; this.estado = 0; this.tic = 0; this.repite = 0;
		this.record = guardado.leer('record_bloquesgb', 0);
		this.sig = this.sacar(); this.otra();
	}
	terminar() {}
	fijar() {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
			if (this.lleno(this.tipo, this.giro, r, c) && this.py + r >= 0) this.t[this.py + r][this.px + c] = this.tipo + 1;
		let n = 0;
		for (let r = 0; r < BL_H; r++) { const toda = this.t[r].every(v => v); this.llena[r] = toda; n += toda; }
		const tabla = [0, 40, 100, 300, 1200];
		if (n) { this.puntos += tabla[n] * this.nivel; this.filas += n; this.nivel = 1 + ((this.filas / 10) | 0); this.borrando = 24; }
		else this.otra();
	}
	sacarFilas() {
		const quedan = this.t.filter((_, r) => !this.llena[r]);
		while (quedan.length < BL_H) quedan.unshift(new Uint8Array(BL_W));
		this.t = quedan; this.llena.fill(false);
		this.otra();
	}
	mover(dx) { if (this.entra(this.tipo, this.giro, this.px + dx, this.py)) { this.px += dx; this.apoyo = 0; } }
	girar(d) {
		const g = (this.giro + d + 4) & 3;
		for (const k of [0, -1, 1, -2, 2]) if (this.entra(this.tipo, g, this.px + k, this.py)) { this.giro = g; this.px += k; this.apoyo = 0; return; }
	}
	paso(ap, nu) {
		this.tic++;
		if (this.estado === 2) { if (nu & (B.A | B.inicio)) this.empezar(); return; }
		if (nu & B.inicio) { this.estado = this.estado ? 0 : 1; return; }
		if (this.estado === 1) return;
		if (this.borrando) { if (--this.borrando === 0) this.sacarFilas(); return; }
		if (nu & B.izq) { this.mover(-1); this.repite = 0; }
		else if (nu & B.der) { this.mover(1); this.repite = 0; }
		else if (ap & (B.izq | B.der)) { if (++this.repite > 14 && this.repite % 5 === 0) this.mover((ap & B.izq) ? -1 : 1); }
		if (nu & B.A) this.girar(1);
		if (nu & B.B) this.girar(-1);
		if (nu & B.arriba) {
			let n = 0;
			while (this.entra(this.tipo, this.giro, this.px, this.py + 1)) { this.py++; n++; }
			this.puntos += 2 * n; this.fijar(); return;
		}
		const vel = (ap & B.abajo) ? 2 : Math.max(3, 50 - 5 * (this.nivel - 1));
		if (++this.caida >= vel) {
			this.caida = 0;
			if (this.entra(this.tipo, this.giro, this.px, this.py + 1)) { this.py++; if (ap & B.abajo) this.puntos++; }
			else if (++this.apoyo >= 2 || (ap & B.abajo)) this.fijar();
		}
	}
	cuadro(px, t, x, y) { gbDibujo(px, kCuadros[t % 4], x, y); }
	dibujar(px) {
		const ox = 16;
		for (let f = 0; f < BL_H; f++) { gbDibujo(px, kPared, 8, f * 8); gbDibujo(px, kPared, ox + BL_W * 8, f * 8); }
		gbCaja(px, 0, 0, 8, GB_H, 2);
		for (let r = 0; r < BL_H; r++) {
			if (this.llena[r]) { if (((this.borrando / 4) | 0) % 2) gbCaja(px, ox, r * 8, BL_W * 8, 8, 3); continue; }
			for (let c = 0; c < BL_W; c++) if (this.t[r][c]) this.cuadro(px, this.t[r][c] - 1, ox + c * 8, r * 8);
		}
		if (!this.borrando && this.estado !== 2)
			for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
				if (this.lleno(this.tipo, this.giro, r, c) && this.py + r >= 0) this.cuadro(px, this.tipo, ox + (this.px + c) * 8, (this.py + r) * 8);
		const x = ox + BL_W * 8 + 10;
		gbTexto(px, 'PUNTOS', x, 4, 3); gbTexto(px, String(this.puntos), x, 14, 2);
		gbTexto(px, 'NIVEL', x, 30, 3); gbTexto(px, String(this.nivel), x, 40, 2);
		gbTexto(px, 'FILAS', x, 56, 3); gbTexto(px, String(this.filas), x, 66, 2);
		gbCaja(px, x - 2, 82, 48, 34, 3); gbCaja(px, x, 84, 44, 30, 0);
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
			if (this.lleno(this.sig, 0, r, c)) this.cuadro(px, this.sig, x + 6 + c * 8 - (this.sig === 0 ? 0 : -4), 90 + r * 8 - (this.sig === 0 ? 4 : 0));
		gbTexto(px, 'R' + this.record, x, 128, 2);
		if (this.estado === 1) { gbCaja(px, ox + 10, 60, 60, 20, 0); gbTexto(px, 'PAUSA', ox + 26, 67, 3); }
		if (this.estado === 2) {
			gbCaja(px, ox + 4, 50, 72, 40, 0); gbCaja(px, ox + 4, 50, 72, 1, 3); gbCaja(px, ox + 4, 89, 72, 1, 3);
			gbTexto(px, 'FIN', ox + 31, 56, 3);
			if (((this.tic / 20) | 0) % 2) gbTexto(px, 'A: OTRA', ox + 19, 72, 3);
		}
	}
}

/* ---------- Cámara: la de adelante, en 128 x 112 puntos y cuatro tonos con trama ---------- */
const FOTO_W = 128, FOTO_H = 112;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
class Camara {
	constructor() { this.luz = 0; this.contraste = 1.2; this.espejo = true; this.hay = false; this.flash = 0; this.congelada = 0; this.aviso = 0; this.tic = 0; this.texto = ''; this.error = ''; this.foto = new Uint8Array(FOTO_W * FOTO_H); this.quieta = new Uint8Array(FOTO_W * FOTO_H); }
	empezar() {
		this.vivo = true;
		this.video = document.createElement('video'); this.video.muted = true; this.video.playsInline = true;
		this.lienzo = document.createElement('canvas'); this.lienzo.width = FOTO_W; this.lienzo.height = FOTO_H;
		this.lctx = this.lienzo.getContext('2d', { willReadFrequently: true });
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { this.error = 'SIN CAMARA'; return; }
		navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false })
			.then(s => { if (!this.vivo) { s.getTracks().forEach(t => t.stop()); return; } this.flujo = s; this.video.srcObject = s; return this.video.play(); })
			.catch(() => { this.error = 'SIN PERMISO'; });
	}
	terminar() { this.vivo = false; if (this.flujo) this.flujo.getTracks().forEach(t => t.stop()); this.flujo = null; }
	pausar() { this.terminar(); }
	reanudar() { if (!this.flujo) this.empezar(); }
	leer() {
		const v = this.video;
		if (!v || v.readyState < 2 || !v.videoWidth) return;
		const pw = v.videoWidth, ph = v.videoHeight;
		let rw = pw, rh = pw * FOTO_H / FOTO_W;
		if (rh > ph) { rh = ph; rw = ph * FOTO_W / FOTO_H; }
		this.lctx.drawImage(v, (pw - rw) / 2, (ph - rh) / 2, rw, rh, 0, 0, FOTO_W, FOTO_H);
		const d = this.lctx.getImageData(0, 0, FOTO_W, FOTO_H).data;
		for (let y = 0; y < FOTO_H; y++) for (let x = 0; x < FOTO_W; x++) {
			const u = this.espejo ? FOTO_W - 1 - x : x, j = (y * FOTO_W + u) * 4;
			let l = (d[j] * 0.3 + d[j + 1] * 0.59 + d[j + 2] * 0.11) / 255;
			l = (l - 0.5) * this.contraste + 0.5 + this.luz;
			const n = l * 3 + (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 - 0.5;
			this.foto[y * FOTO_W + x] = 3 - Math.max(0, Math.min(3, Math.floor(n + 0.5)));
		}
		this.hay = true;
	}
	paso(ap, nu) {
		this.tic++;
		if (this.flash > 0) this.flash--;
		if (this.congelada > 0) this.congelada--;
		if (this.aviso > 0) this.aviso--;
		if (this.tic % 2 === 0) this.leer();
		if ((nu & B.A) && this.hay && !this.congelada) { this.quieta.set(this.foto); this.flash = 4; this.congelada = 75; this.guardarla = true; this.texto = 'GUARDADA'; this.aviso = 75; }
		if (nu & B.B) { this.espejo = !this.espejo; this.texto = this.espejo ? 'ESPEJO' : 'SIN ESPEJO'; this.aviso = 50; }
		if (nu & (B.arriba | B.abajo)) {
			this.luz = Math.max(-0.4, Math.min(0.4, this.luz + ((nu & B.arriba) ? 0.05 : -0.05)));
			const v = Math.round(this.luz * 20); this.texto = 'LUZ ' + (v >= 0 ? '+' : '') + v; this.aviso = 50;
		}
		if (nu & (B.izq | B.der)) {
			this.contraste = Math.max(0.6, Math.min(2.2, this.contraste + ((nu & B.der) ? 0.1 : -0.1)));
			this.texto = 'CONTRASTE ' + Math.round(this.contraste * 10); this.aviso = 50;
		}
	}
	dibujar(px) {
		for (let y = 0; y < GB_H; y++) for (let x = 0; x < GB_W; x++) px[y * GB_W + x] = ((x + y) % 4 === 0) ? 2 : 1;
		const ox = 16, oy = 10;
		gbCaja(px, ox - 3, oy - 3, FOTO_W + 6, FOTO_H + 6, 3);
		gbCaja(px, ox - 1, oy - 1, FOTO_W + 2, FOTO_H + 2, 0);
		if (!this.hay) { gbCaja(px, ox, oy, FOTO_W, FOTO_H, 0); gbCentrado(px, this.error || (((this.tic / 20) | 0) % 2 ? 'PRENDIENDO...' : ''), 60, 3); }
		else { const f = this.congelada ? this.quieta : this.foto; for (let y = 0; y < FOTO_H; y++) px.set(f.subarray(y * FOTO_W, (y + 1) * FOTO_W), (oy + y) * GB_W + ox); }
		gbCaja(px, 0, 128, GB_W, 16, 3);
		gbTexto(px, 'A FOTO  B ESPEJO', 4, 132, 0);
		if (this.guardarla) { this.guardarla = false; this.guardar(px); }
		if (this.flash) px.fill(0, oy * GB_W, (oy + FOTO_H) * GB_W);
		if (this.aviso && (this.aviso > 20 || ((this.tic / 4) | 0) % 2)) {
			const w = this.texto.length * 6 + 8;
			gbCaja(px, (GB_W - w) >> 1, oy + 4, w, 12, 3);
			gbCentrado(px, this.texto, oy + 7, 0);
		}
	}
	/* la foto es la pantalla entera agrandada x4 sin suavizar (sin la franja de abajo); se descarga como PNG */
	guardar(px) {
		const k = 4, W = GB_W * k, H = (GB_H - 16) * k, c = document.createElement('canvas');
		c.width = W; c.height = H;
		const ctx = c.getContext('2d'), im = ctx.createImageData(W, H), d = im.data;
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = VERDES[px[((y / k) | 0) * GB_W + ((x / k) | 0)] & 3], j = (y * W + x) * 4; d[j] = v[0]; d[j + 1] = v[1]; d[j + 2] = v[2]; d[j + 3] = 255; }
		ctx.putImageData(im, 0, 0);
		c.toBlob(b => {
			if (!b) return;
			const nombre = 'maquinita-' + new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '') + '.png';
			const archivo = typeof File === 'function' ? new File([b], nombre, { type: 'image/png' }) : null;
			if (archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) { navigator.share({ files: [archivo] }).catch(() => {}); return; }
			const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
			setTimeout(() => URL.revokeObjectURL(a.href), 4000);
		}, 'image/png');
	}
}

/* ---------- Control: muestra qué botones llegan (de la pantalla o de un control conectado) ---------- */
class PruebaControl {
	empezar() { this.tic = 0; this.ap = 0; }
	terminar() {}
	paso(ap) { this.tic++; this.ap = ap; }
	dibujar(px) {
		const a = this.ap, m = mando.estado();
		gbCaja(px, 0, 0, GB_W, 16, 3);
		gbCentrado(px, 'PRUEBA DEL CONTROL', 4, 0);
		const lleno = (x, y, w, h, si) => { gbCaja(px, x, y, w, h, 3); if (!si) gbCaja(px, x + 1, y + 1, w - 2, h - 2, 0); };
		lleno(30, 44, 12, 12, a & B.arriba); lleno(30, 68, 12, 12, a & B.abajo);
		lleno(18, 56, 12, 12, a & B.izq); lleno(42, 56, 12, 12, a & B.der);
		lleno(114, 48, 16, 16, a & B.A); lleno(94, 62, 16, 16, a & B.B);
		gbTexto(px, 'A', 120, 66, 3); gbTexto(px, 'B', 100, 80, 3);
		lleno(56, 96, 20, 6, a & B.elegir); lleno(84, 96, 20, 6, a & B.inicio);
		gbCentrado(px, m ? 'CONTROL CONECTADO' : 'SIN CONTROL', 112, m ? 3 : 2);
		gbCentrado(px, m ? m.slice(0, 26).toUpperCase() : 'ENCHUFALO O APARIALO', 124, 2);
	}
}
