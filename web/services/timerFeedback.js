// AtlasTimer — sensory feedback for the rest timer, no backend, works offline.
// - Web Audio API beeps generated on the fly (no external files)
// - navigator.vibrate on Android (no-op on iOS, where the sound carries it)
// - Screen Wake Lock so the screen doesn't sleep between sets
//
// iOS Safari only allows audio after a user gesture, so call AtlasTimer.unlock()
// on the first touch inside the training view to prime the AudioContext.

(function () {
  'use strict';

  let ctx = null;
  let unlocked = false;

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch (e) { ctx = null; }
    return ctx;
  }

  // Prime the audio context from a user gesture (required on iOS Safari).
  function unlock() {
    const c = ensureCtx();
    if (!c) return false;
    try {
      if (c.state === 'suspended') c.resume();
      // near-silent blip fully unlocks the context on iOS
      const o = c.createOscillator();
      const g = c.createGain();
      g.gain.value = 0.00001;
      o.connect(g); g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.02);
      unlocked = true;
    } catch (e) {}
    return unlocked;
  }

  // A single clean sine tone with a soft attack/decay envelope.
  function tone(freq, offset, dur, peak) {
    const c = ensureCtx();
    if (!c) return false;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const t0 = c.currentTime + offset;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.03);
      return true;
    } catch (e) { return false; }
  }

  function resumeIfNeeded() {
    const c = ensureCtx();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    return c;
  }

  // Rest finished: a clean two-note chime (A5 → D6), premium, not shrill.
  function doubleBeep() {
    if (!resumeIfNeeded()) return false;
    const a = tone(880, 0, 0.15, 0.16);
    const b = tone(1174.66, 0.19, 0.17, 0.16);
    return a && b;
  }

  // 10-seconds-left warning: one soft, low tick.
  function softTick() {
    if (!resumeIfNeeded()) return false;
    return tone(620, 0, 0.07, 0.07);
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) return navigator.vibrate(pattern); } catch (e) {}
    return false;
  }

  // ── Screen Wake Lock ────────────────────────────────────────────────────────
  let wakeLock = null;
  let wantWake = false;

  async function requestWake() {
    wantWake = true;
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        return true;
      }
    } catch (e) {}
    return false;
  }
  async function releaseWake() {
    wantWake = false;
    try { if (wakeLock) { await wakeLock.release(); } } catch (e) {}
    wakeLock = null;
  }
  // Wake locks are dropped when the tab is hidden; re-acquire on return.
  document.addEventListener('visibilitychange', () => {
    if (wantWake && document.visibilityState === 'visible') requestWake();
  });

  // ── High-level helpers (respect the enabled flag) ──────────────────────────
  // Returns true if audio played, so the caller can flash the timer as a
  // silent-mode fallback when it didn't.
  function restDone(soundEnabled) {
    if (!soundEnabled) return false;
    const played = doubleBeep();
    vibrate([120, 60, 120]);
    return played;
  }
  function restWarning(soundEnabled) {
    if (!soundEnabled) return false;
    const played = softTick();
    vibrate(30);
    return played;
  }

  window.AtlasTimer = {
    unlock, doubleBeep, softTick, vibrate,
    requestWake, releaseWake,
    restDone, restWarning,
    get unlocked() { return unlocked; },
  };
})();
