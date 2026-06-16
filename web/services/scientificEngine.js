// AtlasEngine — MEV/MAV/MRV science data + volume planning utilities
(function () {
  'use strict';

  // Schoenfeld, Israetel et al. — weekly set ranges per muscle
  var SCIENCE = {
    pecho:      { mev: 10, mav: 16, mrv: 22, freq: 2 },
    delt_ant:   { mev:  6, mav: 12, mrv: 18, freq: 2 },
    delt_lat:   { mev:  6, mav: 16, mrv: 22, freq: 3 },
    delt_post:  { mev:  6, mav: 14, mrv: 20, freq: 3 },
    dorsal:     { mev: 10, mav: 16, mrv: 25, freq: 2 },
    trapecio:   { mev:  0, mav:  8, mrv: 16, freq: 2 },
    biceps:     { mev:  6, mav: 14, mrv: 20, freq: 2 },
    triceps:    { mev:  6, mav: 14, mrv: 20, freq: 2 },
    cuadriceps: { mev:  8, mav: 16, mrv: 24, freq: 2 },
    aductores:  { mev:  0, mav:  6, mrv: 12, freq: 2 },
    gemelos:    { mev:  6, mav: 14, mrv: 20, freq: 3 },
    tibial:     { mev:  0, mav:  4, mrv:  8, freq: 2 },
    abductores: { mev:  0, mav:  6, mrv: 12, freq: 2 },
    gluteos:    { mev:  4, mav: 12, mrv: 20, freq: 2 },
    isquio:     { mev:  4, mav: 10, mrv: 16, freq: 2 },
    core:       { mev:  6, mav: 14, mrv: 25, freq: 3 },
    oblicuos:   { mev:  0, mav:  6, mrv: 12, freq: 2 },
    lumbar:     { mev:  4, mav:  8, mrv: 14, freq: 2 },
    erectores:  { mev:  4, mav:  8, mrv: 14, freq: 2 },
    antebrazo:  { mev:  0, mav:  8, mrv: 14, freq: 3 },
  };

  // Map coach group IDs → canonical muscle for science lookup
  var GROUP_CANON = {
    pecho:'pecho', hombro:'delt_lat', espalda:'dorsal',
    biceps:'biceps', triceps:'triceps', piernas:'cuadriceps',
    gluteos:'gluteos', core:'core',
  };

  // Auto-select best split based on priorities and available days
  function selectSplit(priorities, days) {
    var d = days || 4;
    var hasPriority = Object.values(priorities || {}).some(function(v) { return v === 'priority'; });
    if (d <= 2) return 'fullbody';
    if (d === 3) return 'fullbody';
    if (d === 4) return hasPriority ? 'upper_lower' : 'upper_lower';
    if (d >= 5) return 'ppl';
    return 'upper_lower';
  }

  // Compute weekly set targets per coach group based on priorities
  function computeVolumePlan(priorities) {
    var plan = {};
    Object.keys(GROUP_CANON).forEach(function(group) {
      var state = (priorities || {})[group];
      var muscleId = GROUP_CANON[group];
      var sci = SCIENCE[muscleId];
      if (!sci) return;
      var target;
      if (state === 'priority') target = sci.mav;
      else if (state === 'maintain') target = sci.mev;
      else if (state === 'reducir') target = Math.round(sci.mev * 0.5);
      else return; // off or unset — skip
      plan[group] = { target: target, mev: sci.mev, mav: sci.mav, mrv: sci.mrv, state: state };
    });
    return plan;
  }

  // Full builder plan: split + per-group volume
  function exportBuilderPlan(priorities, daysAvailable) {
    var split = selectSplit(priorities, daysAvailable);
    var volume = computeVolumePlan(priorities);
    return { split: split, volume: volume, priorities: priorities || {}, generatedAt: Date.now() };
  }

  var PLAN_KEY = 'atlas.builder.plan.v1';
  function saveBuilderPlan(plan) {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch (e) {}
  }
  function loadBuilderPlan() {
    try { return JSON.parse(localStorage.getItem(PLAN_KEY) || 'null'); } catch (e) { return null; }
  }
  function clearBuilderPlan() {
    try { localStorage.removeItem(PLAN_KEY); } catch (e) {}
  }

  window.AtlasEngine = {
    SCIENCE: SCIENCE,
    GROUP_CANON: GROUP_CANON,
    selectSplit: selectSplit,
    computeVolumePlan: computeVolumePlan,
    exportBuilderPlan: exportBuilderPlan,
    saveBuilderPlan: saveBuilderPlan,
    loadBuilderPlan: loadBuilderPlan,
    clearBuilderPlan: clearBuilderPlan,
  };
})();
