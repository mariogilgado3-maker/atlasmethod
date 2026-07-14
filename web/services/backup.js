(function () {
  'use strict';

  // All atlas.* localStorage keys that belong to Atlas Method data
  const ATLAS_KEYS = [
    'atlas.store.v2',
    'atlas.coach.profile.v1',
    'atlas.coach.memory.v1',
    'atlas.chats.v1',
    'atlas.profile.v1',
    'atlas.profile.dismissed',
    'atlas.routine.active.v1',
    'atlas.builder.plan.v1',
    'atlas.activesession.v1',
    'atlas.sessionhistory.v1',
    'atlas.aula.pending.v1',
    'atlas.pendingWorkout',
    'atlas.pendingWorkoutMeta',
    'atlas.priorities',
  ];

  function exportBackup() {
    const data = {};
    ATLAS_KEYS.forEach(function (key) {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = val; // store raw strings; preserves exact format
    });

    const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data: data }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href     = url;
    a.download = 'atlas-backup-' + date + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); document.body.removeChild(a); }, 200);
  }

  function _parseSummary(data) {
    // Build a human-readable summary of what the backup contains
    const lines = [];

    // Sessions from store
    try {
      const store = JSON.parse(data['atlas.store.v2'] || 'null');
      if (store) {
        const sessionCount = (store.log || []).length;
        if (sessionCount) lines.push(sessionCount + ' sesión' + (sessionCount !== 1 ? 'es' : '') + ' registrada' + (sessionCount !== 1 ? 's' : ''));
        const gems = store.gems && store.gems.balance != null ? store.gems.balance : null;
        if (gems !== null) lines.push(gems + ' gemas');
      }
    } catch (_) {}

    // Coach profile
    try {
      const cp = JSON.parse(data['atlas.coach.profile.v1'] || 'null');
      if (cp && cp.updatedAt) {
        const d = new Date(cp.updatedAt);
        lines.push('perfil del coach (' + d.toLocaleDateString('es-ES') + ')');
      }
    } catch (_) {}

    // Athlete profile
    try {
      const ap = JSON.parse(data['atlas.profile.v1'] || 'null');
      if (ap && ap.objective) lines.push('perfil atleta (' + ap.objective + ')');
    } catch (_) {}

    // Active routine
    try {
      const r = JSON.parse(data['atlas.routine.active.v1'] || 'null');
      if (r && r.name) {
        const nSess = Array.isArray(r.sessions) ? r.sessions.length : 0;
        lines.push('rutina "' + r.name + '" (' + nSess + ' día' + (nSess !== 1 ? 's' : '') + ')');
      }
    } catch (_) {}

    // Chat history
    try {
      const chats = JSON.parse(data['atlas.chats.v1'] || 'null');
      if (Array.isArray(chats) && chats.length) {
        lines.push(chats.length + ' conversación' + (chats.length !== 1 ? 'es' : '') + ' con el Coach');
      }
    } catch (_) {}

    return lines.length ? lines : ['datos de Atlas Method'];
  }

  // importBackup(file, { onSummary, onError })
  // Calls onSummary(summaryLines, applyFn) when backup is valid — caller shows confirm UI.
  // applyFn() writes data and reloads.
  // Calls onError(message) on any validation problem.
  function importBackup(file, callbacks) {
    var onSummary = (callbacks && callbacks.onSummary) || function () {};
    var onError   = (callbacks && callbacks.onError)   || function (m) { alert(m); };

    if (!file) { onError('No se seleccionó ningún archivo.'); return; }

    var reader = new FileReader();
    reader.onload = function (e) {
      var parsed;
      try {
        parsed = JSON.parse(e.target.result);
      } catch (_) {
        onError('El archivo no es un JSON válido. No se han modificado tus datos.');
        return;
      }

      if (!parsed || typeof parsed !== 'object' || parsed.version == null || !parsed.data || typeof parsed.data !== 'object') {
        onError('El formato del backup no es reconocido. No se han modificado tus datos.');
        return;
      }

      if (parsed.version !== 1) {
        onError('Versión de backup desconocida (' + parsed.version + '). Actualiza la app e inténtalo de nuevo. No se han modificado tus datos.');
        return;
      }

      var data    = parsed.data;
      var summary = _parseSummary(data);

      function apply() {
        ATLAS_KEYS.forEach(function (key) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            try { localStorage.setItem(key, data[key]); } catch (_) {}
          } else {
            // Key existed locally but not in backup — don't wipe it (forward-compat)
          }
        });
        window.location.reload();
      }

      onSummary(summary, apply);
    };

    reader.onerror = function () {
      onError('No se pudo leer el archivo. Inténtalo de nuevo.');
    };

    reader.readAsText(file);
  }

  Object.assign(window, { exportBackup: exportBackup, importBackup: importBackup });
})();
