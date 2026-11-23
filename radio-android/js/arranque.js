/* Arranque: arma las páginas, pone la noche según la hora y deja la app lista para instalarse. */
'use strict';
pagina1.empezar();
tocadiscos.empezar();
relojes.empezar();
consola.empezar();
ponerNoche(0);
moverCarril(-pag.actual * 320, false);
pag.alCambiar.forEach(f => f(pag.actual));
pintarPuntos();
setInterval(() => ponerNoche(2), 20000);
if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) mando.arrancar();
/* si el teléfono gira o cambia el alto (barra del navegador), se reacomoda la escala sin rearmar nada */
addEventListener('resize', () => {
	const w = innerWidth, h = innerHeight, esc = Math.min(w / 320, h / S.H);
	app.style.transform = `translateX(${Math.round((w - 320 * esc) / 2)}px) scale(${esc})`;
	S.esc = esc;
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
	/* 1.45: si llega una versión nueva, la página se recarga una vez sola para mostrarla */
	const habia = !!navigator.serviceWorker.controller;
	let recargada = false;
	navigator.serviceWorker.addEventListener('controllerchange', () => { if (habia && !recargada) { recargada = true; location.reload(); } });
	navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
}
horizontal.revisar();
