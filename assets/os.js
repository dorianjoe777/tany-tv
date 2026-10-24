/* ============================================================
   SNOOPY TV · lógica del sistema
   Navegación D-pad, reproductor, canales, ajustes y reposo.
   ============================================================ */

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const FOCUSABLE = '.nav-tab,.card,.chip,.btn,.ch-card,.shop-card,.c-card,.set-row';

const State = {
  screen: 'home',
  heroIndex: 0,
  heroTimer: null,
  current: null,
  player: null,
  playerTimer: null,
  channel: null,
  idleTimer: null,
  settings: {
    theme: 'auto',
    city: 0,
    units: 'C',
    motion: true,
    sound: true,
    cursor: true,
    clock24: true,
    shelf: true,
  },
};

/* ============================================================
   DEFS GLOBALES (textura y trazo dibujado a mano)
   ============================================================ */
(function injectDefs() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'global-defs');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;pointer-events:none';
  svg.innerHTML = `<defs>
    <filter id="snoopy-wobble" x="-12%" y="-12%" width="124%" height="124%">
      <feTurbulence type="fractalNoise" baseFrequency="0.026" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>`;
  document.body.appendChild(svg);
})();

/* ============================================================
   RELOJ Y CLIMA
   ============================================================ */
function tickClock() {
  const d = new Date();
  const h24 = d.getHours();
  const el = $('#clock');
  if (!el) return;
  if (State.settings.clock24) {
    el.textContent = String(h24).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  } else {
    const h = h24 % 12 || 12;
    el.textContent = h + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (h24 < 12 ? 'AM' : 'PM');
  }
  const de = $('#date');
  if (de) {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    de.textContent = dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()];
  }
  const ic = $('#idle-clock');
  if (ic) {
    ic.textContent = String(h24).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
}
setInterval(tickClock, 10000);
tickClock();

const WEATHER = {
  tarde:  ['<path class="wx-sun" d="M22 22 a11 11 0 1 0 .1 0 M22 4v6 M22 34v6 M4 22h6 M34 22h6 M9 9l4 4 M31 31l4 4"/><path class="wx-cloud" d="M18 40c-7 0-11-4-11-9s5-9 11-8c2-6 8-9 14-7 5 5 4 12 0 15 5 0 8 4 8 8"/>', 'Tarde despejada sobre la colina'],
  dia:    ['<path class="wx-sun" d="M22 22 a11 11 0 1 0 .1 0 M22 4v6 M22 34v6 M4 22h6 M34 22h6 M9 9l4 4 M31 31l4 4"/><path class="wx-cloud" d="M18 40c-7 0-11-4-11-9s5-9 11-8c2-6 8-9 14-7 5 5 4 12 0 15 5 0 8 4 8 8"/>', 'Cielo despejado, día perfecto'],
  noche:  ['<circle class="wx-sun" cx="24" cy="18" r="9"/><path class="wx-cloud" d="M16 42c-6 0-10-4-10-8s5-8 10-7c2-5 7-8 12-6 5 4 4 10 0 13 4 0 7 3 7 8"/>', 'Noche cerrada. Buenas noches'],
  nieve:  ['<path class="wx-cloud" d="M16 42c-6 0-10-4-10-8s5-8 10-7c2-5 7-8 12-6 5 4 4 10 0 13 4 0 7 3 7 8"/><path class="wx-snow" d="M32 8v10M27 11l10 4M37 11l-10 4"/>', 'Nieve en la colina. Manta advisable'],
};

/* ============================================================
   MOTOR DE NAVEGACIÓN (mando a distancia)
   ============================================================ */
function isVisible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden';
}
function rowOf(el) { return el ? el.closest('[data-nav-row]') : null; }
function itemsOf(row) {
  if (!row) return [];
  return $$(FOCUSABLE, row).filter(el => !el.closest('.screen') || el.closest('.screen').classList.contains('is-active'));
}
function focusEl(el) {
  if (!el) return;
  if (State.current) State.current.classList.remove('is-focused');
  State.current = el;
  el.classList.add('is-focused');
  try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  keepInView(el);
  layoutRails();
  moveCursorTo(el);
  notifyDepth(el);
}

/* Riel en 3D: el elemento enfocado queda centrado y de frente;
   los vecinos se giran y retroceden, como una estanteria en perspectiva. */
function layoutRails() {
  $$('.rail-viewport').forEach(vp => {
    const rail = vp.querySelector('.rail-items');
    if (!rail) return;
    const items = itemsOf(rail);
    if (!items.length) return;
    const scr = rail.closest('.screen');
    if (!scr || !scr.classList.contains('is-active')) return;
    let idx = items.indexOf(State.current);
    if (idx < 0) idx = 0;
    const vw = vp.clientWidth;
    const card = items[idx];
    const center = card.offsetLeft + card.offsetWidth / 2;
    rail.style.transform = 'translate3d(' + Math.round(vw / 2 - center) + 'px,0,0)';
    items.forEach((el, i) => {
      const off = i - idx;
      const abs = Math.abs(off);
      let t, o = 1;
      if (abs === 0) t = 'translateZ(120px) scale(1.04)';
      else if (abs === 1) t = 'translateZ(46px) scale(.92) rotateY(' + (-off * 16) + 'deg)';
      else if (abs === 2) { t = 'translateZ(-16px) scale(.84) rotateY(' + (-off * 21) + 'deg)'; o = .92; }
      else { t = 'translateZ(-70px) scale(.76) rotateY(' + (-off * 24) + 'deg)'; o = .5; }
      el.style.transform = t;
      el.style.opacity = o;
      el.style.zIndex = 100 - abs;
    });
  });
}

/* Desplaza solo el contenedor que corresponde: el riel en horizontal,
   la rejilla en vertical. Nunca mueve la pantalla completa. */
function keepInView(el) {
  const box = el.closest('.grid, .continue-grid, .channel-grid, .shop-grid, .settings-menu');
  if (box) {
    const er = el.getBoundingClientRect(), br = box.getBoundingClientRect();
    if (er.top < br.top + 8) box.scrollTop -= (br.top + 8 - er.top);
    else if (er.bottom > br.bottom - 8) box.scrollTop += (er.bottom - (br.bottom - 8));
  }
}

/* Avisa al motor de profundidad (assets/depth.js) de que el foco ha cambiado. */
function notifyDepth(el) {
  try {
    document.dispatchEvent(new CustomEvent('depth:focus', {
      detail: { hasFocus: !!el, focusedRect: el ? el.getBoundingClientRect() : null }
    }));
  } catch (e) { /* sin motor de profundidad: no pasa nada */ }
}
function moveCursorTo(el) {
  const cur = $('#cursor');
  if (!cur || !State.settings.cursor) return;
  const r = el.getBoundingClientRect();
  const s = State.stageScale || 1;
  const cx = (r.left + r.width - 6 - (State.stageX || 0)) / s;
  const cy = (r.top + r.height + 4 - (State.stageY || 0)) / s;
  cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
}

