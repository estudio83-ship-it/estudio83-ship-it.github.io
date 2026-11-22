/* El control: cualquier gamepad que Android reconozca (USB o Bluetooth; el de PS3/PS4/Xbox sirven).
   PS / HOME = ir a la consola y volver; en la consola juega; en las otras páginas maneja la radio:
   START prende/apaga, L1/R1 cambian de radio, arriba/abajo el volumen e izquierda/derecha cambian de página. */
'use strict';
const mando = (() => {
	const M = { L1: 256, R1: 512, PS: 1024 };
	let ahora = 0, nombre = '', andando = false;
	function leer() {
		const lista = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
		const g = lista[0];
		if (!g) { nombre = ''; return 0; }
		nombre = g.id.replace(/\(.*?\)/g, '').trim() || 'CONTROL';
		const b = i => g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5);
		let n = 0;
		if (b(12)) n |= B.arriba; if (b(13)) n |= B.abajo; if (b(14)) n |= B.izq; if (b(15)) n |= B.der;
		if (b(0) || b(3)) n |= B.A;        /* X / triángulo (A / Y) */
		if (b(1) || b(2)) n |= B.B;        /* círculo / cuadrado (B / X) */
		if (b(8)) n |= B.elegir; if (b(9)) n |= B.inicio;
		if (b(4)) n |= M.L1; if (b(5)) n |= M.R1; if (b(16)) n |= M.PS;
		const lx = g.axes[0] || 0, ly = g.axes[1] || 0;
		if (lx < -0.5) n |= B.izq; else if (lx > 0.5) n |= B.der;
		if (ly < -0.5) n |= B.arriba; else if (ly > 0.5) n |= B.abajo;
		return n;
	}
	function apreto(n) {
		if (n & M.PS) { irAPagina(pag.actual === 3 ? 0 : 3); return; }
		if (pag.actual === 3) { consola.mandoApreto(n & 0xFF); return; }
		if (n & B.inicio) playPausa();
		if (n & M.R1) paso(1);
		if (n & M.L1) paso(-1);
		if (n & B.arriba) { ponerVolumen(radio.vol + 1 / 16); tocadiscos.mostrarVolumen(radio.vol); }
		if (n & B.abajo) { ponerVolumen(radio.vol - 1 / 16); tocadiscos.mostrarVolumen(radio.vol); }
		if (n & B.izq) irAPagina(pag.actual - 1);
		if (n & B.der) irAPagina(pag.actual + 1);
	}
	function vuelta() {
		const n = leer(), nuevos = n & ~ahora;
		ahora = n;
		if (nuevos) apreto(nuevos);
		if (nombre) requestAnimationFrame(vuelta); else andando = false;
	}
	const arrancar = () => { if (!andando) { andando = true; requestAnimationFrame(vuelta); } };
	addEventListener('gamepadconnected', arrancar);
	addEventListener('gamepaddisconnected', () => { ahora = 0; });
	return {
		botones8: () => (andando ? ahora & 0xFF : 0),
		estado: () => nombre,
		arrancar,
	};
})();
