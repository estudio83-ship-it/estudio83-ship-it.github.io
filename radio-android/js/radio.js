/* La radio: emisoras, sonido (con el efecto AM de Radio HD) y la página 1 (el disco de aluminio). */
'use strict';
const SL = 'https://playerservices.streamtheworld.com/api/livestream-redirect/';
const BANDAS = [
	['AM', [['Rivadavia', SL + 'RIVADAVIA.mp3', '630 kHz'], ['Radio 10', 'https://radio10.stweb.tv/radio10/live/playlist.m3u8', '710 kHz'],
		['AM750', SL + 'AM750.mp3', '750 kHz'], ['Mitre', SL + 'AM790_56AAC.aac', '790 kHz'],
		['Nacional', 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad1', '870 kHz'], ['La Red', SL + 'LA_RED_AM910AAC.aac', '910 kHz'],
		['Origen', 'https://stream.audiostreamhub.com/am950', '950 kHz'], ['Splendid', SL + 'AM990.mp3', '990 kHz']]],
	['FM', [['Nacional Rock', 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad39', '93.7 MHz'], ['Metro', SL + 'METRO.mp3', '95.1 MHz'],
		['Rock & Pop', SL + 'ROCKANDPOPAAC.aac', '95.9 MHz'], ['Blue', SL + 'BLUE_FM_100_7AAC.aac', '100.7 MHz'],
		['Aspen', SL + 'ASPEN.mp3', '102.3 MHz'], ['Urbana Play', 'https://live-ar1.cdnrad.com/hls/radio-285/live.m3u8', '104.3 MHz'],
		['Milenium', 'https://sonicpanel.hostradios.com/8002/stream', '106.7 MHz']]],
	['WEB', [['Jaus90', 'https://stream.zeno.fm/e1th9vchbvxuv', 'web'], ['BBC World', 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service', 'web'],
		['VRT Radio 1', 'https://icecast.vrtcdn.be/radio1-high.mp3', 'web'], ['NPO Radio 1', 'https://icecast.omroep.nl/radio1-bb-mp3', 'web'],
		['Soma 80s', 'https://ice5.somafm.com/u80s-128-mp3', 'web'], ['Soma Indie', 'https://ice5.somafm.com/indiepop-128-mp3', 'web']]],
	['WT', [['White Noise', '', '']]],
];
const FM_INICIO = 3;   /* al pasar a FM arranca en Blue */
const SLEEP = 60 * 60 * 1000;

const radio = {
	on: false, b: 0, pos: [6, FM_INICIO, 0, 0], sleepEnd: 0, sleepAuto: false, vol: 0.8, msg: '', aviso: 0, alCambiar: [],
	emisoras() { return BANDAS[this.b][1]; },
	actual() { return this.emisoras()[this.pos[this.b]]; },
	banda() { return BANDAS[this.b][0]; },
	wt() { return this.banda() === 'WT'; },
	estadoLed() { if (!this.on) return 0; if (this.sleepEnd || this.wt()) return 2; return 1; },
	avisar() { this.alCambiar.forEach(f => f()); },
};
(() => {
	const p = guardado.leer('pos', null), b = guardado.leer('banda', 0);
	if (Array.isArray(p)) p.forEach((v, i) => { if (i < 4 && v >= 0 && v < BANDAS[i][1].length) radio.pos[i] = v; });
	if (b >= 0 && b < BANDAS.length) radio.b = b;
	radio.vol = guardado.leer('vol', 0.8);
})();
function guardarRadio() { guardado.poner('pos', radio.pos); guardado.poner('banda', radio.b); }
const nombreImagen = n => 'nombre_' + n.toLowerCase().replace(/[^a-z0-9]+/g, '_');

/* ---------- sonido ---------- */
const audio = new Audio();
audio.preload = 'none'; audio.crossOrigin = 'anonymous'; audio.setAttribute('playsinline', '');
let actx = null, amIn, limpioIn, soplido, salida, medidor, conEfecto = true, plano = null, hls = null, hlsP = null, ruidoEl = null, ultimoAvance = 0, ultimoT = -1, reintentos = 0;
const FILTRO = { AM: true, FM: false, WEB: false, WT: false };
function armarAudio() {
	if (actx) return;
	try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; return; }
	actx.onstatechange = () => { if (radio.on && actx.state !== 'running') actx.resume().catch(() => {}); };
	salida = actx.createGain(); salida.gain.value = radio.vol;
	medidor = actx.createAnalyser(); medidor.fftSize = 512;
	salida.connect(medidor); salida.connect(actx.destination);
	const len = actx.sampleRate * 2, nb = actx.createBuffer(1, len, actx.sampleRate), d = nb.getChannelData(0);
	let l = 0;
	for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; l = .97 * l + .03 * w; d[i] = (w * .35 + l * 2.2) * (Math.random() < .002 ? 3 : 1); }
	const n = actx.createBufferSource(); n.buffer = nb; n.loop = true;
	const nf = actx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1600; nf.Q.value = .6;
	soplido = actx.createGain(); soplido.gain.value = 0; n.connect(nf).connect(soplido).connect(salida); n.start();
	amIn = actx.createGain(); amIn.gain.value = 0;
	limpioIn = actx.createGain(); limpioIn.gain.value = 0; limpioIn.connect(salida);
	const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 280;
	const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000; lp.Q.value = .9;
	const cuerpo = actx.createBiquadFilter(); cuerpo.type = 'peaking'; cuerpo.frequency.value = 900; cuerpo.gain.value = 2;
	const trim = actx.createGain(); trim.gain.value = .5;
	const sat = actx.createWaveShaper(); const c = new Float32Array(1024);
	for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; c[i] = Math.tanh(x * 1.2) / Math.tanh(1.2); }
	sat.curve = c;
	const makeup = actx.createGain(); makeup.gain.value = 1.8;
	const comp = actx.createDynamicsCompressor(); comp.threshold.value = -22; comp.ratio.value = 5;
	const fade = actx.createGain(); fade.gain.value = 1;
	const lfo = actx.createOscillator(); lfo.frequency.value = .06; const lg = actx.createGain(); lg.gain.value = .16; lfo.connect(lg).connect(fade.gain); lfo.start();
	amIn.connect(hp).connect(lp).connect(cuerpo).connect(trim).connect(sat).connect(makeup).connect(comp).connect(fade).connect(salida);
	try { const src = actx.createMediaElementSource(audio); src.connect(amIn); src.connect(limpioIn); } catch (e) { actx = null; }
}
function rutear() {
	if (!actx) return;
	const am = radio.on && !radio.wt() && FILTRO[radio.banda()] && conEfecto, t = actx.currentTime;
	amIn.gain.setTargetAtTime(am ? 1 : 0, t, .05);
	limpioIn.gain.setTargetAtTime(radio.on && !radio.wt() && !am ? 1 : 0, t, .05);
	soplido.gain.setTargetAtTime(am ? .012 : 0, t, .08);
}
/* si una emisora no deja pasar su audio por el efecto (CORS), suena directo */
audio.addEventListener('error', () => { if (!radio.on || !conEfecto || !audio.getAttribute('src')) return; conEfecto = false; rutear(); sinEfecto(); });
function sinEfecto() {
	pararPlano();
	plano = new Audio(); plano.setAttribute('playsinline', ''); plano.volume = radio.vol; plano.src = radio.actual()[1];
	plano.play().catch(() => {});
	if (actx) { amIn.gain.value = 0; limpioIn.gain.value = 0; soplido.gain.value = 0; }
}
function pararPlano() { if (plano) { try { plano.pause(); plano.removeAttribute('src'); plano.load(); } catch (e) {} plano = null; } }
function ruidoUrl() {
	const sr = 22050, n = sr * 12, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
	const w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
	w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
	v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
	let l = 0; const fade = sr * .5;
	for (let i = 0; i < n; i++) {
		l = .55 * l + .45 * (Math.random() * 2 - 1);
		const g = i > n - fade ? (n - i) / fade : i < fade ? i / fade : 1;
		v.setInt16(44 + i * 2, Math.round(l * .42 * 32767 * (.5 + .5 * g)), true);
	}
	return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}