/* El lienzo es siempre 1280x720 y se escala a la pantalla real. */
function fitStage() {
  const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  const x = Math.round((window.innerWidth - 1280 * s) / 2);
  const y = Math.round((window.innerHeight - 720 * s) / 2);
  State.stageScale = s; State.stageX = x; State.stageY = y;
  const st = document.documentElement.style;
  st.setProperty('--ss', s);
  st.setProperty('--sx', x + 'px');
  st.setProperty('--sy', y + 'px');
}
function activeRows() {
  const scr = $('.screen.is-active');
  const rows = [];
  if (scr) rows.push(...$$('[data-nav-row]', scr));
  const nav = $('#topnav');
  if (nav) rows.push(nav);
  return rows.filter(r => r.getAttribute('data-nav-row') !== 'top');
}
function moveHoriz(dir) {
  const row = rowOf(State.current);
  const items = itemsOf(row);
  if (!items.length) return;
  const i = items.indexOf(State.current);
  const next = items[i + dir];
  if (next) focusEl(next);
}
function moveVert(dir) {
  const cur = State.current;
  if (!cur) return;
  const curRow = rowOf(cur);
  const cr = cur.getBoundingClientRect();
  const ccy = cr.top + cr.height / 2, ccx = cr.left + cr.width / 2;
  let best = null, bestDy = Infinity, bestDx = Infinity;

  for (const row of activeRows()) {
    if (row === curRow || (curRow && (row.contains(curRow) || curRow.contains(row)))) continue;
    const items = itemsOf(row);
    if (!items.length) continue;
    const rr = row.getBoundingClientRect();
    const rowCy = rr.top + rr.height / 2;
    if (dir < 0 && rowCy >= ccy - 6) continue;
    if (dir > 0 && rowCy <= ccy + 6) continue;
    const dy = Math.abs(rowCy - ccy);
    if (dy > bestDy) continue;
    let cand = null, cdx = Infinity;
    for (const it of items) {
      const ir = it.getBoundingClientRect();
      const dx = Math.abs((ir.left + ir.width / 2) - ccx);
      if (dx < cdx) { cdx = dx; cand = it; }
    }
    if (cand && (dy < bestDy - 4 || (Math.abs(dy - bestDy) <= 4 && cdx < bestDx))) {
      best = cand; bestDy = dy; bestDx = cdx;
    }
  }
  if (best) focusEl(best);
}
function activate(el) {
  if (!el) return;
  if (el.matches('.nav-tab')) { switchScreen(el.dataset.screen); return; }
  if (el.matches('.card[data-item], .c-card[data-item]')) {
    lastItemId = el.dataset.item;
    openPlayer(el.dataset.item);
    return;
  }

  if (el.matches('.ch-card[data-channel]')) {
    lastChannelId = el.dataset.channel;
    openChannel(el.dataset.channel);
    return;
  }
  if (el.matches('.shop-card')) { toast('Llamando al 1-800-SNOOPY… ' + el.dataset.name); return; }
  if (el.matches('.set-row')) { cycleSetting(el); return; }
  if (el.matches('[data-action]')) { doAction(el.dataset.action); return; }
  if (el.matches('.chip')) { selectChip(el); return; }
}

/* ============================================================
   PANTALLAS
   ============================================================ */
function switchScreen(name) {
  State.screen = name;
  $$('.screen').forEach(s => s.classList.toggle('is-active', s.dataset.screen === name));
  $$('.nav-tab').forEach(t => t.classList.toggle('is-active', t.dataset.screen === name));
  const scr = $('.screen[data-screen="' + name + '"]');
  if (scr) scr.scrollTop = 0;
  const first = scr ? $$(FOCUSABLE, scr).filter(isVisible)[0] : null;
  focusEl(first || $('.nav-tab[data-screen="' + name + '"]'));
  if (name === 'home') startHeroRotation(); else stopHeroRotation();
}

function doAction(action) {
  if (action === 'play-hero') openPlayer(HERO_ITEMS[State.heroIndex].id);
  if (action === 'info-hero') {
    const it = HERO_ITEMS[State.heroIndex];
    toast(it.title + ' · ' + it.year + ' · ' + it.dur + ' min');
  }
}

/* ============================================================
   INICIO: hero + rieles
   ============================================================ */
const HERO_ITEMS = [MOVIES[0], MOVIES[7], MOVIES[2], SERIES[3], MOVIES[4], SERIES[0]];
const THOUGHTS = [
  'Buen Grief… otra vez el mismo dibujo.',
  'Snoopy dice que la tele se ve mejor desde la casa del perro.',
  '¿Sabías que en Peanuts el bosque no tiene árbol? El árbol es Charlie Brown.',
  'Woodstock dice que la app está lista. Luego se durmió.',
  'Charlie Brown: «No entiendo nada, pero me gusta».',
];

function renderHome() {
  renderHeroOnly();

  const rails = [
    { idx: '00', title: 'Tus apps', note: 'Lo que tienes en la TV', kind: 'shelf', items: [] },
    { idx: '01', title: 'Continuar viendo', note: 'Snoopy se quedó dormido', kind: 'continue',
      items: CONTINUE.map(c => continueCard(c)) },
    { idx: '02', title: 'Películas', note: 'Para ver en el sofá', kind: 'movie',
      items: MOVIES.map(m => cardHTML(m)) },
    { idx: '03', title: 'Series', note: 'Capítulos sin fin', kind: 'series',
      items: SERIES.map(m => cardHTML(m)) },
    { idx: '04', title: 'Recomendado por Lucy', note: 'El booth de la Clarita', kind: 'rec',
      items: [MOVIES[3], MOVIES[7], SERIES[1], MOVIES[5], SERIES[5], MOVIES[9]].map(m => cardHTML(m)) },
    { idx: '05', title: 'Mundo de Snoopy', note: 'Seis canales, un perro', kind: 'chan',
      items: CHANNELS.map(c => channelMini(c)) },
  ];

  $('#home-rails').innerHTML = rails.map(r => `
    <div class="rail">
      <div class="rail-head">
        <span class="rail-idx">${esc(r.idx)}</span>
        <span class="rail-title">${esc(r.title)}</span>
        <span class="rail-note">${esc(r.note)}</span>
        <span class="rail-line"></span>
      </div>
      ${r.kind === 'shelf'
        ? '<div class="shelf" id="shelf"></div>'
        : `<div class="rail-viewport"><div class="rail-items" data-nav-row="rail-${r.kind}">${r.items.join('')}</div></div>`}
    </div>`).join('');

  bindCards();
  renderShelf();
}

function cardHTML(item, extraClass) {
  const badge = item.badge ? `<span class="card-badge ${/Nuevo|LIVE/i.test(item.badge) ? 'new' : ''}">${esc(item.badge)}</span>` : '';
  return `<article class="card ${extraClass || ''}" tabindex="-1" data-item="${item.id}">
    <div class="card-art">${posterHTML(item)}${badge}</div>
    <div class="card-meta">
      <div class="card-sub">${item.year} · ${item.dur} min</div>
    </div>
  </article>`;
}

function continueCard(c) {
  const item = MOVIES.concat(SERIES).find(x => x.id === c.ref) || MOVIES[0];
  return `<article class="c-card" tabindex="-1" data-item="${item.id}">
    <div class="c-art">${posterHTML(item)}</div>
    <div class="c-scrim"></div>
    <span class="c-left">${c.left} min</span>
    <div class="c-info">
      <div class="c-title">${esc(item.title)}</div>
      <div class="c-sub">${item.year} / ${esc(item.genres[0])} / quedan ${c.left} min</div>
      <div class="c-note">${esc(c.note)}</div>
    </div>
    <div class="c-bar"><i style="width:${Math.round(c.prog * 100)}%"></i></div>
  </article>`;
}

