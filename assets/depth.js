/* ============================================================
   TANY TV · motor de profundidad
   Paralaje de puntero y de foco, capas en Z, inclinacion 3D
   del elemento enfocado y brillo especular.
   Vanilla JS, sin dependencias.

   API publica:
     Depth.init()      arranca el motor (idempotente)
     Depth.setFocus()  informa del foco manualmente
     Depth.destroy()   detiene el motor y limpia el DOM

   Evento esperado (lo emite os.js):
     document.dispatchEvent(new CustomEvent('depth:focus', {
       detail: { hasFocus: true, focusedRect: el.getBoundingClientRect() }
     }));
   ============================================================ */
(function () {
  'use strict';

  var LERP = 0.08;        /* suavizado del paralaje por fotograma */
  var TILT_MAX = 6;       /* inclinacion maxima, en grados */
  var EPS = 0.0008;       /* umbral de reposo del paralaje */
  var SHEEN_EPS = 0.05;   /* umbral de reposo del brillo (%) */

  var doc = document;
  var root = doc.documentElement;

  var state = {
    started: false,
    destroyed: false,
    rafId: 0,
    observer: null,
    media: null,
    pointer: { x: 0, y: 0 },      /* puntero normalizado [-1..1] */
    pointerPct: { x: 50, y: 50 }, /* puntero en % del viewport (brillo) */
    sheen: { x: 50, y: 50 },      /* brillo suavizado, en % */
    focus: { x: 0, y: 0 },        /* foco normalizado [-1..1] */
    hasFocus: false,
    focusFromEvent: false,   /* el vector viene de un evento, no del DOM */
    muted: false,            /* movimiento reducido: todo a cero */
    current: { x: 0, y: 0 },      /* paralaje efectivo suavizado */
    tiltEl: null,
    sheenEl: null,
    sheenOwned: false
  };

  /* ============================================================
     UTILIDADES
     ============================================================ */

  function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  function isNum(v) {
    return typeof v === 'number' && isFinite(v);
  }

  function fmt(v) {
    var n = Math.round(v * 1000) / 1000;
    return n === 0 ? '0' : String(n);
  }

  function hasToken(value, token) {
    if (!value) return false;
    var parts = String(value).split(/\s+/);
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] === token) return true;
    }
    return false;
  }

  /* Sin movimiento: body.reduced-motion o la preferencia del sistema. */
  function reducedMotion() {
    if (doc.body && doc.body.classList.contains('reduced-motion')) return true;
    if (state.media && state.media.matches) return true;
    return false;
  }

  /* ============================================================
     VARIABLES CSS
     ============================================================ */

  function writeVars() {
    if (!root || !root.style) return;
    var muted = state.muted;
    var px = muted ? 0 : state.current.x;
    var py = muted ? 0 : state.current.y;
    var fx = muted ? 0 : state.focus.x;
    var fy = muted ? 0 : state.focus.y;
    var sx = muted ? 50 : state.sheen.x;
    var sy = muted ? 50 : state.sheen.y;
    var tiltx = (!muted && state.hasFocus) ? state.focus.y * TILT_MAX : 0;
    var tilty = (!muted && state.hasFocus) ? -state.focus.x * TILT_MAX : 0;
    root.style.setProperty('--dpx', fmt(px));
    root.style.setProperty('--dpy', fmt(py));
    root.style.setProperty('--dfx', fmt(fx));
    root.style.setProperty('--dfy', fmt(fy));
    root.style.setProperty('--tiltx', fmt(tiltx) + 'deg');
    root.style.setProperty('--tilty', fmt(tilty) + 'deg');
    root.style.setProperty('--sheen-x', fmt(sx) + '%');
    root.style.setProperty('--sheen-y', fmt(sy) + '%');
  }

  /* ============================================================
     BRILLO ESPECULAR
     ============================================================ */

  function ensureSheen() {
    if (state.sheenEl) return state.sheenEl;
    var scene = doc.getElementById('scene');
    if (!scene) return null;
    var el = scene.querySelector('.sheen');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'sheen';
      scene.appendChild(el);
      state.sheenOwned = true;
    }
    state.sheenEl = el;
    return el;
  }

  function showSheen() {
    if (reducedMotion()) return;
    var el = ensureSheen();
    if (el) el.classList.add('on');
  }

  function hideSheen() {
    if (state.sheenEl) state.sheenEl.classList.remove('on');
  }

  /* ============================================================
     FOCO
     ============================================================ */

  /* Acepta un DOMRect, un objeto {left,top,width,height} o un elemento. */
  function toRect(source) {
    if (!source || typeof source !== 'object') return null;
    if (typeof source.getBoundingClientRect === 'function') {
      var measured = source.getBoundingClientRect();
      if (measured && isNum(measured.left) && isNum(measured.top)) return measured;
      return null;
    }
    var l = source.left, t = source.top, w = source.width, h = source.height;
    if (!isNum(l) || !isNum(t) || !isNum(w) || !isNum(h)) return null;
    return { left: l, top: t, width: w, height: h };
  }

  /* Si hay varios .is-focused, gana el ultimo (el que ya esta inclinado). */
  function focusedElement() {
    var list = doc.querySelectorAll('.is-focused');
    if (!list || !list.length) return null;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === state.tiltEl) return state.tiltEl;
    }
    return list[list.length - 1];
  }

  /* Rect sin la inclinacion 3D, para no realimentar el calculo. */
  function measure(el) {
    if (!el || !el.classList) return null;
    var had = false;
    var rect = null;
    try {
      had = el.classList.contains('depth-tilt');
      if (had) el.classList.remove('depth-tilt');
      rect = el.getBoundingClientRect();
      if (had) el.classList.add('depth-tilt');
    } catch (e) {
      rect = null;
    }
    return rect;
  }

  function setFocusVector(rect) {
    if (!rect) return;
    var vw = window.innerWidth || 1;
    var vh = window.innerHeight || 1;
    state.focus.x = clamp(((rect.left + rect.width / 2) / vw - 0.5) * 2, -1, 1);
    state.focus.y = clamp(((rect.top + rect.height / 2) / vh - 0.5) * 2, -1, 1);
  }

  /* Aplica un cambio de foco.
     rect: DOMRect, elemento o null.
     fromEvent: true si el rect viene del evento "depth:focus" (es la fuente
     autoritativa del paralaje); false si lo medimos en el DOM. */
  function applyFocus(rect, hasFocus, fromEvent) {
    if (!hasFocus) {
      state.hasFocus = false;
      state.focusFromEvent = false;
      state.focus.x = 0;
      state.focus.y = 0;
      clearTilt();
      return;
    }
    var r = toRect(rect);
    var authoritative = !!r && fromEvent !== false;
    if (!r) {
      r = measure(focusedElement());
      authoritative = false;
    }
    if (!r) {
      state.hasFocus = false;
      state.focusFromEvent = false;
      state.focus.x = 0;
      state.focus.y = 0;
      clearTilt();
      return;
    }
    setFocusVector(r);
    state.hasFocus = true;
    state.focusFromEvent = authoritative;
    syncTilt();
  }

  /* Solo mueve la inclinacion: el vector de foco lo manda el evento. */
  function syncTilt() {
    var el = focusedElement();
    if (el !== state.tiltEl) {
      clearTilt();
      state.tiltEl = el;
      if (el && !reducedMotion()) {
        try { el.classList.add('depth-tilt'); } catch (e) { /* sin clase */ }
      }
    }
  }

  function clearTilt() {
    if (!state.tiltEl) return;
    try { state.tiltEl.classList.remove('depth-tilt'); } catch (e) { /* sin clase */ }
    state.tiltEl = null;
  }

  /* ============================================================
     EVENTOS
     ============================================================ */

  function onPointerMove(e) {
    if (state.destroyed || !e) return;
    var vw = window.innerWidth || 1;
    var vh = window.innerHeight || 1;
    var cx = isNum(e.clientX) ? e.clientX : 0;
    var cy = isNum(e.clientY) ? e.clientY : 0;
    state.pointer.x = clamp((cx / vw - 0.5) * 2, -1, 1);
    state.pointer.y = clamp((cy / vh - 0.5) * 2, -1, 1);
    state.pointerPct.x = clamp((cx / vw) * 100, 0, 100);
    state.pointerPct.y = clamp((cy / vh) * 100, 0, 100);
    showSheen();
    requestFrame();
  }

  function onDepthFocus(e) {
    var detail = (e && e.detail) || {};
    var rect = detail.focusedRect || null;
    var has = (detail.hasFocus !== undefined) ? !!detail.hasFocus : !!rect;
    applyFocus(rect, has, true);
    requestFrame();
  }

  function onResize() {
    requestFrame();
  }

  function onVisibilityChange() {
    if (doc.hidden) hideSheen();
    requestFrame();
  }

  function onMotionChange() {
    if (reducedMotion()) {
      clearTilt();
      hideSheen();
    } else {
      syncTilt();
    }
    requestFrame();
  }

  /* Red de seguridad: si el foco cambia sin evento, la inclinacion le sigue. */
  function watchFocus() {
    if (state.observer || typeof MutationObserver === 'undefined') return;
    if (!doc.body) return;
    state.observer = new MutationObserver(function (records) {
      var i, rec, target;
      var focusChanged = false;
      var motionChanged = false;
      for (i = 0; i < records.length; i++) {
        rec = records[i];
        target = rec.target;
        if (!target || !target.classList) continue;
        if (hasToken(rec.oldValue, 'is-focused') !== target.classList.contains('is-focused')) {
          focusChanged = true;
        }
        if (target === doc.body &&
            hasToken(rec.oldValue, 'reduced-motion') !== target.classList.contains('reduced-motion')) {
          motionChanged = true;
        }
      }
      if (focusChanged) {
        syncTilt();
        /* Sin evento de por medio, el paralaje sigue al elemento enfocado. */
        if (!state.focusFromEvent) {
          var el = focusedElement();
          if (el) {
            var r = measure(el);
            if (r) {
              setFocusVector(r);
              state.hasFocus = true;
            }
          } else {
            state.hasFocus = false;
            state.focus.x = 0;
            state.focus.y = 0;
          }
        }
      }
      if (motionChanged) {
        if (reducedMotion()) {
          clearTilt();
          hideSheen();
        } else {
          syncTilt();
        }
      }
      if (focusChanged || motionChanged) requestFrame();
    });
    try {
      state.observer.observe(doc.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
      });
    } catch (e) {
      state.observer = null;
    }
  }

  /* ============================================================
     BUCLE DE FOTOGRAMAS
     ============================================================ */

  function requestFrame() {
    if (state.destroyed || state.rafId) return;
    if (!window.requestAnimationFrame) {
      writeVars();
      return;
    }
    state.rafId = window.requestAnimationFrame(tick);
  }

  function tick() {
    state.rafId = 0;
    if (state.destroyed) return;

    if (reducedMotion()) {
      state.muted = true;
      state.current.x = 0;
      state.current.y = 0;
      state.sheen.x = 50;
      state.sheen.y = 50;
      writeVars();
      clearTilt();
      hideSheen();
      return;
    }

    state.muted = false;

    var target = state.hasFocus ? state.focus : state.pointer;
    state.current.x += (target.x - state.current.x) * LERP;
    state.current.y += (target.y - state.current.y) * LERP;
    state.sheen.x += (state.pointerPct.x - state.sheen.x) * LERP;
    state.sheen.y += (state.pointerPct.y - state.sheen.y) * LERP;
    writeVars();

    var restX = target.x - state.current.x;
    var restY = target.y - state.current.y;
    var restShX = state.pointerPct.x - state.sheen.x;
    var restShY = state.pointerPct.y - state.sheen.y;
    if (Math.abs(restX) > EPS || Math.abs(restY) > EPS ||
        Math.abs(restShX) > SHEEN_EPS || Math.abs(restShY) > SHEEN_EPS) {
      requestFrame();
    }
  }

  /* ============================================================
     API PUBLICA
     ============================================================ */

  function init() {
    if (state.started) return Depth;
    state.started = true;
    state.destroyed = false;

    try {
      state.media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    } catch (e) {
      state.media = null;
    }

    if (window.PointerEvent) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    } else {
      window.addEventListener('mousemove', onPointerMove, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
    }
    window.addEventListener('resize', onResize, { passive: true });
    doc.addEventListener('depth:focus', onDepthFocus);
    doc.addEventListener('visibilitychange', onVisibilityChange);

    if (state.media) {
      if (typeof state.media.addEventListener === 'function') {
        state.media.addEventListener('change', onMotionChange);
      } else if (typeof state.media.addListener === 'function') {
        state.media.addListener(onMotionChange);
      }
    }

    watchFocus();

    if (doc.body) doc.body.classList.add('depth-ready');
    writeVars();
    requestFrame();
    return Depth;
  }

  /* Acepta (rect, hasFocus), (elemento), (null) o ({focusedRect, hasFocus}). */
  function setFocus(source, hasFocus) {
    var rect = null;
    var flag = hasFocus;
    if (source && typeof source === 'object' && !source.nodeType &&
        (source.focusedRect !== undefined || source.hasFocus !== undefined)) {
      rect = source.focusedRect || null;
      if (flag === undefined) flag = source.hasFocus;
    } else {
      rect = source || null;
    }
    if (flag === undefined) flag = !!rect;
    applyFocus(rect, flag, true);
    requestFrame();
    return Depth;
  }

  function destroy() {
    if (state.destroyed) return;
    state.destroyed = true;
    state.started = false;

    if (state.rafId) {
      try { window.cancelAnimationFrame(state.rafId); } catch (e) { /* ya parado */ }
      state.rafId = 0;
    }

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('resize', onResize);
    doc.removeEventListener('depth:focus', onDepthFocus);
    doc.removeEventListener('visibilitychange', onVisibilityChange);

    if (state.media) {
      if (typeof state.media.removeEventListener === 'function') {
        state.media.removeEventListener('change', onMotionChange);
      } else if (typeof state.media.removeListener === 'function') {
        state.media.removeListener(onMotionChange);
      }
      state.media = null;
    }

    if (state.observer) {
      try { state.observer.disconnect(); } catch (e) { /* ya desconectado */ }
      state.observer = null;
    }

    clearTilt();
    hideSheen();
    if (state.sheenOwned && state.sheenEl && state.sheenEl.parentNode) {
      state.sheenEl.parentNode.removeChild(state.sheenEl);
    }
    state.sheenEl = null;
    state.sheenOwned = false;

    state.hasFocus = false;
    state.focusFromEvent = false;
    state.muted = false;
    state.focus.x = 0;
    state.focus.y = 0;
    state.current.x = 0;
    state.current.y = 0;
    state.sheen.x = 50;
    state.sheen.y = 50;

    if (doc.body) doc.body.classList.remove('depth-ready');
    writeVars();
  }

  var Depth = {
    init: init,
    setFocus: setFocus,
    destroy: destroy
  };

  window.Depth = Depth;

  /* Arranque automatico: idempotente, solo una vez. */
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function () { init(); }, { once: true });
  } else {
    init();
  }
})();