function cargarHls() {
	if (hlsP) return hlsP;
	hlsP = new Promise(r => {
		if (window.Hls) return r(true);
		const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js';
		sc.onload = () => r(!!(window.Hls && Hls.isSupported())); sc.onerror = () => r(false); document.head.appendChild(sc);
	});
	return hlsP;
}
function parar() {
	if (hls) { try { hls.destroy(); } catch (e) {} hls = null; }
	pararPlano();
	if (ruidoEl) ruidoEl.pause();
	audio.pause(); audio.removeAttribute('src'); audio.load();
	rutear();
}
async function tocar() {
	parar();
	armarAudio(); if (actx && actx.state === 'suspended') actx.resume();
	conEfecto = true; rutear();
	ultimoAvance = Date.now(); ultimoT = -1;
	if (radio.wt()) {
		if (!ruidoEl) { ruidoEl = new Audio(ruidoUrl()); ruidoEl.loop = true; ruidoEl.setAttribute('playsinline', ''); }
		ruidoEl.volume = radio.vol; ruidoEl.play().catch(() => {});
		decir(''); return;
	}
	decir('Conectando…');
	const s = radio.actual();
	if (/\.m3u8/.test(s[1]) && !audio.canPlayType('application/vnd.apple.mpegurl')) {
		if (!(await cargarHls()) || s !== radio.actual()) return;
		hls = new Hls(); hls.loadSource(s[1]); hls.attachMedia(audio);
	} else audio.src = s[1];
	audio.play().catch(() => {});
}
function decir(t) { radio.msg = t; radio.avisar(); }
function encender(v) {
	if (v === radio.on) return;
	radio.on = v;
	if (!v) { radio.sleepEnd = 0; radio.sleepAuto = false; parar(); decir(''); }
	else { reintentos = 0; tocar(); sleepDeWT(); }
	mediaSesion(); radio.avisar();
}
const playPausa = () => encender(!radio.on);
function sleepDeWT() { if (radio.on && radio.wt() && !radio.sleepEnd) { radio.sleepEnd = Date.now() + SLEEP; radio.sleepAuto = true; } }
function paso(d) {
	if (radio.wt()) return;
	const n = radio.emisoras().length;
	radio.pos[radio.b] = (radio.pos[radio.b] + d + n) % n;
	guardarRadio();
	if (radio.on) { reintentos = 0; tocar(); }
	mediaSesion(); radio.avisar(); pagina1.mostrar();
}
function cambiarBanda() {
	radio.b = (radio.b + 1) % BANDAS.length;
	if (radio.sleepAuto && !radio.wt()) { radio.sleepEnd = 0; radio.sleepAuto = false; }
	sleepDeWT();
	if (radio.banda() === 'FM') radio.pos[radio.b] = FM_INICIO;
	guardarRadio();
	if (radio.on) { reintentos = 0; tocar(); }
	mediaSesion(); radio.avisar(); pagina1.mostrar();
}
function alternarSleep() {
	if (radio.sleepEnd) radio.sleepEnd = 0;
	else { encender(true); radio.sleepEnd = Date.now() + SLEEP; }
	radio.sleepAuto = false;
	if (navigator.vibrate) navigator.vibrate(25);
	radio.avisar(); pagina1.titilar();
}
function ponerVolumen(v) {
	radio.vol = Math.min(1, Math.max(0, v));
	guardado.poner('vol', radio.vol);
	if (salida) salida.gain.setTargetAtTime(radio.vol, actx.currentTime, .03);
	if (plano) plano.volume = radio.vol;
	if (ruidoEl) ruidoEl.volume = radio.vol;
}
/* controles de la pantalla bloqueada */
function mediaSesion() {
	if (!('mediaSession' in navigator)) return;
	const s = radio.actual();
	try {
		navigator.mediaSession.metadata = new MediaMetadata({ title: s[0], artist: 'Radio B&O · ' + radio.banda() + (s[2] && s[2] !== 'web' ? ' ' + s[2] : ''), album: 'Radio B&O',
			artwork: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] });
	} catch (e) {}
	navigator.mediaSession.playbackState = radio.on ? 'playing' : 'paused';
}
if ('mediaSession' in navigator) {
	const h = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) {} };
	h('play', () => encender(true)); h('pause', () => encender(false)); h('stop', () => encender(false));
	h('nexttrack', () => paso(1)); h('previoustrack', () => paso(-1));
}
/* que siga sonando con el teléfono bloqueado: si el sistema la pausa, se retoma; bloqueada suena directa */
function seguir() {
	if (!radio.on) return;
	if (actx && actx.state !== 'running') actx.resume().catch(() => {});
	const el = radio.wt() ? ruidoEl : (plano || audio);
	if (el && el.paused && el.getAttribute('src')) el.play().catch(() => {});
}
audio.addEventListener('pause', () => { if (radio.on) setTimeout(seguir, 300); });
let bloqueada = false;
document.addEventListener('visibilitychange', () => {
	if (!radio.on || radio.wt()) return;
	if (document.hidden) {
		if (plano) return;
		bloqueada = true;
		if (hls) { try { hls.destroy(); } catch (e) {} hls = null; }
		sinEfecto(); try { audio.pause(); } catch (e) {}
	} else if (bloqueada) { bloqueada = false; tocar(); }
});
document.addEventListener('visibilitychange', seguir);
/* cada segundo: sleep, "Conectando…" y reconexión si la radio se trabó */
setInterval(() => {
	const ahora = Date.now();
	if (radio.sleepEnd && ahora >= radio.sleepEnd) { encender(false); return; }
	if (!radio.on || radio.wt()) return;
	const el = plano || audio, t = el.currentTime || 0;
	if (t > ultimoT + 0.01 && ultimoT >= 0) { ultimoAvance = ahora; reintentos = 0; if (radio.msg) decir(''); }
	else if (ahora - ultimoAvance > 1500 && !radio.msg) decir('Conectando…');
	if (ahora - ultimoAvance > 20000) {
		if (reintentos < 5) { reintentos++; tocar(); }
		else if (radio.msg !== 'No se puede conectar. Probá la siguiente.') decir('No se puede conectar. Probá la siguiente.');
	}
	ultimoT = t;
	seguir();
}, 1000);