function channelMini(c) {
  return `<article class="ch-card" tabindex="-1" data-channel="${c.id}"
      style="height:13rem">
    <div class="ch-art">${channelArt(c.hue)}</div>
    <div class="ch-body">
      <div class="ch-num">${esc(c.num)}</div>
      <div class="ch-name">${esc(c.name)}</div>
    </div>
  </article>`;
}

/* ============================================================
   PELÍCULAS / SERIES / CONTINUAR
   ============================================================ */
function renderMovies() {
  const genres = ['Todas', 'Clásico', 'Navidad', 'Musical', 'Aventura', 'Animación'];
  $('#movie-chips').innerHTML = genres.map((g, i) =>
    `<button class="chip ${i === 0 ? 'is-on' : ''}" tabindex="-1" data-chip="${esc(g)}">${esc(g)}</button>`).join('');
  $('#movie-grid').innerHTML = MOVIES.map(m => cardHTML(m)).join('');
  bindCards();
}
function selectChip(chip) {
  $$('#movie-chips .chip').forEach(c => c.classList.remove('is-on'));
  chip.classList.add('is-on');
  const g = chip.dataset.chip;
  const list = g === 'Todas' ? MOVIES : MOVIES.filter(m => m.genres.includes(g));
  $('#movie-grid').innerHTML = list.map(m => cardHTML(m)).join('');
  bindCards();
  toast(g === 'Todas' ? 'Mostrando todas las películas' : 'Filtro: ' + g);
}
function renderSeries() {
  $('#series-grid').innerHTML = SERIES.map(m => cardHTML(m)).join('');
  bindCards();
}
function renderContinue() {
  $('#continue-grid').innerHTML = CONTINUE.map(continueCard).join('');
  bindCards();
}
function renderChannels() {
  $('#channel-grid').innerHTML = CHANNELS.map(c => `
    <article class="ch-card" tabindex="-1" data-channel="${c.id}" style="height:13.5rem">
      <div class="ch-art">${channelArt(c.hue)}</div>
      <div class="ch-body">
        <div class="ch-num">${esc(c.num)}</div>
        <div class="ch-name">${esc(c.name)}</div>
        <div class="ch-desc">${esc(c.desc)}</div>
      </div>
    </article>`).join('');
}
function renderShop() {
  $('#shop-grid').innerHTML = SHOP.map(s => `
    <article class="shop-card" tabindex="-1" data-name="${esc(s.name)}">
      <div class="shop-icon"><svg viewBox="40 110 220 210">${MOTIFS[s.icon] || MOTIFS.snoopy}</svg></div>
      <div class="shop-name">${esc(s.name)}</div>
      <div class="shop-price">${esc(s.price)}</div>
      <div class="shop-note">${esc(s.note)}</div>
    </article>`).join('');
}
function renderSettings() {
  const s = State.settings;
  const rows = [
    { k: 'city', label: 'Ciudad', sub: 'Clima y atardecer', value: (CITIES[s.city] || CITIES[0]).name },
    { k: 'units', label: 'Temperatura', sub: 'Grados', value: s.units },
    { k: 'theme', label: 'Cielo del barrio', sub: 'Auto: sigue al atardecer real',
      value: s.theme === 'auto' ? 'Automatico' : ({ tarde: 'Tarde', dia: 'Dia', noche: 'Noche', nieve: 'Nieve' }[s.theme]) },
    { k: 'shelf', label: 'Estanteria de apps', sub: 'Las apps de la TV', value: s.shelf ? 'Si' : 'No' },
    { k: 'motion', label: 'Animaciones', sub: 'Snoopy se mueve mucho', value: s.motion ? 'Sí' : 'No' },
    { k: 'sound', label: 'Piano de Schroeder', sub: 'Ambiente de fondo', value: s.sound ? 'Sí' : 'No' },
    { k: 'cursor', label: 'Cursor Woodstock', sub: 'El que deja hojitas', value: s.cursor ? 'Sí' : 'No' },
    { k: 'clock24', label: 'Reloj de 24 horas', sub: 'Militar, como Charlie Brown', value: s.clock24 ? 'Sí' : 'No' },
    { k: 'clear', label: 'Vaciar "Continuar viendo"', sub: 'Advertencia: ya estaba vacío', value: 'Pulsar' },
  ];
  $('#settings-menu').innerHTML = rows.map(r => `
    <button class="set-row" tabindex="-1" data-setting="${r.k}">
      <span><span class="s-label">${esc(r.label)}</span><br><span class="s-sub">${esc(r.sub)}</span></span>
      <span class="set-value">${esc(r.value)}</span>
    </button>`).join('');
}
/* Cambia el cielo del barrio: tarde / dia / noche / nieve. */
function cycleTheme() {
  const order = ['auto', 'tarde', 'dia', 'noche', 'nieve'];
  State.settings.theme = order[(order.indexOf(State.settings.theme) + 1) % order.length];
  if (State.settings.theme === 'auto') applyAutoTheme();
  else document.body.dataset.theme = State.settings.theme;
  applyWeather();
  renderSettings();
  const v = $('#settings-menu .set-row [data-setting="theme"] .set-value');
  if (v) toast('Cielo: ' + v.textContent);
}

function cycleSetting(el) {
  const k = el.dataset.setting;
  const s = State.settings;
  if (k === 'theme') {
    const order = ['auto', 'tarde', 'dia', 'noche', 'nieve'];
    State.settings.theme = order[(order.indexOf(State.settings.theme) + 1) % order.length];
    if (State.settings.theme === 'auto') applyAutoTheme();
    else document.body.dataset.theme = State.settings.theme;
    applyWeather();
    renderSettings();
  } else if (k === 'city') {
    State.settings.city = (State.settings.city + 1) % CITIES.length;
    loadWeather(true);
    renderSettings();
    toast('Clima de ' + (CITIES[State.settings.city] || CITIES[0]).name);
  } else if (k === 'units') {
    State.settings.units = State.settings.units === 'C' ? 'F' : 'C';
    renderWeather();
    renderSettings();
  } else if (k === 'shelf') {
    State.settings.shelf = !State.settings.shelf;
    renderShelf();
    renderSettings();
  } else if (k === 'motion') {
    s.motion = !s.motion;
    document.body.classList.toggle('reduced-motion', !s.motion);
    renderSettings();
  } else if (k === 'sound') {
    s.sound = !s.sound;
    Audio_.setEnabled(s.sound);
    renderSettings();
    toast(s.sound ? 'Schroeder empieza a tocar' : 'Silencio en la sala');
  } else if (k === 'cursor') {
    s.cursor = !s.cursor;
    document.body.classList.toggle('cursor-hidden', !s.cursor);
    renderSettings();
  } else if (k === 'clock24') {
    s.clock24 = !s.clock24;
    tickClock();
    renderSettings();
  } else if (k === 'clear') {
    toast('Snoopy ya lo había borrado antes.');
    renderSettings();
  }
  const again = $(`[data-setting="${k}"]`);
  if (again) focusEl(again);
}

/* ============================================================
   REPRODUCTOR
   ============================================================ */
