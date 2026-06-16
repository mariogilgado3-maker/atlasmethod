// AtlasProfile — unified profile: single source of truth connecting Builder ↔ Coach
(function () {
  'use strict';

  var AP_KEY       = 'atlas.profile.v1';
  var LEGACY_COACH = 'atlas.coach.profile.v1';
  var LEGACY_PRIO  = 'atlas.priorities';

  var DEFAULTS = {
    version: 1,
    objetivo: null,
    nivel: null,
    dias: 4,
    tiempo: 60,
    equipamiento: 'gimnasio',
    priorities: {},
    plans: [],
    progressionSummary: null,
    createdAt: null,
    updatedAt: null,
  };

  function _read() {
    try { return JSON.parse(localStorage.getItem(AP_KEY) || 'null'); } catch (e) { return null; }
  }

  function _migrate() {
    var profile = Object.assign({}, DEFAULTS, { createdAt: Date.now() });
    try {
      var coach = JSON.parse(localStorage.getItem(LEGACY_COACH) || 'null');
      if (coach) {
        ['objetivo','nivel','dias','tiempo','equipamiento'].forEach(function(f) {
          if (coach[f] != null) profile[f] = coach[f];
        });
      }
    } catch (e) {}
    try {
      var prios = JSON.parse(localStorage.getItem(LEGACY_PRIO) || 'null');
      if (prios && typeof prios === 'object') profile.priorities = prios;
    } catch (e) {}
    return profile;
  }

  function load() {
    return _read() || _migrate();
  }

  function save(patch) {
    var next = Object.assign({}, load(), patch, { updatedAt: Date.now() });
    try {
      localStorage.setItem(AP_KEY, JSON.stringify(next));
      // Shadow writes: keep legacy keys in sync
      try { localStorage.setItem(LEGACY_PRIO, JSON.stringify(next.priorities || {})); } catch (e) {}
      try {
        localStorage.setItem(LEGACY_COACH, JSON.stringify({
          objetivo: next.objetivo, nivel: next.nivel, dias: next.dias,
          tiempo: next.tiempo, equipamiento: next.equipamiento, updatedAt: next.updatedAt,
        }));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('atlas:profile:updated', { detail: next }));
    } catch (e) {}
    return next;
  }

  function updatePriorities(priorities) {
    return save({ priorities: priorities });
  }

  function updateCoachProfile(patch) {
    var allowed = {};
    ['objetivo','nivel','dias','tiempo','equipamiento'].forEach(function(f) {
      if (patch[f] !== undefined) allowed[f] = patch[f];
    });
    return save(allowed);
  }

  function reset() {
    [AP_KEY, LEGACY_PRIO, LEGACY_COACH].forEach(function(k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    window.dispatchEvent(new CustomEvent('atlas:profile:updated', { detail: null }));
  }

  window.AtlasProfile = { load: load, save: save, updatePriorities: updatePriorities, updateCoachProfile: updateCoachProfile, reset: reset };
})();
