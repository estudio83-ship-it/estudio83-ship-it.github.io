/* Guarda la app para abrirla sin conexión (las radios y el clima siempre van por internet). */
const VERSION = 'rbo-web-1.46';
const ARCHIVOS = [
  './', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png',
  'js/arranque.js',
  'js/base.js',
  'js/consola.js',
  'js/juegos.js',
  'js/mando.js',
  'js/pixeles.js',
  'js/radio.js',
  'js/relojes.js',
  'js/standby.js',
  'js/tablero.js',
  'js/tocadiscos.js',
  'img/banda_am.png',
  'img/banda_fm.png',
  'img/banda_web.png',
  'img/banda_wt.png',
  'img/disco.png',
  'img/flecha_ant.png',
  'img/flecha_sig.png',
  'img/fondo.jpg',
  'img/nombre_am750.png',
  'img/nombre_aspen.png',
  'img/nombre_bbc_world.png',
  'img/nombre_blue.png',
  'img/nombre_jaus90.png',
  'img/nombre_la_red.png',
  'img/nombre_metro.png',
  'img/nombre_milenium.png',
  'img/nombre_mitre.png',
  'img/nombre_nacional.png',
  'img/nombre_nacional_rock.png',
  'img/nombre_npo_radio_1.png',
  'img/nombre_origen.png',
  'img/nombre_radio_10.png',
  'img/nombre_rivadavia.png',
  'img/nombre_rock_pop.png',
  'img/nombre_soma_80s.png',
  'img/nombre_soma_indie.png',
  'img/nombre_splendid.png',
  'img/nombre_urbana_play.png',
  'img/nombre_vrt_radio_1.png',
  'img/nombre_white_noise.png',
  'img/reloj0_esfera.png',
  'img/reloj0_frente.png',
  'img/reloj0_hora.png',
  'img/reloj0_hora_sombra.png',
  'img/reloj0_minuto.png',
  'img/reloj0_minuto_sombra.png',
  'img/reloj0_segundo.png',
  'img/reloj0_segundo_sombra.png',
  'img/reloj1_chico.png',
  'img/reloj1_chico_sombra.png',
  'img/reloj1_esfera.png',
  'img/reloj1_frente.png',
  'img/reloj1_hora.png',
  'img/reloj1_hora_sombra.png',
  'img/reloj1_minuto.png',
  'img/reloj1_minuto_sombra.png',
  'img/reloj2_esfera.png',
  'img/reloj2_frente.png',
  'img/reloj2_hora.png',
  'img/reloj2_hora_sombra.png',
  'img/reloj2_minuto.png',
  'img/reloj2_minuto_sombra.png',
  'img/reloj2_segundo.png',
  'img/reloj2_segundo_sombra.png',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* 1.45: primero lo nuevo de internet (así cada versión se ve enseguida) y, sin conexión, lo guardado */
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   /* radios, clima, hls: directo */
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