/* ¿está sonando de verdad? y el nivel para los vúmetros (real si el audio pasa por el efecto; si no, uno parecido) */
const vu = { base: 0.5, fase: 0, datos: null };
function nivelAudio() {
	if (!radio.on) return [0, 0];
	if (actx && medidor && !plano && (radio.wt() ? false : true) && conEfecto) {
		if (!vu.datos) vu.datos = new Float32Array(medidor.fftSize);
		medidor.getFloatTimeDomainData(vu.datos);
		let s = 0; for (let i = 0; i < vu.datos.length; i++) s += vu.datos[i] * vu.datos[i];
		const rms = Math.sqrt(s / vu.datos.length);
		if (rms > 0.0005) {
			const db = 20 * Math.log10(rms), v = Math.max(0, (db + 42) / 42);
			return [v * (0.92 + Math.random() * 0.08), v * (0.92 + Math.random() * 0.08)];
		}
	}
	if (!radio.wt() && Date.now() - ultimoAvance > 2500) return [0, 0];
	vu.fase += 1 / 30;
	vu.base += (0.55 + 0.12 * Math.sin(vu.fase * 0.7) + 0.08 * Math.sin(vu.fase * 2.3) - vu.base) * 0.1;
	const golpe = Math.random() < 0.12 ? 0.25 * Math.random() : 0;
	const k = 0.35 + 0.75 * radio.vol;
	if (radio.wt()) return [0.62 * k + (Math.random() - .5) * .04, 0.62 * k + (Math.random() - .5) * .04];
	return [(vu.base + golpe + (Math.random() - 0.5) * 0.16) * k, (vu.base + golpe * (0.7 + 0.5 * Math.random()) + (Math.random() - 0.5) * 0.16) * k];
}

