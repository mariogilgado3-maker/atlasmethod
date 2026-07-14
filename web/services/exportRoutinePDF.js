(function () {
  'use strict';

  function exportRoutinePDF(routine) {
    if (typeof window.jspdf === 'undefined') {
      alert('La librería PDF no está disponible. Recarga la página e inténtalo de nuevo.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // ── Palette ────────────────────────────────────────────────────────────────
    const NAVY   = [15, 26, 46];
    const BLUE   = [37, 99, 235];
    const LBLUE  = [59, 130, 246];
    const MUTED  = [107, 114, 128];
    const LIGHT  = [249, 250, 251];
    const BORD   = [229, 231, 235];

    const PW = 210;   // A4 width mm
    const PH = 297;   // A4 height mm
    const ML = 16;    // left margin
    const MR = 16;    // right margin
    const CW = PW - ML - MR;

    let y = 0;

    function newPage() {
      doc.addPage();
      y = 20;
    }

    function guardBreak(needed) {
      if (y + needed > PH - 18) newPage();
    }

    // ── Page header (called once per page as needed) ─────────────────────────
    function drawPageHeader() {
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, PW, 16, 'F');
      doc.setTextColor(250, 250, 247);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.text('Atlas', ML, 10.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 195, 220);
      doc.text(' Method', ML + doc.getTextWidth('Atlas'), 10.5);

      const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFontSize(7);
      doc.text(dateStr.toUpperCase(), PW - MR, 10.5, { align: 'right' });
    }

    // ── First page ────────────────────────────────────────────────────────────
    drawPageHeader();
    y = 26;

    // Routine title
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    const title = routine.name || 'Rutina de entrenamiento';
    doc.text(title, ML, y);
    y += 6;

    // Subtitle
    const parts = [];
    if (routine.split) parts.push(routine.split.toUpperCase().replace(/_/g, '/'));
    if (routine.objective) parts.push(routine.objective);
    const nsess = (routine.sessions || []).length;
    if (nsess) parts.push(`${nsess} sesión${nsess !== 1 ? 'es' : ''}`);

    if (parts.length) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(parts.join(' · '), ML, y);
      y += 3;
    }

    y += 5;
    doc.setDrawColor(...BORD);
    doc.setLineWidth(0.3);
    doc.line(ML, y, PW - MR, y);
    y += 8;

    // ── Sessions ──────────────────────────────────────────────────────────────
    const sessions = routine.sessions || [];

    sessions.forEach(function (session, si) {
      if (si > 0) y += 6;
      guardBreak(36);

      // Session bar
      doc.setFillColor(...BLUE);
      doc.rect(ML, y - 4, CW, 9.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(session.name || ('Día ' + (si + 1)), ML + 4, y + 2);

      const stats = [
        session.exercises && session.exercises.length ? session.exercises.length + ' ejercicios' : '',
        session.totalSets ? session.totalSets + ' series' : '',
        session.duration  ? '~' + session.duration + ' min' : '',
      ].filter(Boolean).join(' · ');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(180, 215, 255);
      doc.text(stats, PW - MR - 3, y + 2, { align: 'right' });

      y += 11;

      // Column layout
      var C = {
        name: { x: ML,       w: 68 },
        sets: { x: ML + 68,  w: 16 },
        reps: { x: ML + 84,  w: 22 },
        rir:  { x: ML + 106, w: 15 },
        rest: { x: ML + 121, w: 25 },
        kg:   { x: ML + 146, w: CW - 146 },
      };

      // Column header row
      doc.setFillColor(...LIGHT);
      doc.rect(ML, y - 3.5, CW, 7, 'F');
      doc.setDrawColor(...BORD);
      doc.setLineWidth(0.2);
      doc.rect(ML, y - 3.5, CW, 7, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...MUTED);
      doc.text('EJERCICIO',   C.name.x + 2,               y + 0.5);
      doc.text('×',           C.sets.x + C.sets.w / 2,    y + 0.5, { align: 'center' });
      doc.text('REPS',        C.reps.x + C.reps.w / 2,    y + 0.5, { align: 'center' });
      doc.text('RIR',         C.rir.x  + C.rir.w  / 2,    y + 0.5, { align: 'center' });
      doc.text('DESCANSO',    C.rest.x + C.rest.w / 2,    y + 0.5, { align: 'center' });
      doc.text('KG ✎',        C.kg.x   + C.kg.w   / 2,    y + 0.5, { align: 'center' });

      y += 8;

      // Exercise rows
      var exs = session.exercises || [];
      exs.forEach(function (ex, ei) {
        guardBreak(10);

        var ROW_H = 9.5;
        if (ei % 2 === 0) { doc.setFillColor(255, 255, 255); }
        else               { doc.setFillColor(250, 251, 253); }
        doc.rect(ML, y - 3.5, CW, ROW_H, 'F');
        doc.setDrawColor(...BORD);
        doc.setLineWidth(0.15);
        doc.rect(ML, y - 3.5, CW, ROW_H, 'S');

        var setsN = ex.setsCount != null ? ex.setsCount
                  : Array.isArray(ex.sets) ? ex.sets.length
                  : (ex.sets != null ? ex.sets : 3);

        // Exercise name — truncate to fit column
        var raw = ex.name || '';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        var available = C.name.w - 5;
        while (raw.length > 3 && doc.getTextWidth(raw) > available) {
          raw = raw.slice(0, -1);
        }
        var label = (raw.length < (ex.name || '').length) ? raw.slice(0, -1) + '…' : raw;
        doc.setTextColor(...NAVY);
        doc.text(label, C.name.x + 2, y + 0.5);

        // Muscle tag below name
        var muscle = (ex.muscles && ex.muscles.primary && ex.muscles.primary[0]) || '';
        if (muscle) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(...MUTED);
          doc.text(muscle, C.name.x + 2, y + 3.8);
        }

        // Series count (blue, bold, larger)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...BLUE);
        doc.text(String(setsN), C.sets.x + C.sets.w / 2, y + 1.5, { align: 'center' });

        // Reps range
        doc.setFontSize(8);
        doc.setTextColor(...NAVY);
        doc.text(ex.repsRange || '8-12', C.reps.x + C.reps.w / 2, y + 1.5, { align: 'center' });

        // RIR
        doc.setTextColor(...LBLUE);
        doc.text(String(ex.rir != null ? ex.rir : 2), C.rir.x + C.rir.w / 2, y + 1.5, { align: 'center' });

        // Rest
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(ex.rest || '90s', C.rest.x + C.rest.w / 2, y + 1.5, { align: 'center' });

        // KG field — dotted line for hand-writing
        doc.setDrawColor(180, 195, 215);
        doc.setLineWidth(0.35);
        doc.setLineDashPattern([1, 1.2], 0);
        doc.line(C.kg.x + 3, y + 2.5, C.kg.x + C.kg.w - 4, y + 2.5);
        doc.setLineDashPattern([], 0);

        y += ROW_H;
      });

      y += 4;
    });

    // ── Footer on every page ─────────────────────────────────────────────────
    var total = doc.internal.getNumberOfPages();
    for (var p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text('Atlas Method · atlasmethod.vercel.app', ML, PH - 9);
      if (total > 1) {
        doc.text(p + ' / ' + total, PW - MR, PH - 9, { align: 'right' });
      }
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    var dateTag = new Date().toISOString().slice(0, 10);
    var nameTag = (routine.name || 'rutina')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);

    doc.save('atlas-rutina-' + nameTag + '-' + dateTag + '.pdf');
  }

  Object.assign(window, { exportRoutinePDF: exportRoutinePDF });
})();
