// ExerciseImages — maps our exercise ids to free-exercise-db entries
// Source: github.com/yuhonas/free-exercise-db (public domain / Unlicense)
// Images: raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/<id>/0.jpg
//
// Single source of truth for exercise imagery: sections read via
// ExerciseImages.urlFor(id). Exercises without a mapping return null and the
// UI renders an elegant silhouette placeholder (navy) instead.

(function () {
  'use strict';

  const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

  // our-id → free-exercise-db folder id (null → no match, use placeholder)
  const MAP = {
    // ── Pecho ──────────────────────────────────────────────────────────────
    'press-banca-barra':        'Barbell_Bench_Press_-_Medium_Grip',
    'press-banca-mancuernas':   'Dumbbell_Bench_Press',
    'press-inclinado-barra':    'Barbell_Incline_Bench_Press_-_Medium_Grip',
    'press-inclinado-mancuernas':'Incline_Dumbbell_Press',
    'fondos-paralelas':         'Dips_-_Chest_Version',
    'fondos-lastre':            'Dips_-_Chest_Version',
    'aperturas-polea':          'Cable_Crossover',
    'cable-fly':                'Flat_Bench_Cable_Flyes',
    'cruce-poleas-bajo':        'Low_Cable_Crossover',
    'aperturas-mancuernas':     'Dumbbell_Flyes',
    'pec-deck':                 'Butterfly',
    'press-declinado-mancuernas':'Decline_Dumbbell_Bench_Press',
    'press-pecho-maquina':      'Machine_Bench_Press',
    'push-up':                  'Pushups',
    'push-up-diamante':         'Close-Grip_Push-Up_off_of_a_Dumbbell',
    'press-pecho-banda':        'Pushups',

    // ── Hombro ─────────────────────────────────────────────────────────────
    'press-militar-barra':      'Barbell_Shoulder_Press',
    'press-militar-mancuernas': 'Seated_Dumbbell_Press',
    'press-arnold':             'Arnold_Dumbbell_Press',
    'press-hombro-banda':       'Shoulder_Press_-_With_Bands',
    'elevaciones-laterales':    'Side_Lateral_Raise',
    'elevaciones-laterales-cable':'Cable_Seated_Lateral_Raise',
    'elevaciones-laterales-maquina':'Side_Lateral_Raise',
    'elevacion-lateral-polea-unilateral':'Cable_Seated_Lateral_Raise',
    'elevacion-frontal':        'Front_Dumbbell_Raise',
    'remo-al-menton':           'Upright_Barbell_Row',
    'apertura-inversa-mancuernas':'Seated_Bent-Over_Rear_Delt_Raise',
    'pajaros-mancuernas':       'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
    'reverse-pec-deck':         'Reverse_Machine_Flyes',
    'deltoides-posterior-polea-unilateral':'Cable_Rear_Delt_Fly',
    'face-pull':                'Face_Pull',

    // ── Tríceps ────────────────────────────────────────────────────────────
    'extensiones-triceps-polea':'Triceps_Pushdown',
    'extension-triceps-triangulo':'Triceps_Pushdown_-_V-Bar_Attachment',
    'extension-triceps-unilateral-polea':'Cable_One_Arm_Tricep_Extension',
    'extension-triceps-tras-nuca-mancuerna':'Seated_Triceps_Press',
    'extension-triceps-tras-nuca-cuerda':'Cable_Rope_Overhead_Triceps_Extension',
    'overhead-tricep-extension':'Seated_Triceps_Press',
    'extension-triceps-banda':  'Speed_Band_Overhead_Triceps',
    'skull-crusher':            'EZ-Bar_Skullcrusher',
    'press-agarre-cerrado':     'Close-Grip_Barbell_Bench_Press',
    'fondos-banco':             'Bench_Dips',
    'kickback-triceps':         'Tricep_Dumbbell_Kickback',

    // ── Espalda ────────────────────────────────────────────────────────────
    'remo-barra':               'Bent_Over_Barbell_Row',
    'remo-mancuerna':           'One-Arm_Dumbbell_Row',
    'remo-polea-baja':          'Seated_Cable_Rows',
    'remo-polea-triangulo':     'Seated_Cable_Rows',
    'remo-chest-supported':     'Bent_Over_Two-Dumbbell_Row',
    'remo-t-barra':             'T-Bar_Row_with_Handle',
    'remo-invertido':           'Inverted_Row',
    'remo-maquina':             'Seated_Cable_Rows',
    'remo-banda':               'Seated_Cable_Rows',
    'dominadas':                'Pullups',
    'dominadas-supinas':        'Chin-Up',
    'dominadas-lastre':         'Weighted_Pull_Ups',
    'jalon-polea':              'Wide-Grip_Lat_Pulldown',
    'jalon-neutro':             'Close-Grip_Front_Lat_Pulldown',
    'jalon-agarre-supino':      'Underhand_Cable_Pulldowns',
    'straight-arm-pulldown':    'Straight-Arm_Pulldown',
    'pullover-mancuerna':       'Bent-Arm_Dumbbell_Pullover',
    'encogimientos-trapecio':   'Barbell_Shrug',
    'encogimientos-mancuernas': 'Dumbbell_Shrug',

    // ── Bíceps / antebrazo ─────────────────────────────────────────────────
    'curl-biceps-barra':        'Barbell_Curl',
    'curl-biceps-mancuernas':   'Dumbbell_Bicep_Curl',
    'curl-inclinado-mancuernas':'Incline_Dumbbell_Curl',
    'curl-martillo':            'Hammer_Curls',
    'curl-predicador':          'Preacher_Curl',
    'curl-concentrado':         'Concentration_Curls',
    'curl-cable':               'Standing_Biceps_Cable_Curl',
    'curl-polea-alta':          'High_Cable_Curls',
    'curl-biceps-maquina':      'Machine_Preacher_Curls',
    'curl-biceps-banda':        'Dumbbell_Bicep_Curl',
    'curl-inverso-barra':       'Reverse_Barbell_Curl',
    'wrist-curl-mancuernas':    'Seated_Dumbbell_Palms-Up_Wrist_Curl',
    'wrist-extension-barra':    'Palms-Down_Wrist_Curl_Over_A_Bench',
    'farmer-walk':              'Farmers_Walk',

    // ── Pierna: cuádriceps / sentadilla ────────────────────────────────────
    'sentadilla-trasera':       'Barbell_Squat',
    'sentadilla-frontal':       'Front_Barbell_Squat',
    'goblet-squat':             'Goblet_Squat',
    'sentadilla-bulgara':       'Split_Squat_with_Dumbbells',
    'sentadilla-sumo':          'Plie_Dumbbell_Squat',
    'sentadilla-pistola':       'Kettlebell_Pistol_Squat',
    'sentadilla-banda':         'Squat_with_Bands',
    'hack-squat':               'Hack_Squat',
    'prensa-piernas':           'Leg_Press',
    'extension-cuadriceps':     'Leg_Extensions',
    'zancada-mancuernas':       'Dumbbell_Lunges',
    'zancada-caminando':        'Barbell_Walking_Lunge',
    'step-up-banco':            'Dumbbell_Step_Ups',

    // ── Pierna: posterior / glúteo ─────────────────────────────────────────
    'peso-muerto':              'Barbell_Deadlift',
    'peso-muerto-rumano':       'Romanian_Deadlift',
    'peso-muerto-sumo':         'Sumo_Deadlift',
    'rdl-mancuernas':           'Stiff-Legged_Dumbbell_Deadlift',
    'good-morning':             'Good_Morning',
    'curl-femoral-tumbado':     'Lying_Leg_Curls',
    'curl-femoral-sentado':     'Seated_Leg_Curl',
    'curl-femoral-banda':       'Seated_Band_Hamstring_Curl',
    'curl-nordico':             'Natural_Glute_Ham_Raise',
    'hip-thrust-barra':         'Barbell_Hip_Thrust',
    'hip-thrust-mancuernas':    'Barbell_Hip_Thrust',
    'hip-thrust-banda':         'Butt_Lift_Bridge',
    'puente-gluteo':            'Butt_Lift_Bridge',
    'patada-gluteo-polea':      'One-Legged_Cable_Kickback',
    'patada-gluteo-banda':      'Glute_Kickback',
    'pull-through-polea':       'Pull_Through',

    // ── Aductores / abductores ─────────────────────────────────────────────
    'maquina-aductores':        'Thigh_Adductor',
    'maquina-abductores':       'Thigh_Abductor',
    'abduccion-cadera':         'Thigh_Abductor',
    'hip-abduction-tumbado':    'Thigh_Abductor',
    'lateral-band-walk':        'Monster_Walk',

    // ── Gemelo / tibial ────────────────────────────────────────────────────
    'elevacion-talones':        'Standing_Calf_Raises',
    'elevacion-talones-sentado':'Seated_Calf_Raise',
    'elevacion-talones-prensa': 'Calf_Press_On_The_Leg_Press_Machine',
    'elevacion-talones-bodyweight':'Standing_Calf_Raises',
    'elevacion-talones-unilateral':'Calf_Raise_On_A_Dumbbell',
    'tibialis-raise-pared':     null,
    'tibialis-raise-banda':     null,

    // ── Core ───────────────────────────────────────────────────────────────
    'plancha-frontal':          'Plank',
    'plancha-lateral':          'Side_Bridge',
    'plancha-rll':              'Plank',
    'copenhagen-plank':         'Side_Bridge',
    'rueda-abdominal':          'Barbell_Ab_Rollout_-_On_Knees',
    'pallof-press':             'Pallof_Press',
    'pallof-press-banda':       'Pallof_Press',
    'crunch-cable':             'Cable_Crunch',
    'crunch-maquina':           'Ab_Crunch_Machine',
    'elevacion-piernas-colgado':'Hanging_Leg_Raise',
    'russian-twist':            'Russian_Twist',
    'rotacion-torso-polea':     'Cable_Russian_Twists',
    'dead-bug':                 'Dead_Bug',
    'bird-dog':                 null,
    'hollow-body-hold':         null,
  };

  // Returns the primary image URL for one of our exercise ids, or null.
  function urlFor(id) {
    if (!id) return null;
    const fdb = MAP[id];
    if (!fdb) return null;
    return BASE + fdb + '/0.jpg';
  }

  // Second image (many entries have a /1.jpg contraction frame), or null.
  function url2For(id) {
    if (!id) return null;
    const fdb = MAP[id];
    if (!fdb) return null;
    return BASE + fdb + '/1.jpg';
  }

  function hasImage(id) { return !!MAP[id]; }

  Object.assign(window, {
    ExerciseImages: { urlFor, url2For, hasImage, BASE, MAP },
  });
})();