function findItem(id) {
  return MOVIES.concat(SERIES).find(x => x.id === id) || MOVIES[0];
}
function openPlayer(id) {
  const item = findItem(id);
  State.player = { item, t: 0, playing: true, speed: 8 };
  const total = item.dur * 60;
  State.player.total = total;
  $('#player-scene').innerHTML = `<div class="scene-anim">${posterHTML(item)}</div>`;
  $('#player-title').textContent = item.title;
  $('#player-total').textContent = fmtTime(total);
  $('#player-toggle').textContent = '❚❚ pausa';
  $('#overlay-player').hidden = false;
  $('#now-playing').classList.add('playing');
  $('.np-text').textContent = 'Reproduciendo · ' + item.title;
  startPlayerTick();
  focusEl($('#player-toggle'));
}
function startPlayerTick() {
  clearInterval(State.playerTimer);
  State.playerTimer = setInterval(() => {
    const p = State.player;
    if (!p) return;
    if (p.playing) {
      p.t += p.speed;
      if (p.t >= p.total) { p.t = p.total; togglePlay(); }
    }
    const pct = Math.min(100, (p.t / p.total) * 100);
    $('#player-fill').style.width = pct + '%';
    $('.pb-knob').style.left = pct + '%';
    $('#player-elapsed').textContent = fmtTime(p.t);
    const left = Math.max(0, p.total - p.t);
    $('#player-left').textContent = 'faltan ' + fmtTime(left);
  }, 1000);
}
function togglePlay() {
  const p = State.player;
  if (!p) return;
  p.playing = !p.playing;
  $('#player-toggle').textContent = p.playing ? '❚❚ pausa' : '▶ seguir';
}
function closePlayer() {
  clearInterval(State.playerTimer);
  State.player = null;
  $('#overlay-player').hidden = true;
  $('#now-playing').classList.remove('playing');
  $('.np-text').textContent = 'Nada reproduciéndose. Snoopy está dormido.';
  const back = $(`.card[data-item="${lastItemId}"]`) || $('.nav-tab.is-active');
  if (back) focusEl(back);
}
function fmtTime(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

/* ============================================================
   CANALES (Snoopy's World)
   ============================================================ */
function openChannel(id) {
  const ch = CHANNELS.find(c => c.id === id) || CHANNELS[0];
  State.channel = ch;
  $('#channel-stage').innerHTML = `<div class="chan-scene hue-${ch.hue}">${channelScene(ch.hue)}</div>`;
  $('#channel-name').textContent = ch.name;
  const tick = $('#ticker-track');
  const items = [
    'SNOOPY NEWS · ' + ch.desc,
    'El perro está despierto · ' + ch.num,
    'Woodstock informa: nada importante ha ocurrido',
    'Snoopy TV ·programming con snoopy de fondo',
    'Charlie Brown: «Good grief»',
    'El cometa sigue en el aire',
  ];
  tick.innerHTML = (items.concat(items)).map(i => `<span>★ ${esc(i)}</span>`).join('');
  $('#overlay-channel').hidden = false;
  toast('Canal: ' + ch.name);
}
function closeChannel() {
  State.channel = null;
  $('#overlay-channel').hidden = true;
  const back = $(`.ch-card[data-channel="${lastChannelId}"]`) || $('.nav-tab.is-active');
  if (back) focusEl(back);
}
function nextChannel(dir) {
  const idx = CHANNELS.findIndex(c => c.id === (State.channel || {}).id);
  const next = CHANNELS[(idx + dir + CHANNELS.length) % CHANNELS.length];
  openChannel(next.id);
}

/* ============================================================
   ARTE DE LOS CANALES (SVG animado)
   ============================================================ */
function channelArt(hue) {
  const bg = { sepia: '#6b4a2a', desert: '#c98a3a', cool: '#141414', booth: '#7a3a5a', sky: '#3a6a9a', field: '#4a7a3a' }[hue] || '#2a2a2a';
  return `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="225" fill="${bg}"/>
    <circle cx="330" cy="42" r="30" fill="#f8f2e1" opacity=".25"/>
    <path d="M0 190 C90 165 150 200 240 180 C300 167 350 190 400 175 L400 225 L0 225Z" fill="#1a1610" opacity=".35"/>
  </svg>`;
}
function channelScene(hue) {
  const S = {
    sepia: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="scene-svg">
        <rect width="1600" height="900" fill="#8a6a3a"/>
        <rect width="1600" height="620" fill="#a8844a"/>
        <g class="sun-disc"><circle cx="1180" cy="230" r="150" fill="#e8c878" opacity=".85"/></g>
        <g class="searchlight searchlight-1"><path d="M0 0 L900 300 L900 480 L0 700Z" fill="#f3e2b0" opacity=".16"/></g>
        <g class="searchlight searchlight-2"><path d="M1600 0 L700 320 L700 500 L1600 700Z" fill="#f3e2b0" opacity=".13"/></g>
        <g class="clouds-ch">
          <ellipse cx="300" cy="180" rx="180" ry="46" fill="#c9a86a" opacity=".7"/>
          <ellipse cx="820" cy="120" rx="130" ry="36" fill="#c9a86a" opacity=".6"/>
        </g>
        <g class="ace-plane">
          <g transform="translate(0,0)">
            <path d="M-260 40 h210 q34 0 34 -24 q0 -16 -22 -22 l-80 -14 l-36 -56 q-12 -20 -34 -18 l-14 4 l22 60 l-64 -12 l-26 -30 l-16 4 l20 44 l-38 12 l-24 -20 l-14 4 l14 42 q4 14 22 10z"
              fill="#c9b48a" stroke="#2a1c10" stroke-width="9" stroke-linejoin="round"/>
            <circle cx="-170" cy="-4" r="20" fill="#f3c34d" stroke="#2a1c10" stroke-width="8"/>
            <path d="M-40 10 q44 -14 50 12 q-6 24 -50 16z" fill="#c9b48a" stroke="#2a1c10" stroke-width="8"/>
            <circle cx="-300" cy="46" r="16" fill="#2a1c10"/>
          </g>
        </g>
        <g class="ace-zoom"><path d="M-260 40 h210 q34 0 34 -24 q0 -16 -22 -22 l-80 -14 l-36 -56 q-12 -20 -34 -18 l-14 4 l22 60 l-64 -12 l-26 -30 l-16 4 l20 44 l-38 12 l-24 -20 l-14 4 l14 42 q4 14 22 10z"
              fill="#c9b48a" stroke="#2a1c10" stroke-width="9" stroke-linejoin="round"/></g>
        <path d="M0 700 C300 660 620 740 940 700 C1200 668 1400 720 1600 690 L1600 900 L0 900Z" fill="#6b5228"/>
        <text x="120" y="120" font-family="Bangers,cursive" font-size="64" fill="#f8f2e1" opacity=".55">THE FLYING ACE</text>
        <text x="120" y="170" font-family="Patrick Hand,cursive" font-size="34" fill="#f8f2e1" opacity=".4">Canal de exterminio de-voz... ¡SNOOPY!</text>
      </svg>`,

    desert: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="scene-svg">
        <rect width="1600" height="520" fill="#e8b96a"/>
        <circle cx="300" cy="180" r="90" fill="#fff0c0" opacity=".8"/>
        <path d="M0 520 C300 460 520 560 820 500 C1100 445 1380 540 1600 480 L1600 900 L0 900Z" fill="#c98a3a"/>
        <path d="M0 660 C360 610 700 700 1040 640 C1300 598 1450 660 1600 630 L1600 900 L0 900Z" fill="#a4682a"/>
        <g class="camel-walk" transform="translate(760 520)">
          <path d="M-140 90 q0 -66 40 -92 q10 -66 66 -66 q54 0 63 60 q33 12 33 51 q0 36 -39 48z"
            fill="#d9a05a" stroke="#3a2410" stroke-width="10" stroke-linejoin="round"/>
          <path d="M-86 90 v56 M34 90 v56 M-14 90 v56 M64 90 v56" stroke="#3a2410" stroke-width="13" stroke-linecap="round"/>
          <path d="M52 -8 q39 -9 51 12 l-9 21 q-24 -12 -45 -12z" fill="#d9a05a" stroke="#3a2410" stroke-width="9"/>
          <circle cx="74" cy="12" r="6" fill="#3a2410"/>
        </g>
        <g class="bomb bomb-1"><circle cx="0" cy="0" r="16" fill="#2a1c10"/><path d="M0 -16 v-14" stroke="#2a1c10" stroke-width="6"/></g>
        <g class="bomb bomb-2"><circle cx="0" cy="0" r="16" fill="#2a1c10"/><path d="M0 -16 v-14" stroke="#2a1c10" stroke-width="6"/></g>
        <g class="bomb bomb-3"><circle cx="0" cy="0" r="16" fill="#2a1c10"/><path d="M0 -16 v-14" stroke="#2a1c10" stroke-width="6"/></g>
        <text x="120" y="120" font-family="Bangers,cursive" font-size="64" fill="#3a2410" opacity=".7">SOPWITH CAMEL</text>
      </svg>`,

    cool: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="scene-svg">
        <rect width="1600" height="900" fill="#0d0d0f"/>
        <g class="spot spot-1"><path d="M800 0 L420 900 L1180 900Z" fill="#f8f2e1" opacity=".07"/></g>
        <g class="spot spot-2"><path d="M200 0 L40 900 L420 900Z" fill="#f8f2e1" opacity=".04"/></g>
        <g class="cool-glasses" transform="translate(800 420)">
          <path d="M-330 -70 h210 q52 0 52 56 q0 106 -100 106 h-58 q-96 0 -100 -106 q-6 -56 -4 -56z" fill="#1a1610" stroke="#f8f2e1" stroke-width="12"/>
          <path d="M330 -70 h210 q52 0 52 56 q0 106 -100 106 h-58 q-96 0 -100 -106 q-6 -56 -4 -56z" fill="#1a1610" stroke="#f8f2e1" stroke-width="12"/>
          <path d="M-68 -46 q68 -44 136 0" stroke="#f8f2e1" stroke-width="16" fill="none"/>
          <path d="M-250 -30 q56 -30 116 -8" stroke="#f8f2e1" stroke-width="9" fill="none" opacity=".7"/>
          <path d="M250 -30 q-56 -30 -116 -8" stroke="#f8f2e1" stroke-width="9" fill="none" opacity=".7"/>
        </g>
        <g class="cool-words">
          <text x="800" y="760" text-anchor="middle" font-family="Bangers,cursive" font-size="150" fill="#f8f2e1">JOE COOL</text>
        </g>
        <text x="120" y="120" font-family="Patrick Hand,cursive" font-size="40" fill="#f3c34d" opacity=".7">Snoopy con gafas. Nada mas hace falta.</text>
      </svg>`,

    booth: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="scene-svg">
        <rect width="1600" height="900" fill="#5a2a3a"/>
        <rect width="1600" height="900" fill="#7a3a5a" opacity=".6"/>
        <g class="booth">
          <path d="M420 250 h760 v420 h-760z" fill="#f0e7d0" stroke="#2a1c10" stroke-width="12"/>
          <path d="M380 250 L800 120 L1220 250Z" fill="#d9543f" stroke="#2a1c10" stroke-width="12" stroke-linejoin="round"/>
          <text x="800" y="330" text-anchor="middle" font-family="Bangers,cursive" font-size="70" fill="#2a1c10">PSYCHIC</text>
        </g>
        <g class="lucy">
          <circle cx="800" cy="470" r="58" fill="#f8f2e1" stroke="#2a1c10" stroke-width="10"/>
          <path d="M745 460 q-20 -80 55 -80 q75 0 55 80 q-10 -50 -55 -50 q-45 0 -55 50z" fill="#2a1c10"/>
          <circle cx="778" cy="470" r="7" fill="#2a1c10"/><circle cx="822" cy="470" r="7" fill="#2a1c10"/>
          <path d="M780 500 q20 16 40 0" stroke="#2a1c10" stroke-width="8" fill="none" stroke-linecap="round"/>
          <path d="M742 540 q58 -26 116 0 l40 180 h-196z" fill="#7aa7cd" stroke="#2a1c10" stroke-width="10" stroke-linejoin="round"/>
          <path d="M756 600 q44 -26 88 0" stroke="#f8f2e1" stroke-width="10" fill="none"/>
        </g>
        <g class="thought thought-1"><ellipse cx="1010" cy="300" rx="130" ry="86" fill="#f8f2e1" stroke="#2a1c10" stroke-width="8"/><text x="1010" y="312" text-anchor="middle" font-family="Patrick Hand,cursive" font-size="42" fill="#2a1c10">la respuesta es 7</text></g>
        <g class="thought thought-2"><ellipse cx="560" cy="250" rx="120" ry="78" fill="#f8f2e1" stroke="#2a1c10" stroke-width="8"/><text x="560" y="260" text-anchor="middle" font-family="Patrick Hand,cursive" font-size="38" fill="#2a1c10">pregunta tonto</text></g>
        <text x="120" y="130" font-family="Bangers,cursive" font-size="62" fill="#f8f2e1" opacity=".85">LUCY'S TELEPATHY TV</text>
      </svg>`,

    sky: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="scene-svg">
        <rect width="1600" height="900" fill="#3a6a9a"/>
        <rect width="1600" height="600" fill="#5f93c4" opacity=".55"/>
        <g class="wx-clouds">
          <ellipse cx="420" cy="180" rx="200" ry="52" fill="#f8f2e1" opacity=".85"/>
          <ellipse cx="1120" cy="300" rx="240" ry="60" fill="#f8f2e1" opacity=".7"/>
        </g>
        <g class="big-kite" transform="translate(1050 180)">
          <path d="M0 -130 L110 -30 L0 90 L-110 -30Z" fill="#f3c34d" stroke="#1a1610" stroke-width="12" stroke-linejoin="round"/>
          <path d="M0 -130 L110 -30 L0 90Z" fill="#d9543f" stroke="#1a1610" stroke-width="9"/>
          <path d="M0 90 v46" stroke="#1a1610" stroke-width="12" stroke-linecap="round"/>
          <path d="M0 136 q34 26 0 48 q-34 22 0 42" stroke="#1a1610" stroke-width="10" fill="none" stroke-linecap="round"/>
        </g>
        <path d="M0 700 C300 670 620 720 900 690 C1180 660 1400 700 1600 680 L1600 900 L0 900Z" fill="#6b8f4a"/>
        <g class="little-tree" transform="translate(340 690)">
          <path d="M0 0 v-160" stroke="#5a3a20" stroke-width="18" stroke-linecap="round"/>
          <path d="M0 -120 q-56 -28 -70 -76 M0 -96 q52 -22 68 -66 M0 -150 q-32 -40 -10 -84 M0 -140 q36 -36 16 -78"
            stroke="#5a3a20" stroke-width="11" fill="none" stroke-linecap="round"/>
        </g>
        <g class="forecast-card">
          <rect x="90" y="560" width="560" height="250" rx="18" fill="#f8f2e1" opacity=".92"/>
          <text x="130" y="640" font-family="Bangers,cursive" font-size="58" fill="#1a1610">PRONÓSTICO</text>
          <text x="130" y="700" font-family="Patrick Hand,cursive" font-size="40" fill="#3a4256">Viento: del este, con hojitas</text>
          <text x="130" y="760" font-family="Patrick Hand,cursive" font-size="40" fill="#3a4256">Cometa: probabilidad de despegue 70%</text>
        </g>
      </svg>`,

    field: `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="scene-svg">
        <rect width="1600" height="900" fill="#7fb0d8"/>
        <path d="M0 470 C400 440 900 480 1600 450 L1600 900 L0 900Z" fill="#7aa76a"/>
        <path d="M0 700 C500 670 1100 720 1600 690 L1600 900 L0 900Z" fill="#5f8f55"/>
        <g class="scoreboard">
          <rect x="1120" y="250" width="380" height="200" rx="14" fill="#2a1c10"/>
          <text x="1310" y="340" text-anchor="middle" font-family="Bangers,cursive" font-size="58" fill="#f3c34d">BUEN GRIEF</text>
          <text x="1310" y="420" text-anchor="middle" font-family="Bangers,cursive" font-size="48" fill="#f8f2e1">0 — 0</text>
        </g>
        <g class="fielders">
          <g class="fielder f1" transform="translate(420 640)"><circle cx="0" cy="-70" r="34" fill="#f8f2e1" stroke="#1a1610" stroke-width="8"/><path d="M-40 -30 h80 l16 90 h-112z" fill="#d9543f" stroke="#1a1610" stroke-width="8"/><path d="M-70 -20 q-30 -40 -8 -58" stroke="#1a1610" stroke-width="12" fill="none" stroke-linecap="round"/></g>
          <g class="fielder f2" transform="translate(980 690)"><circle cx="0" cy="-66" r="32" fill="#f8f2e1" stroke="#1a1610" stroke-width="8"/><path d="M-38 -28 h76 l14 84 h-104z" fill="#f3c34d" stroke="#1a1610" stroke-width="8"/><path d="M-62 -18 q-28 -36 -8 -52" stroke="#1a1610" stroke-width="12" fill="none" stroke-linecap="round"/></g>
        </g>
        <g class="fly-ball"><circle cx="0" cy="0" r="22" fill="#f8f2e1" stroke="#1a1610" stroke-width="8"/></g>
        <text x="120" y="130" font-family="Bangers,cursive" font-size="62" fill="#2a1c10" opacity=".8">CHARLIE BROWN'S BASEBALL</text>
      </svg>`,
  };
  return S[hue] || S.sepia;
}

/* ============================================================
   AUDIO: el piano de Schroeder
   ============================================================ */
const Audio_ = {
  ctx: null, master: null, timer: null, on: true, step: 0,
  notes: [261.63, 311.13, 392.00, 466.16, 523.25, 466.16, 392.00, 311.13],
  bass: [130.81, 155.56, 196.00, 164.81],
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2200;
    this.master.connect(lp); lp.connect(this.ctx.destination);
    this.timer = setInterval(() => this.tick(), 620);
  },
  play(freq, dur, vol, type) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'triangle'; o.frequency.value = freq;
    o2.type = 'sine'; o2.frequency.value = freq * 2.005;
    const g2 = this.ctx.createGain(); g2.gain.value = 0.25;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(this.master);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  },
  tick() {
    if (!this.on || !this.ctx) return;
    const i = this.step % this.notes.length;
    this.play(this.notes[i], 1.1, 0.16, 'triangle');
    if (this.step % 2 === 0) this.play(this.bass[(this.step / 2) % this.bass.length], 1.6, 0.10, 'sine');
    this.step++;
  },
  setEnabled(v) {
    this.on = v;
    this.init();
    if (!this.ctx) return;
    if (v && this.ctx.state === 'suspended') this.ctx.resume();
    this.master.gain.setTargetAtTime(v ? 0.5 : 0.0, this.ctx.currentTime, 0.4);
  },
};

function clickSound() {
  if (!Audio_.on) return;
  Audio_.init();
  if (!Audio_.ctx) return;
  Audio_.play(180, 0.09, 0.10, 'square');
}

/* ============================================================
   TOASTS
   ============================================================ */
let toastTimer = null;
function toast(msg) {
  const box = $('#toast');
  box.innerHTML = `<div class="toast-item">
    <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>${esc(msg)}</div>`;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 2600);
}

/* ============================================================
   HERO ROTATOR
   ============================================================ */
function startHeroRotation() {
  stopHeroRotation();
  State.heroTimer = setInterval(() => {
    if (!$('#screen-home').classList.contains('is-active')) return;
    State.heroIndex = (State.heroIndex + 1) % HERO_ITEMS.length;
    renderHeroOnly();
  }, 14000);
}
function stopHeroRotation() { clearInterval(State.heroTimer); State.heroTimer = null; }
/* El titulo del hero se encoge solo para que nunca desborde el bloque. */
function fitHeroTitle() {
  const el = $('#hero-title');
  if (!el) return;
  let size = 4.1, guard = 0;
  el.style.fontSize = size + 'rem';
  const maxH = () => parseFloat(getComputedStyle(el).fontSize) * 0.98 * 2.05;
  while (el.scrollHeight > maxH() && size > 1.8 && guard++ < 40) {
    size -= 0.15;
    el.style.fontSize = size + 'rem';
  }
}

function renderHeroOnly() {
  const h = HERO_ITEMS[State.heroIndex];
  $('#hero-art').innerHTML = posterHTML(h);
  $('#hero-title').textContent = h.title;
  $('#hero-meta').innerHTML = `<span>${h.year}</span><span>${h.dur} min</span><span>${h.genres.join(' · ')}</span>`;
  $('#hero-syn').textContent = h.syn;
  $('#thought span').textContent = THOUGHTS[State.heroIndex % THOUGHTS.length];
  fitHeroTitle();
}

/* ============================================================
   CLIMA · tiempo real con Open-Meteo (sin clave) y tema por atardecer
   ============================================================ */
const WX_CACHE = 'tany.wx.v1';

const WX_ICON = {
  sol: '<circle cx="16" cy="16" r="7"/><path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l3 3M23 23l3 3M26 6l-3 3M9 23l-3 3"/>',
  nube: '<path d="M9 22h13a6 6 0 0 0 .6-12A8 8 0 0 0 7 12a5 5 0 0 0 2 10z"/>',
  lluvia: '<path d="M9 19h13a6 6 0 0 0 .6-12A8 8 0 0 0 7 9a5 5 0 0 0 2 10z"/><path d="M11 23l-1 4M17 23l-1 4M23 23l-1 4"/>',
  nieve: '<path d="M9 19h13a6 6 0 0 0 .6-12A8 8 0 0 0 7 9a5 5 0 0 0 2 10z"/><path d="M10 24h.01M16 27h.01M22 24h.01M10 28h.01M22 28h.01"/>',
  niebla: '<path d="M9 16h13a6 6 0 0 0 .6-12A8 8 0 0 0 7 6a5 5 0 0 0 2 10z"/><path d="M5 21h22M8 26h16"/>',
  tormenta: '<path d="M9 18h13a6 6 0 0 0 .6-12A8 8 0 0 0 7 8a5 5 0 0 0 2 10z"/><path d="M17 20l-4 6h4l-2 5"/>',
};

function wxSvg(key) {
  return '<svg viewBox="0 0 32 32" class="wx-glyph">' + (WX_ICON[key] || WX_ICON.nube) + '</svg>';
}

function cityNow() {
  return CITIES[State.settings.city] || CITIES[0];
}

function wxUnit(temp) {
  if (temp == null) return '--';
  const v = State.settings.units === 'F' ? temp * 9 / 5 + 32 : temp;
  return Math.round(v) + '°';
}

function wxUrl(city) {
  return 'https://api.open-meteo.com/v1/forecast?latitude=' + city.lat + '&longitude=' + city.lon +
    '&current=temperature_2m,apparent_temperature,is_day,weather_code' +
    '&hourly=temperature_2m,weather_code' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset' +
    '&timezone=auto&forecast_days=6';
}

function parseWeather(j, city) {
  const cur = j.current || {}, hourly = j.hourly || {}, daily = j.daily || {};
  const now = Date.now();
  const hours = [];
  const times = hourly.time || [];
  for (let i = 0; i < times.length && hours.length < 8; i++) {
    const t = new Date(times[i]).getTime();
    if (t >= now - 30 * 60 * 1000) {
      hours.push({ t: times[i], temp: hourly.temperature_2m[i], code: hourly.weather_code[i] });
    }
  }
  const days = [];
  const dt = daily.time || [];
  for (let i = 0; i < dt.length; i++) {
    days.push({
      date: dt[i], code: daily.weather_code[i],
      max: daily.temperature_2m_max[i], min: daily.temperature_2m_min[i],
      sunrise: daily.sunrise ? daily.sunrise[i] : null,
      sunset: daily.sunset ? daily.sunset[i] : null
    });
  }
  return {
    city: city.name, temp: cur.temperature_2m, feels: cur.apparent_temperature,
    isDay: cur.is_day, code: cur.weather_code, hours: hours, days: days, updated: Date.now()
  };
}

function fallbackWeather(city) {
  return {
    city: city.name, temp: 14, feels: 13, isDay: 1, code: 2,
    hours: [], days: [], updated: Date.now(), offline: true
  };
}

async function loadWeather(force) {
  const city = cityNow();
  try {
    const raw = localStorage.getItem(WX_CACHE);
    const cached = raw ? JSON.parse(raw) : null;
    if (!force && cached && cached.city === city.name && Date.now() - cached.at < 9 * 60 * 1000) {
      State.weather = cached.data;
      renderWeather();
      applyAutoTheme();
      return;
    }
  } catch (e) { /* sin cache */ }

  try {
    const res = await fetch(wxUrl(city));
    if (!res.ok) throw new Error('http ' + res.status);
    State.weather = parseWeather(await res.json(), city);
    try {
      localStorage.setItem(WX_CACHE, JSON.stringify({ city: city.name, at: Date.now(), data: State.weather }));
    } catch (e) { /* sin almacenamiento */ }
    renderWeather();
    applyAutoTheme();
  } catch (e) {
    State.weather = fallbackWeather(city);
    renderWeather();
  }
}

/* El tema sigue al atardecer real de la ciudad. */
function applyAutoTheme() {
  if (State.settings.theme !== 'auto') return;
  const w = State.weather;
  let t = 'noche';
  const d = w && w.days && w.days[0];
  if (d && d.sunrise && d.sunset) {
    const now = new Date();
    const sr = new Date(d.sunrise), ss = new Date(d.sunset);
    if (now > sr && now < ss) t = now.getHours() >= 16 ? 'tarde' : 'dia';
  } else if (w && w.isDay) {
    t = 'dia';
  }
  document.body.dataset.theme = t;
  applyWeather();
}

function renderWeather() {
  const w = State.weather;
  if (!w) return;
  const info = weatherOf(w.code);
  const set = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
  set('#wx-temp', wxUnit(w.temp));
  set('#wx-label', info.label);
  set('#wx-city', w.city);
  const today = w.days && w.days[0];
  set('#wx-range', today ? wxUnit(today.min) + ' / ' + wxUnit(today.max) : '--');
  const glyph = $('#wx-glyph');
  if (glyph) glyph.innerHTML = wxSvg(info.icon);

  const chipT = $('#wx-temp-chip');
  if (chipT) chipT.textContent = wxUnit(w.temp);
  const chipG = $('#wx-glyph-chip');
  if (chipG) chipG.innerHTML = wxSvg(info.icon);

  const sr = $('#wx-sunrise'), ss = $('#wx-sunset');
  const hhmm = d => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (sr && today && today.sunrise) sr.textContent = hhmm(today.sunrise);
  if (ss && today && today.sunset) ss.textContent = hhmm(today.sunset);
  const bar = $('#wx-sun-bar');
  if (bar && today && today.sunrise && today.sunset) {
    const a = new Date(today.sunrise).getTime();
    const b = new Date(today.sunset).getTime();
    const n = Date.now();
    const p = Math.max(0, Math.min(1, (n - a) / (b - a)));
    bar.style.left = (p * 100) + '%';
    bar.style.opacity = (n >= a && n <= b) ? 1 : .25;
  }

  const strip = $('#wx-hours');
  if (strip) {
    strip.innerHTML = (w.hours || []).slice(0, 6).map((h, i) => {
      const hh = new Date(h.t).getHours();
      const label = i === 0 ? 'ahora' : String(hh).padStart(2, '0') + 'h';
      return '<span class="wx-hour"><span class="wx-h">' + label + '</span>' +
        wxSvg(weatherOf(h.code).icon) + '<span class="wx-t">' + wxUnit(h.temp) + '</span></span>';
    }).join('');
  }

  const idle = $('#idle-wx');
  if (idle) {
    idle.innerHTML = wxSvg(info.icon) + '<span class="iw-temp">' + wxUnit(w.temp) + '</span>' +
      '<span class="iw-city">' + esc(w.city) + '</span>';
  }
}

/* Estanteria de apps: solo existe en la app nativa (Android TV). */
function renderShelf() {
  const box = $('#shelf');
  if (!box) return;
  if (!window.TanyNative || typeof window.TanyNative.listApps !== 'function') {
    box.innerHTML = '<p class="shelf-note">La estanteria de apps aparece en la TV (Android).</p>';
    return;
  }
  let apps = [];
  try { apps = JSON.parse(window.TanyNative.listApps()) || []; } catch (e) { apps = []; }
  if (!apps.length) {
    box.innerHTML = '<p class="shelf-note">No hay apps que mostrar.</p>';
    return;
  }
  box.innerHTML = apps.map(a =>
    '<button class="app" tabindex="-1" data-pkg="' + esc(a.pkg) + '" title="' + esc(a.label) + '">' +
    '<span class="app-icon"><img src="data:image/png;base64,' + a.icon + '" alt=""></span>' +
    '<span class="app-name">' + esc(a.label) + '</span></button>').join('');
}

function launchApp(pkg) {
  if (window.TanyNative && typeof window.TanyNative.launchApp === 'function') {
    window.TanyNative.launchApp(pkg);
    toast('Abriendo ' + pkg + '…');
  }
}

/* ============================================================
   MODO REPOSO
   ============================================================ */
function armIdle() {
  clearTimeout(State.idleTimer);
  const ms = State.idleMs || 45000;
  State.idleTimer = setTimeout(() => {
    if (!$('#overlay-player').hidden || !$('#overlay-channel').hidden) return;
    $('#overlay-idle').hidden = false;
  }, ms);
}
function wake() {
  clearTimeout(State.idleTimer);
  if (!$('#overlay-idle').hidden) $('#overlay-idle').hidden = true;
  armIdle();
}

/* ============================================================
   ENTRADA: teclado, mando, ratón
   ============================================================ */
let lastItemId = 'mv1', lastChannelId = 'ch1';

document.addEventListener('keydown', e => {
  wake();
  const k = e.key;
  const inPlayer = !$('#overlay-player').hidden;
  const inChannel = !$('#overlay-channel').hidden;

  if (inPlayer) {
    if (k === 'Enter' || k === ' ') { e.preventDefault(); togglePlay(); return; }
    if (k === 'Escape' || k === 'Backspace' || k === 'BrowserBack') { e.preventDefault(); closePlayer(); return; }
    if (k === 'ArrowRight') { e.preventDefault(); State.player.t = Math.min(State.player.total, State.player.t + 30); return; }
    if (k === 'ArrowLeft') { e.preventDefault(); State.player.t = Math.max(0, State.player.t - 30); return; }
    return;
  }
  if (inChannel) {
    if (k === 'Escape' || k === 'Backspace' || k === 'BrowserBack') { e.preventDefault(); closeChannel(); return; }
    if (k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); nextChannel(1); return; }
    if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); nextChannel(-1); return; }
    return;
  }

  switch (k) {
    case 'ArrowLeft': e.preventDefault(); moveHoriz(-1); break;
    case 'ArrowRight': e.preventDefault(); moveHoriz(1); break;
    case 'ArrowUp': e.preventDefault(); moveVert(-1); break;
    case 'ArrowDown': e.preventDefault(); moveVert(1); break;
    case 'Enter': e.preventDefault(); clickSound(); activate(State.current); break;
    case ' ': e.preventDefault(); clickSound(); activate(State.current); break;
    case 'Escape': case 'Backspace': case 'BrowserBack':
      e.preventDefault();
      if (State.current && State.current.matches('.nav-tab')) switchScreen('home');
      else focusEl($('.nav-tab.is-active'));
      break;
    case 'Home': e.preventDefault(); switchScreen('home'); break;
    case 'm': case 'M':
      State.settings.sound = !State.settings.sound;
      Audio_.setEnabled(State.settings.sound);
      renderSettings();
      toast(State.settings.sound ? 'Piano de Schroeder: sí' : 'Piano de Schroeder: no');
      break;
    case 'i': case 'I': {
      cycleTheme();
      break;
    }
  }
});

document.addEventListener('click', e => {
  wake();
  if (e.target.closest('.brand')) { switchScreen('home'); return; }
  if (e.target.closest('#weather')) { cycleTheme(); return; }
  const app = e.target.closest('.app');
  if (app) { launchApp(app.dataset.pkg); return; }
  const el = e.target.closest(FOCUSABLE);
  if (!el) return;
  clickSound();
  if (el.matches('.nav-tab')) { switchScreen(el.dataset.screen); return; }
  focusEl(el);
  activate(el);
  if (el.matches('.card[data-item]')) lastItemId = el.dataset.item;
  if (el.matches('.c-card[data-item]')) lastItemId = el.dataset.item;
  if (el.matches('.ch-card[data-channel]')) lastChannelId = el.dataset.channel;
});

document.addEventListener('pointerover', e => {
  const el = e.target.closest(FOCUSABLE);
  if (!el) return;
  if (State.current && el.contains(State.current)) return;
  if (el.matches('.nav-tab')) return;
  focusEl(el);
});

document.addEventListener('pointermove', e => {
  const cur = $('#cursor');
  if (!cur || !State.settings.cursor) return;
  const s = State.stageScale || 1;
  const cx = (e.clientX - (State.stageX || 0)) / s;
  const cy = (e.clientY - (State.stageY || 0)) / s;
  cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
  if (Math.random() < 0.05) spawnLeaf(cx, cy);
});

function spawnLeaf(x, y) {
  const cur = $('#cursor');
  if (!cur) return;
  const l = document.createElement('span');
  l.className = 'leaf';
  l.style.left = '-10px'; l.style.top = '-10px';
  cur.appendChild(l);
  setTimeout(() => l.remove(), 1600);
}

document.addEventListener('mousemove', () => {
  const cur = $('#cursor');
  if (cur && document.body.classList.contains('no-pointer')) document.body.classList.remove('no-pointer');
});

/* El boton "atras" fisico de Android lo pide la app nativa: si algo esta
   abierto lo cerramos, y si no, devuelven false para que la app se cierre. */
window.__snoopyRemoteBack = function () {
  if (!$('#overlay-player').hidden) { closePlayer(); return true; }
  if (!$('#overlay-channel').hidden) { closeChannel(); return true; }
  if (!$('#overlay-idle').hidden) { $('#overlay-idle').hidden = true; armIdle(); return true; }
  if (State.current && State.current.matches('.nav-tab')) { switchScreen('home'); return true; }
  return false;
};

function bindCards() {
  $$('.card[data-item], .c-card[data-item]').forEach(c => {
    c.addEventListener('mouseenter', () => { if (State.current !== c) focusEl(c); });
  });
}

function applyWeather() {
  const w = WEATHER[State.settings.theme] || WEATHER.tarde;
  const icon = $('.weather-widget .wx-icon');
  if (icon) icon.innerHTML = w[0];
  const pv = $('#pv-text');
  if (pv) pv.textContent = w[1];
}

/* ============================================================
   ARRANQUE
   ============================================================ */
let booted = false;
function boot() {
  if (booted) return;
  booted = true;
  try {
    const p = new URLSearchParams(location.search).get('idle');
    if (p) State.idleMs = Math.max(1, parseInt(p, 10)) * 1000;
  } catch (e) { /* sin parametros */ }
  document.body.dataset.theme = State.settings.theme === 'auto' ? 'noche' : State.settings.theme;
  fitStage();
  window.addEventListener('resize', fitStage);
  applyWeather();
  renderHome();
  renderMovies();
  renderSeries();
  renderContinue();
  renderChannels();
  renderShop();
  renderSettings();

  // estrellas del modo reposo
  const stars = $('.idle-stars');
  if (stars) {
    let s = '';
    for (let i = 0; i < 80; i++) {
      const x = (i * 137) % 1600, y = (i * 271) % 600;
      const d = (i % 8) * 0.45;
      s += '<i style="left:' + (x / 16) + '%;top:' + (y / 6) + '%;animation-delay:' + d.toFixed(2) + 's"></i>';
    }
    stars.innerHTML = s;
  }

  // estrellas de la escena principal
  const sstars = $('#scene-stars');
  if (sstars) {
    let s = '';
    for (let i = 0; i < 110; i++) {
      const x = (i * 211) % 1280, y = (i * 97) % 430;
      s += '<i style="left:' + (x / 12.8).toFixed(2) + '%;top:' + (y / 4.3).toFixed(2) + '%;animation-delay:' + ((i % 9) * 0.42).toFixed(2) + 's"></i>';
    }
    sstars.innerHTML = s;
  }

  switchScreen('home');
  $('#thought span').textContent = THOUGHTS[0];
  armIdle();

  renderShelf();
  loadWeather();
  setInterval(() => loadWeather(), 10 * 60 * 1000);

  // primer gesto: activa el audio (política de autoplay del navegador)
  const unlock = () => {
    Audio_.init();
    if (State.settings.sound) Audio_.setEnabled(true);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('keydown', unlock);
  document.addEventListener('click', unlock);

  // si no hay ratón, el cursor Woodstock no molesta
  if (!window.matchMedia('(hover:hover)').matches) document.body.classList.add('cursor-hidden');
}

document.addEventListener('DOMContentLoaded', boot);
if (document.readyState !== 'loading') boot();
