// AtlasExporter — exportación de rutinas desde la única fuente de verdad (AtlasRoutine)
// Arquitectura de formatos registrables: pdf (implementado), excel / calendar / link / image (preparados)
(function () {

  const FORMATS = {};

  function register(key, def) {
    FORMATS[key] = { label: key, implemented: false, ...def };
  }

  // Punto de entrada único. routine = objeto AtlasRoutine (atlas.routine.active.v1).
  // opts.profile = perfil Atlas (si se omite, se lee de localStorage).
  function exportRoutine(routine, format = 'pdf', opts = {}) {
    const def = FORMATS[format];
    if (!def) throw new Error(`AtlasExporter: formato desconocido "${format}"`);
    if (!def.implemented) {
      alert(`Exportación a ${def.label} disponible próximamente.`);
      return false;
    }
    if (!routine || !Array.isArray(routine.sessions) || routine.sessions.length === 0) {
      alert('No hay ninguna rutina activa para exportar. Genera una con Atlas Coach.');
      return false;
    }
    const profile = opts.profile || loadProfile();
    return def.run(routine, { ...opts, profile });
  }

  function loadProfile() {
    try { return JSON.parse(localStorage.getItem('atlas.profile.v1') || 'null'); } catch { return null; }
  }

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  // ── PDF (ventana de impresión → Guardar como PDF) ──────────────────────────
  function buildPdfHtml(routine, profile) {
    const genDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const NAVY = '#0F1A2E', PAPER = '#FAFAF7', MUTED = '#6B7280', LINE = '#E2E4E9', BLUE = '#2563EB';

    const userRows = [
      profile?.age    && ['Edad',     `${profile.age} años`],
      profile?.weight && ['Peso',     `${profile.weight} kg`],
      profile?.height && ['Altura',   `${profile.height} cm`],
      routine.objective && ['Objetivo', routine.objective],
      routine.level     && ['Nivel',    routine.level],
    ].filter(Boolean);

    const summaryRows = [
      ['Objetivo principal',   routine.objective || '—'],
      ['Nivel',                routine.level || '—'],
      ['Duración recomendada', routine.durationWeeks ? `${routine.durationWeeks} semanas` : '8 semanas'],
      ['Frecuencia',           `${routine.frequency || routine.sessions.length} días / semana`],
      ['Tiempo por sesión',    `~${routine.sessionTime || 60} min`],
      ['Split',                (routine.split || '').replace('_', ' ').toUpperCase()],
    ];

    const rationaleHtml = (routine.rationale || []).map(l =>
      `<li>${esc(l)}</li>`).join('');

    const progressionHtml = (routine.progression || []).map(p => `
      <tr>
        <td class="wk">Sem ${esc(p.weeks)}</td>
        <td>${esc(p.carga)}</td>
        <td>${esc(p.reps)}</td>
        <td>${esc(p.volumen)}</td>
        <td>${esc(p.intensidad)}</td>
      </tr>`).join('');

    const sessionsHtml = routine.sessions.map((s, si) => {
      const rows = (s.exercises || []).map((ex, ei) => {
        const setsN = ex.setsCount ?? (Array.isArray(ex.sets) ? ex.sets.length : 3);
        const extra = [
          ex.purpose ? esc(ex.purpose) : '',
          (ex.alternatives || []).length ? `Alternativas: ${esc(ex.alternatives.join(' · '))}` : '',
        ].filter(Boolean).join(' &nbsp;—&nbsp; ');
        return `
          <tr>
            <td class="num">${ei + 1}</td>
            <td class="exname">${esc(ex.name)}${extra ? `<div class="expurpose">${extra}</div>` : ''}</td>
            <td>${esc(ex.muscles?.primary?.[0] || '')}</td>
            <td class="c">${setsN}</td>
            <td class="c">${esc(ex.repsRange || '8-12')}</td>
            <td class="c">${ex.rir ?? 2}</td>
            <td class="c">${esc(ex.rest || '90s')}</td>
            <td class="c">${esc(ex.tempo || '—')}</td>
          </tr>`;
      }).join('');

      const logRows = (s.exercises || []).map(ex => `
        <tr>
          <td class="exname">${esc(ex.name)}</td>
          ${'<td class="log"></td>'.repeat(8)}
        </tr>`).join('');

      return `
        <section class="session">
          <h2><span class="daynum">Día ${si + 1}</span> ${esc(s.name)}</h2>
          <div class="sessmeta">
            ${esc((s.muscles || []).join(' · '))} &nbsp;·&nbsp; ${s.exercises.length} ejercicios
            &nbsp;·&nbsp; ${s.totalSets || ''} series &nbsp;·&nbsp; ~${s.duration || routine.sessionTime || 60} min
          </div>
          <table>
            <thead><tr>
              <th>#</th><th>Ejercicio</th><th>Músculo</th><th>Series</th>
              <th>Reps</th><th>RIR</th><th>Descanso</th><th>Tempo</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="loghead">Registro de cargas (kg × reps por semana)</div>
          <table class="logtable">
            <thead><tr><th>Ejercicio</th>${Array.from({ length: 8 }, (_, i) => `<th>S${i + 1}</th>`).join('')}</tr></thead>
            <tbody>${logRows}</tbody>
          </table>
        </section>`;
    }).join('');

    return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${esc(routine.name)} — Atlas Method</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: ${NAVY}; background: ${PAPER}; }
  @page { size: A4; margin: 16mm 14mm; }
  .page { max-width: 760px; margin: 0 auto; padding: 24px; }

  /* Portada */
  .cover { min-height: 92vh; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; }
  .brand span { font-weight: 800; font-size: 19px; letter-spacing: -0.4px; }
  .brand span em { font-style: normal; font-weight: 500; opacity: 0.55; }
  .cover .kicker { font-family: ui-monospace, Menlo, monospace; font-size: 10px; letter-spacing: 3px;
    color: ${MUTED}; margin-bottom: 14px; }
  .cover h1 { font-size: 40px; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 20px; }
  .cover .sub { font-size: 15px; color: ${MUTED}; margin-bottom: 40px; }
  .userdata { display: flex; flex-wrap: wrap; gap: 10px; }
  .userdata div { border: 1px solid ${LINE}; border-radius: 10px; padding: 10px 16px; background: #fff; }
  .userdata .k { font-family: ui-monospace, Menlo, monospace; font-size: 8px; letter-spacing: 1.5px; color: ${MUTED}; }
  .userdata .v { font-size: 14px; font-weight: 700; margin-top: 2px; }
  .cover .date { margin-top: 48px; font-size: 12px; color: ${MUTED}; }

  h2 { font-size: 19px; font-weight: 800; letter-spacing: -0.5px; margin: 34px 0 12px; }
  h2 .daynum { display: inline-block; background: ${NAVY}; color: ${PAPER}; border-radius: 999px;
    font-size: 11px; font-weight: 700; padding: 3px 12px; vertical-align: 3px; margin-right: 8px; }

  .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 8px; }
  .summary div { border: 1px solid ${LINE}; border-radius: 10px; padding: 12px 14px; background: #fff; }
  .summary .k { font-family: ui-monospace, Menlo, monospace; font-size: 8px; letter-spacing: 1.5px; color: ${MUTED}; }
  .summary .v { font-size: 14px; font-weight: 700; margin-top: 3px; text-transform: capitalize; }

  ul.rationale { margin: 0 0 8px 18px; }
  ul.rationale li { font-size: 12px; line-height: 1.65; color: #333B4E; margin-bottom: 6px; }

  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid ${LINE}; border-radius: 10px; overflow: hidden; }
  th { background: ${NAVY}; color: ${PAPER}; font-size: 9px; font-family: ui-monospace, Menlo, monospace;
    letter-spacing: 1px; text-transform: uppercase; padding: 8px 9px; text-align: left; }
  td { padding: 9px; font-size: 12px; border-top: 1px solid ${LINE}; vertical-align: top; }
  td.c, th.c { text-align: center; }
  td.num { color: ${MUTED}; font-family: ui-monospace, Menlo, monospace; width: 22px; }
  td.wk { font-weight: 800; white-space: nowrap; }
  .exname { font-weight: 700; }
  .expurpose { font-weight: 400; font-size: 10.5px; color: ${MUTED}; margin-top: 3px; line-height: 1.5; }

  .session { page-break-inside: avoid; margin-bottom: 10px; }
  .sessmeta { font-size: 11px; color: ${MUTED}; margin-bottom: 10px; text-transform: capitalize; }
  .loghead { font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: 1.5px;
    color: ${MUTED}; margin: 14px 0 6px; }
  .logtable td.log { height: 26px; min-width: 44px; }
  .logtable th { background: #39415A; }

  .tips { border: 1px solid ${LINE}; border-left: 4px solid ${BLUE}; border-radius: 10px;
    background: #fff; padding: 16px 18px; margin-top: 30px; page-break-inside: avoid; }
  .tips h3 { font-size: 13px; margin-bottom: 8px; }
  .tips li { font-size: 12px; line-height: 1.7; color: #333B4E; margin-left: 16px; }

  footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid ${LINE};
    font-size: 10px; color: ${MUTED}; display: flex; justify-content: space-between; }
</style></head><body><div class="page">

  <div class="cover">
    <div class="brand">
      <svg width="30" height="30" viewBox="0 0 100 100"><path d="M50 6 L94 94 H75 L50 42 L25 94 H6 Z" fill="${NAVY}"/></svg>
      <span>Atlas <em>Method</em></span>
    </div>
    <div class="kicker">PROGRAMA DE ENTRENAMIENTO</div>
    <h1>${esc(routine.name)}</h1>
    <div class="sub">Datos. Decisiones. Rendimiento.</div>
    ${userRows.length ? `<div class="userdata">${userRows.map(([k, v]) =>
      `<div><div class="k">${esc(k.toUpperCase())}</div><div class="v">${esc(v)}</div></div>`).join('')}</div>` : ''}
    <div class="date">Generado el ${genDate}</div>
  </div>

  <h2>Resumen del programa</h2>
  <div class="summary">${summaryRows.map(([k, v]) =>
    `<div><div class="k">${esc(k.toUpperCase())}</div><div class="v">${esc(v)}</div></div>`).join('')}</div>

  ${rationaleHtml ? `<h2>Por qué está diseñado así</h2><ul class="rationale">${rationaleHtml}</ul>` : ''}

  ${progressionHtml ? `<h2>Progresión (${routine.durationWeeks || 8} semanas)</h2>
  <table><thead><tr><th>Bloque</th><th>Carga</th><th>Repeticiones</th><th>Volumen</th><th>Intensidad</th></tr></thead>
  <tbody>${progressionHtml}</tbody></table>` : ''}

  ${sessionsHtml}

  <div class="tips">
    <h3>Consejos generales</h3>
    <ul>
      <li>Calienta 5-10 min y realiza 2-3 series de aproximación antes del primer básico.</li>
      <li>El RIR indica las repeticiones que dejas en reserva: RIR 2 = podrías hacer 2 más.</li>
      <li>Apunta tus cargas cada semana en el registro — la progresión visible es la mejor motivación.</li>
      <li>Si un ejercicio genera molestia articular, usa la alternativa indicada.</li>
      <li>Duerme 7-9 h y asegura proteína suficiente (1,6-2,2 g/kg/día) para maximizar la adaptación.</li>
    </ul>
  </div>

  <footer><span>Atlas Method — ${esc(routine.name)}</span><span>${genDate}</span></footer>
</div></body></html>`;
  }

  function exportPdf(routine, opts) {
    const html = buildPdfHtml(routine, opts.profile);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { try { win.print(); } catch {} }, 400);
      return true;
    }
    // Popup bloqueado → iframe oculto
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;';
    document.body.appendChild(frame);
    frame.srcdoc = html;
    frame.onload = () => {
      try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch {}
      setTimeout(() => frame.remove(), 60000);
    };
    return true;
  }

  register('pdf',      { label: 'PDF',                 implemented: true, run: exportPdf, buildHtml: buildPdfHtml });
  register('excel',    { label: 'Excel',               implemented: false });
  register('calendar', { label: 'Calendario semanal',  implemented: false });
  register('link',     { label: 'Enlace compartible',  implemented: false });
  register('image',    { label: 'Imagen para redes',   implemented: false });

  window.AtlasExporter = { export: exportRoutine, register, formats: FORMATS };
})();