/* ---------- página 1: el disco ---------- */
const COLOR_LED = ['#3a3a37', '#ff7a14', '#a942e9'];
const pagina1 = (() => {
	const p = pag.elementos[0];
	const fondo = div(p, 0, 0, 320, S.H, 'background:#111 url(img/fondo.jpg) center/cover no-repeat');
	const claro = div(p, 0, 0, 320, S.H, 'background:linear-gradient(101deg,#c3c3c5 0%,#d1d1d3 45%,#dfdee1 75%,#e3e1e4 100%)');
	const oscuro = div(p, 0, 0, 320, S.H, 'background:#050506;opacity:0');
	const top = arribaDisco();
	const todo = div(p, 30, top, 260, 26 + 260 + 48 + 32);
	const led = div(todo, 126, 0, 8, 8, 'border-radius:4px;transition:background .4s,box-shadow .4s');
	/* el arco de LEDs del volumen */
	const arco = div(todo, 0, 0, 260, 300, 'opacity:0;pointer-events:none');
	const nivel = [];
	for (let i = 0; i < 31; i++) {
		const a = Math.PI / 2 * i / 30, cx = 130 + 141 * Math.sin(a), cy = 26 + 130.5 - 141 * Math.cos(a);
		nivel.push(div(arco, cx - 2, cy - 2, 4, 4, 'border-radius:2px'));
	}
	const corona = div(todo, -34, 26 - 34, 328, 328, 'opacity:0;pointer-events:none;border-radius:50%;background:radial-gradient(circle,rgba(236,242,255,0) 38%,rgba(236,242,255,.34) 39.6%,rgba(236,242,255,.12) 43%,rgba(236,242,255,0) 50%)');
	const sombra = div(todo, 0, 26, 260, 260, 'border-radius:50%;transition:box-shadow 3s');
	const disco = div(todo, 0, 26, 260, 260, 'background:url(img/disco.png) center/100% 100%');
	const discoNoche = lienzo(260, 260, todo, 0, 26);
	discoNoche.style.opacity = 0;
	const d = img('disco');
	const tenir = () => { const c = discoNoche.ctx; c.drawImage(d, 0, 0, 260, 260); c.globalCompositeOperation = 'source-atop'; c.fillStyle = G(16, 17, 19, 0.9); c.fillRect(0, 0, 260, 260); c.globalCompositeOperation = 'source-over'; };
	if (d.complete) tenir(); else d.addEventListener('load', tenir);
	const aroNoche = div(todo, 130 - 47.6, 26 + 130.5 - 47.6, 95.2, 95.2, 'border-radius:50%;border:.75px solid rgba(236,242,255,.38);box-shadow:0 0 3px rgba(236,242,255,.3);opacity:0;pointer-events:none');
	/* letras: de día grabadas; de noche iluminadas desde adentro */
	const letra = () => { const i = document.createElement('img'); i.className = 'abs'; i.draggable = false; todo.appendChild(i); return i; };
	const banda = letra(), nombre = letra(), bandaN = letra(), nombreN = letra();
	for (const n of [bandaN, nombreN]) { n.style.filter = 'brightness(0) invert(1) drop-shadow(0 0 1.5px rgba(236,242,255,.9)) drop-shadow(0 0 5px rgba(236,242,255,.35))'; n.style.opacity = 0; }
	const zona = (x, y, w, h, f) => { const z = div(todo, x, y, w, h); boton(z, f); return z; };
	zona(0, 26 + 22, 260, 50, cambiarBanda);
	const ant = zona(19, 26 + 110, 40, 40, () => paso(-1)), sig = zona(260 - 19 - 40, 26 + 110, 40, 40, () => paso(1));
	const flechas = [];
	for (const [z, n] of [[ant, 'flecha_ant'], [sig, 'flecha_sig']]) {
		const a = document.createElement('img'); a.src = 'img/' + n + '.png'; a.className = 'abs'; a.style.cssText += 'left:10px;top:10px;width:20px;height:20px'; a.draggable = false; z.appendChild(a);
		const b = a.cloneNode(); b.style.filter = bandaN.style.filter; b.style.opacity = 0; z.appendChild(b);
		flechas.push([a, b]);
	}
	const msg = div(todo, 10, 26 + 260 + 48, 240, 32, 'color:#777;font-size:12px;text-align:center;line-height:16px;pointer-events:none');
	/* el botón del centro: tocar = prender/apagar; mantener = sleep */
	const centro = div(todo, 85, 26 + 85, 90, 90, 'border-radius:45px');
	let armado = 0, t1 = 0;
	boton(centro, () => { if (armado === 1) alternarSleep(); else if (!armado) playPausa(); }, {
		abajo: () => { armado = 0; centro.style.background = 'rgba(0,0,0,.08)'; t1 = setTimeout(() => { armado = 1; centro.style.background = ''; if (navigator.vibrate) navigator.vibrate(15); }, 700); },
		arriba: () => { clearTimeout(t1); centro.style.background = ''; },
		cancelado: () => { clearTimeout(t1); armado = 2; centro.style.background = ''; },
	});
	/* el volumen: girar el dedo alrededor del disco (sentido del reloj = más fuerte; una vuelta = medio volumen) */
	let giro = null, apagarArco = 0;
	const cx = 30 + 130, cy = top + 26 + 130.5;
	pag.reserva.push((pg, x, y) => pg === 0 && Math.hypot(x - cx, y - cy) < 150 && Math.hypot(x - cx, y - cy) > 50);
	p.addEventListener('pointerdown', e => {
		const q = enEscenario(e), r = Math.hypot(q.x - cx, q.y - cy);
		if (r <= 50 || r >= 150 || giro) return;
		giro = { id: e.pointerId, a: Math.atan2(q.y - cy, q.x - cx), movio: 0 };
	});
	p.addEventListener('pointermove', e => {
		if (!giro || e.pointerId !== giro.id) return;
		const q = enEscenario(e), a = Math.atan2(q.y - cy, q.x - cx);
		let dlt = a - giro.a;
		if (dlt > Math.PI) dlt -= 2 * Math.PI;
		if (dlt < -Math.PI) dlt += 2 * Math.PI;
		giro.a = a; giro.movio += Math.abs(dlt);
		if (giro.movio < 0.12) return;
		gesto.paginando = false; gesto.recien = performance.now();
		ponerVolumen(radio.vol + dlt / (2 * Math.PI) * 0.5);
		clearTimeout(apagarArco); arco.style.transition = 'none'; arco.style.opacity = 1; pintarArco();
	});
	const soltar = e => { if (giro && e.pointerId === giro.id) { if (giro.movio >= 0.12) { gesto.recien = performance.now(); apagarArco = setTimeout(() => { arco.style.transition = 'opacity .8s'; arco.style.opacity = 0; }, 1000); } giro = null; } };
	p.addEventListener('pointerup', soltar); p.addEventListener('pointercancel', soltar);
	function pintarArco() {
		const e = radio.estadoLed(), color = COLOR_LED[e || 1], n = radio.vol > 0 ? Math.max(1, Math.round(radio.vol * 31)) : 0;
		const apagado = noche.n < 0.5 ? '#b0b0ac' : '#3a3a37';
		nivel.forEach((l, i) => { const on = i < n; l.style.background = on ? color : apagado; l.style.boxShadow = on ? `0 0 3.5px ${color}` : 'none'; });
	}
	/* esquinas: arriba a la izquierda = modo claro; abajo a la izquierda = modo noche */
	const esqClaro = div(p, 0, 0, 64, 64), esqNoche = div(p, 0, S.H - 64, 64, 64);
	boton(esqClaro, () => pedirModo(0)); boton(esqNoche, () => pedirModo(1));

	function poner(i, nombreImg, arriba) {
		const im = img(nombreImg);
		const listo = () => { const w = im.naturalWidth / 2, h = im.naturalHeight / 2; i.src = im.src; i.style.width = w + 'px'; i.style.height = h + 'px'; i.style.left = Math.round((260 - w) / 2) + 'px'; i.style.top = (26 + (typeof arriba === 'function' ? arriba(h) : arriba)) + 'px'; };
		if (im.complete && im.naturalWidth) listo(); else im.addEventListener("load", listo, { once: true });
	}
	function etiquetas() {
		poner(banda, 'banda_' + radio.banda().toLowerCase(), 42); poner(bandaN, 'banda_' + radio.banda().toLowerCase(), 42);
		const n = nombreImagen(radio.actual()[0]), y = h => Math.round(130.5 + (48 + 130) / 2 - h / 2);
		poner(nombre, n, y); poner(nombreN, n, y);
	}
	function pintarLed() {
		const e = radio.estadoLed();
		const c = e ? COLOR_LED[e] : (noche.n < 0.5 ? '#b0b0ac' : '#3a3a37');
		led.style.background = c;
		led.style.boxShadow = e ? `0 0 7px 1px ${c}aa, 0 0 22px 6px ${c}44` : 'none';
	}
	function aplicarNoche(n, dura) {
		const t = dura > 0 ? `opacity ${dura}s ease-in-out` : 'none';
		for (const el of [claro, oscuro, discoNoche, corona, aroNoche, banda, nombre, bandaN, nombreN, ...flechas.flat()]) el.style.transition = t;
		claro.style.opacity = 1 - n; oscuro.style.opacity = 0.78 * n; discoNoche.style.opacity = 0.9 * n;
		corona.style.opacity = n; aroNoche.style.opacity = n;
		for (const el of [banda, nombre]) el.style.opacity = 1 - n;
		for (const el of [bandaN, nombreN]) el.style.opacity = n;
		flechas.forEach(([a, b]) => { a.style.opacity = 1 - n; b.style.opacity = n; });
		sombra.style.boxShadow = `${-3 * (1 - n)}px ${5 + 3 * n}px ${2 * (13 - 2.5 * n)}px rgba(0,0,0,${0.16 + 0.34 * n})`;
		msg.style.color = n > 0.5 ? '#888' : '#777';
		pintarLed();
	}
	noche.alCambiar.push(aplicarNoche);
	radio.alCambiar.push(() => { pintarLed(); msg.textContent = radio.msg; });
	let ultimo = '';
	return {
		mostrar() {
			const clave = radio.b + '/' + radio.pos[radio.b];
			if (clave === ultimo) return;
			ultimo = clave;
			for (const el of [nombre, nombreN]) { el.style.transition = 'opacity .18s'; el.style.opacity = 0; }
			setTimeout(() => { etiquetas(); for (const el of [nombre, nombreN]) el.style.transition = 'opacity .2s'; nombre.style.opacity = 1 - noche.n; nombreN.style.opacity = noche.n; }, 180);
			setTimeout(() => { banda.style.opacity = 1 - noche.n; bandaN.style.opacity = noche.n; }, 0);
		},
		titilar() { led.animate([{ opacity: 1 }, { opacity: .15 }, { opacity: 1 }], { duration: 320, iterations: 2 }); },
		empezar() { etiquetas(); ultimo = radio.b + '/' + radio.pos[radio.b]; pintarLed(); },
	};
})();
