// ExerciseService — rich exercise database with smart selection

// ─── Database ─────────────────────────────────────────────────────────────────

const EXERCISES_DB = [
  // ── EMPUJE HORIZONTAL ────────────────────────────────────────────────────────
  {
    id: 'press-banca-barra',
    name: 'Press banca con barra',
    pattern: 'empuje-horizontal',
    category: 'empuje',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 3,
    muscles: { primary: ['Pectoral mayor'], secondary: ['Tríceps', 'Deltoides ant.'] },
    variants: ['press-banca-mancuernas', 'press-inclinado-barra'],
    objectives: ['hipertrofia', 'fuerza', 'recomp'],
    tags: ['pecho', 'clásico', 'barra'],
    cues: ['Escápulas retraídas y deprimidas', 'Pies firmes en el suelo', 'Baja controlado al esternón', 'Empuja oblicuo hacia arriba'],
  },
  {
    id: 'press-banca-mancuernas',
    name: 'Press banca con mancuernas',
    pattern: 'empuje-horizontal',
    category: 'empuje',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 2,
    muscles: { primary: ['Pectoral mayor'], secondary: ['Tríceps', 'Deltoides ant.'] },
    variants: ['press-banca-barra', 'press-inclinado-mancuernas'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['pecho', 'equilibrio', 'unilateral'],
    cues: ['Controla la fase excéntrica', 'Rango completo de movimiento', 'No bloquees codos en el top'],
  },
  {
    id: 'press-inclinado-barra',
    name: 'Press inclinado con barra',
    pattern: 'empuje-horizontal',
    category: 'empuje',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 3,
    muscles: { primary: ['Pectoral superior', 'Deltoides ant.'], secondary: ['Tríceps'] },
    variants: ['press-inclinado-mancuernas', 'press-banca-barra'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['pecho-superior', 'barra'],
    cues: ['Inclinación 30-45°', 'Barra al tercio superior del pecho'],
  },
  {
    id: 'press-inclinado-mancuernas',
    name: 'Press inclinado con mancuernas',
    pattern: 'empuje-horizontal',
    category: 'empuje',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 2,
    technicalDifficulty: 2,
    muscles: { primary: ['Pectoral superior'], secondary: ['Tríceps', 'Deltoides ant.'] },
    variants: ['press-inclinado-barra', 'press-banca-mancuernas'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['pecho-superior', 'principiante'],
    cues: ['Controla la apertura en el descenso'],
  },
  {
    id: 'fondos-paralelas',
    name: 'Fondos en paralelas',
    pattern: 'empuje-horizontal',
    category: 'empuje',
    level: 'intermedio',
    equipment: 'bodyweight',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 3,
    muscles: { primary: ['Pectoral inferior', 'Tríceps'], secondary: ['Deltoides ant.'] },
    variants: ['fondos-lastre', 'press-banca-barra'],
    objectives: ['hipertrofia', 'recomp', 'rendimiento'],
    tags: ['bodyweight', 'funcional', 'pecho-inferior'],
    cues: ['Inclínate hacia delante para enfatizar pecho', 'Baja hasta 90° en el codo'],
  },
  {
    id: 'aperturas-polea',
    name: 'Aperturas en polea cruzada',
    pattern: 'empuje-horizontal',
    category: 'empuje',
    level: 'principiante',
    equipment: 'polea',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 2,
    muscles: { primary: ['Pectoral mayor'], secondary: [] },
    variants: ['press-banca-mancuernas'],
    objectives: ['hipertrofia'],
    tags: ['aislamiento', 'pecho', 'polea'],
    cues: ['Tensión constante en el pectoral', 'Ligera flexión del codo fija'],
  },

  // ── EMPUJE VERTICAL ───────────────────────────────────────────────────────────
  {
    id: 'press-militar-barra',
    name: 'Press militar con barra',
    pattern: 'empuje-vertical',
    category: 'empuje',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 4,
    muscles: { primary: ['Deltoides anterior', 'Deltoides medial'], secondary: ['Tríceps', 'Trapecio superior', 'Core'] },
    variants: ['press-militar-mancuernas', 'press-arnold'],
    objectives: ['hipertrofia', 'fuerza', 'rendimiento'],
    tags: ['hombros', 'fuerza', 'barra'],
    cues: ['Activa el core durante todo el movimiento', 'Evita extensión lumbar excesiva', 'Barra sube vertical frente al rostro'],
  },
  {
    id: 'press-militar-mancuernas',
    name: 'Press con mancuernas sentado',
    pattern: 'empuje-vertical',
    category: 'empuje',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 2,
    muscles: { primary: ['Deltoides anterior', 'Deltoides medial'], secondary: ['Tríceps'] },
    variants: ['press-militar-barra', 'press-arnold'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['hombros', 'principiante'],
    cues: ['Codos ligeramente por delante del plano frontal'],
  },
  {
    id: 'press-arnold',
    name: 'Press Arnold',
    pattern: 'empuje-vertical',
    category: 'empuje',
    level: 'intermedio',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 3,
    muscles: { primary: ['Deltoides anterior', 'Deltoides medial'], secondary: ['Tríceps', 'Deltoides posterior'] },
    variants: ['press-militar-mancuernas'],
    objectives: ['hipertrofia'],
    tags: ['hombros', 'rotación', 'clásico'],
    cues: ['Pronación controlada al subir', 'Rango completo de rotación'],
  },
  {
    id: 'elevaciones-laterales',
    name: 'Elevaciones laterales',
    pattern: 'empuje-vertical',
    category: 'empuje',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 2,
    muscles: { primary: ['Deltoides medial'], secondary: [] },
    variants: ['elevaciones-laterales-polea'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['aislamiento', 'hombros', 'deltoides-medial'],
    cues: ['Ligera inclinación del torso', 'Pulgares ligeramente hacia abajo', 'No superes la altura del hombro'],
  },
  {
    id: 'extensiones-triceps-polea',
    name: 'Extensiones tríceps en polea',
    pattern: 'empuje-vertical',
    category: 'empuje',
    level: 'principiante',
    equipment: 'polea',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 1,
    muscles: { primary: ['Tríceps braquial'], secondary: [] },
    variants: ['skull-crusher'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['aislamiento', 'tríceps', 'polea'],
    cues: ['Codos pegados al cuerpo y fijos', 'Extensión completa en el fondo'],
  },

  // ── TRACCIÓN HORIZONTAL ───────────────────────────────────────────────────────
  {
    id: 'remo-barra',
    name: 'Remo con barra pronado',
    pattern: 'traccion-horizontal',
    category: 'traccion',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 4,
    muscles: { primary: ['Dorsal ancho', 'Romboides'], secondary: ['Bíceps', 'Trapecio medio', 'Deltoides post.'] },
    variants: ['remo-mancuerna', 'remo-polea-baja'],
    objectives: ['hipertrofia', 'fuerza', 'rendimiento'],
    tags: ['espalda', 'fuerza', 'barra'],
    cues: ['Torso a 45-70°', 'Codos a los costados', 'Retracción escapular al final'],
  },
  {
    id: 'remo-mancuerna',
    name: 'Remo a una mano con mancuerna',
    pattern: 'traccion-horizontal',
    category: 'traccion',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 2,
    muscles: { primary: ['Dorsal ancho', 'Romboides'], secondary: ['Bíceps', 'Deltoides post.'] },
    variants: ['remo-barra', 'remo-polea-baja'],
    objectives: ['hipertrofia', 'recomp', 'rendimiento'],
    tags: ['espalda', 'unilateral', 'principiante'],
    cues: ['Apoya la rodilla en el banco', 'Lleva el codo alto y atrás'],
  },
  {
    id: 'remo-polea-baja',
    name: 'Remo en polea baja',
    pattern: 'traccion-horizontal',
    category: 'traccion',
    level: 'principiante',
    equipment: 'polea',
    compound: true,
    fatigueLoad: 2,
    technicalDifficulty: 2,
    muscles: { primary: ['Dorsal ancho', 'Romboides'], secondary: ['Bíceps'] },
    variants: ['remo-mancuerna', 'remo-barra'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['espalda', 'polea', 'principiante'],
    cues: ['Torso erguido al final del recorrido', 'Retrae escápulas activamente'],
  },
  {
    id: 'face-pull',
    name: 'Face pull en polea alta',
    pattern: 'traccion-horizontal',
    category: 'traccion',
    level: 'principiante',
    equipment: 'polea',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 2,
    muscles: { primary: ['Deltoides posterior', 'Romboides'], secondary: ['Trapecio medio', 'Manguito rotador'] },
    variants: [],
    objectives: ['hipertrofia', 'recomp', 'rendimiento', 'fuerza'],
    tags: ['hombros-posterior', 'salud', 'prevención'],
    cues: ['Cuerda hasta la frente', 'Codos altos al final', 'Rotación externa en el tope'],
  },
  {
    id: 'remo-chest-supported',
    name: 'Remo con mancuernas en banco inclinado',
    pattern: 'traccion-horizontal',
    category: 'traccion',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 2,
    technicalDifficulty: 1,
    muscles: { primary: ['Romboides', 'Trapecio medio'], secondary: ['Dorsal ancho', 'Bíceps'] },
    variants: ['remo-mancuerna', 'face-pull'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['espalda-alta', 'chest-supported', 'seguro'],
    cues: ['Pecho apoyado elimina el trampeo', 'Retracción escapular completa'],
  },

  // ── TRACCIÓN VERTICAL ─────────────────────────────────────────────────────────
  {
    id: 'dominadas',
    name: 'Dominadas pronadas',
    pattern: 'traccion-vertical',
    category: 'traccion',
    level: 'intermedio',
    equipment: 'bodyweight',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 4,
    muscles: { primary: ['Dorsal ancho'], secondary: ['Bíceps', 'Romboides', 'Infraespinoso'] },
    variants: ['dominadas-supinas', 'jalon-polea'],
    objectives: ['hipertrofia', 'fuerza', 'rendimiento'],
    tags: ['bodyweight', 'espalda', 'clásico'],
    cues: ['Deprime las escápulas antes de tirar', 'Codos hacia abajo y atrás', 'Rango completo arriba y abajo'],
  },
  {
    id: 'dominadas-supinas',
    name: 'Chin-ups (dominadas supinas)',
    pattern: 'traccion-vertical',
    category: 'traccion',
    level: 'intermedio',
    equipment: 'bodyweight',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 3,
    muscles: { primary: ['Dorsal ancho', 'Bíceps braquial'], secondary: ['Romboides'] },
    variants: ['dominadas', 'jalon-polea'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['bodyweight', 'bíceps', 'espalda'],
    cues: ['Agarre supino activa más el bíceps', 'Codos cerca del torso'],
  },
  {
    id: 'jalon-polea',
    name: 'Jalón en polea con barra ancha',
    pattern: 'traccion-vertical',
    category: 'traccion',
    level: 'principiante',
    equipment: 'polea',
    compound: true,
    fatigueLoad: 2,
    technicalDifficulty: 2,
    muscles: { primary: ['Dorsal ancho'], secondary: ['Bíceps', 'Romboides'] },
    variants: ['dominadas', 'jalon-neutro'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['espalda', 'polea', 'principiante'],
    cues: ['Inclínate ligeramente hacia atrás', 'Lleva la barra al esternón'],
  },
  {
    id: 'curl-biceps-barra',
    name: 'Curl bíceps con barra',
    pattern: 'traccion-vertical',
    category: 'traccion',
    level: 'principiante',
    equipment: 'barra',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 1,
    muscles: { primary: ['Bíceps braquial'], secondary: ['Braquial', 'Braquiorradial'] },
    variants: ['curl-biceps-mancuernas', 'curl-martillo'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['aislamiento', 'bíceps'],
    cues: ['Codos fijos a los costados', 'Supinación completa en el tope'],
  },
  {
    id: 'curl-martillo',
    name: 'Curl martillo con mancuernas',
    pattern: 'traccion-vertical',
    category: 'traccion',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 1,
    muscles: { primary: ['Braquial', 'Braquiorradial'], secondary: ['Bíceps braquial'] },
    variants: ['curl-biceps-barra'],
    objectives: ['hipertrofia'],
    tags: ['aislamiento', 'bíceps', 'antebrazo'],
    cues: ['Agarre neutro durante todo el recorrido'],
  },

  // ── SENTADILLA ────────────────────────────────────────────────────────────────
  {
    id: 'sentadilla-trasera',
    name: 'Sentadilla trasera con barra',
    pattern: 'sentadilla',
    category: 'pierna',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 5,
    technicalDifficulty: 4,
    muscles: { primary: ['Cuádriceps', 'Glúteos'], secondary: ['Isquios', 'Erectores espinales', 'Core'] },
    variants: ['sentadilla-frontal', 'goblet-squat', 'hack-squat'],
    objectives: ['hipertrofia', 'fuerza', 'recomp', 'rendimiento'],
    tags: ['pierna', 'fuerza', 'clásico', 'barra'],
    cues: ['Rodillas alineadas con los pies', 'Pecho alto durante todo el recorrido', 'Profundidad mínima paralela', 'Empuja el suelo hacia abajo'],
  },
  {
    id: 'sentadilla-frontal',
    name: 'Sentadilla frontal con barra',
    pattern: 'sentadilla',
    category: 'pierna',
    level: 'avanzado',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 5,
    technicalDifficulty: 5,
    muscles: { primary: ['Cuádriceps'], secondary: ['Glúteos', 'Core', 'Erectores'] },
    variants: ['sentadilla-trasera'],
    objectives: ['fuerza', 'rendimiento'],
    tags: ['pierna', 'técnico', 'cuádriceps', 'avanzado'],
    cues: ['Codos altos y delante', 'Movilidad de muñeca y tobillo crítica'],
  },
  {
    id: 'goblet-squat',
    name: 'Goblet squat con kettlebell',
    pattern: 'sentadilla',
    category: 'pierna',
    level: 'principiante',
    equipment: 'kettlebell',
    compound: true,
    fatigueLoad: 2,
    technicalDifficulty: 2,
    muscles: { primary: ['Cuádriceps', 'Glúteos'], secondary: ['Core', 'Isquios'] },
    variants: ['sentadilla-trasera', 'sentadilla-bulgara'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['pierna', 'principiante', 'funcional'],
    cues: ['Peso frente al pecho como contrapeso', 'Codos empujan las rodillas hacia afuera'],
  },
  {
    id: 'sentadilla-bulgara',
    name: 'Sentadilla búlgara (RFESS)',
    pattern: 'sentadilla',
    category: 'pierna',
    level: 'intermedio',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 3,
    muscles: { primary: ['Cuádriceps', 'Glúteos'], secondary: ['Isquios', 'Core'] },
    variants: ['sentadilla-trasera', 'zancada'],
    objectives: ['hipertrofia', 'recomp', 'rendimiento'],
    tags: ['pierna', 'unilateral', 'glúteos'],
    cues: ['Pie trasero sobre banco a la altura de la cadera', 'Rodilla delantera no supera la punta del pie'],
  },
  {
    id: 'hack-squat',
    name: 'Hack squat en máquina',
    pattern: 'sentadilla',
    category: 'pierna',
    level: 'principiante',
    equipment: 'máquina',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 2,
    muscles: { primary: ['Cuádriceps'], secondary: ['Glúteos', 'Isquios'] },
    variants: ['sentadilla-trasera', 'prensa-piernas'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['pierna', 'cuádriceps', 'máquina'],
    cues: ['Pies medios-bajos en la plataforma para más cuádriceps', 'Profundidad completa'],
  },
  {
    id: 'prensa-piernas',
    name: 'Prensa de piernas 45°',
    pattern: 'sentadilla',
    category: 'pierna',
    level: 'principiante',
    equipment: 'máquina',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 1,
    muscles: { primary: ['Cuádriceps', 'Glúteos'], secondary: ['Isquios'] },
    variants: ['hack-squat', 'sentadilla-trasera'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['pierna', 'máquina', 'seguro'],
    cues: ['No bloquees completamente las rodillas', 'Pies altos para más glúteos, bajos para más cuádriceps'],
  },
  {
    id: 'extension-cuadriceps',
    name: 'Extensión de cuádriceps',
    pattern: 'sentadilla',
    category: 'pierna',
    level: 'principiante',
    equipment: 'máquina',
    compound: false,
    fatigueLoad: 2,
    technicalDifficulty: 1,
    muscles: { primary: ['Cuádriceps'], secondary: [] },
    variants: [],
    objectives: ['hipertrofia'],
    tags: ['aislamiento', 'cuádriceps', 'máquina'],
    cues: ['Extensión completa en el tope', 'Excéntrica lenta (3 seg)'],
  },

  // ── BISAGRA DE CADERA ─────────────────────────────────────────────────────────
  {
    id: 'peso-muerto',
    name: 'Peso muerto convencional',
    pattern: 'bisagra',
    category: 'traccion',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 5,
    technicalDifficulty: 5,
    muscles: { primary: ['Isquios', 'Glúteos', 'Erectores espinales'], secondary: ['Trapecio', 'Romboides', 'Cuádriceps', 'Core'] },
    variants: ['peso-muerto-rumano', 'rdl-mancuernas'],
    objectives: ['fuerza', 'rendimiento', 'hipertrofia'],
    tags: ['compuesto', 'fuerza', 'posterior', 'clásico'],
    cues: ['Barra sobre el mediopié', 'Espalda neutra antes de tirar', 'Empuja el suelo, no tires de la barra', 'Bloqueo con cadera al frente'],
  },
  {
    id: 'peso-muerto-rumano',
    name: 'Peso muerto rumano (RDL) con barra',
    pattern: 'bisagra',
    category: 'pierna',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 3,
    muscles: { primary: ['Isquios', 'Glúteos'], secondary: ['Erectores', 'Core'] },
    variants: ['rdl-mancuernas', 'peso-muerto'],
    objectives: ['hipertrofia', 'recomp', 'rendimiento'],
    tags: ['isquios', 'glúteos', 'bisagra'],
    cues: ['Empuja las caderas hacia atrás', 'Rodillas ligeramente flexionadas y fijas', 'Barra pegada al cuerpo'],
  },
  {
    id: 'rdl-mancuernas',
    name: 'RDL con mancuernas',
    pattern: 'bisagra',
    category: 'pierna',
    level: 'principiante',
    equipment: 'mancuernas',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 2,
    muscles: { primary: ['Isquios', 'Glúteos'], secondary: ['Erectores'] },
    variants: ['peso-muerto-rumano'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['isquios', 'glúteos', 'principiante'],
    cues: ['Mancuernas a los costados de los muslos', 'Empuje de caderas atrás hasta sentir tensión en isquios'],
  },
  {
    id: 'hip-thrust-barra',
    name: 'Hip thrust con barra',
    pattern: 'bisagra',
    category: 'pierna',
    level: 'intermedio',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 3,
    technicalDifficulty: 2,
    muscles: { primary: ['Glúteos'], secondary: ['Isquios', 'Core'] },
    variants: ['hip-thrust-mancuernas', 'puente-gluteo'],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['glúteos', 'bisagra'],
    cues: ['Barbilla en el pecho', 'Extensión completa de cadera en el tope', 'Pies alineados debajo de las rodillas'],
  },
  {
    id: 'curl-femoral-tumbado',
    name: 'Curl femoral tumbado',
    pattern: 'bisagra',
    category: 'pierna',
    level: 'principiante',
    equipment: 'máquina',
    compound: false,
    fatigueLoad: 2,
    technicalDifficulty: 1,
    muscles: { primary: ['Isquios'], secondary: [] },
    variants: ['curl-nordico'],
    objectives: ['hipertrofia'],
    tags: ['aislamiento', 'isquios', 'máquina'],
    cues: ['Flexión completa (talón al glúteo)', 'Excéntrica controlada'],
  },
  {
    id: 'good-morning',
    name: 'Good morning',
    pattern: 'bisagra',
    category: 'pierna',
    level: 'avanzado',
    equipment: 'barra',
    compound: true,
    fatigueLoad: 4,
    technicalDifficulty: 5,
    muscles: { primary: ['Isquios', 'Erectores espinales'], secondary: ['Glúteos', 'Core'] },
    variants: ['peso-muerto-rumano'],
    objectives: ['fuerza', 'rendimiento'],
    tags: ['posterior', 'técnico', 'avanzado'],
    cues: ['Cargas muy ligeras al aprender', 'Espalda neutra en todo momento'],
  },

  // ── CORE ──────────────────────────────────────────────────────────────────────
  {
    id: 'plancha-frontal',
    name: 'Plancha frontal',
    pattern: 'core-antiextension',
    category: 'core',
    level: 'principiante',
    equipment: 'bodyweight',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 1,
    muscles: { primary: ['Transverso abdominal', 'Core'], secondary: ['Deltoides', 'Glúteos'] },
    variants: ['plancha-rll', 'rueda-abdominal'],
    objectives: ['hipertrofia', 'recomp', 'rendimiento', 'fuerza'],
    tags: ['core', 'estabilización', 'principiante'],
    cues: ['Cuerpo en línea recta de cabeza a talones', 'Activa glúteos y aprieta el core', 'No aguantes el aliento'],
  },
  {
    id: 'rueda-abdominal',
    name: 'Rueda abdominal (ab-wheel rollout)',
    pattern: 'core-antiextension',
    category: 'core',
    level: 'avanzado',
    equipment: 'rueda',
    compound: false,
    fatigueLoad: 3,
    technicalDifficulty: 4,
    muscles: { primary: ['Core', 'Dorsal ancho'], secondary: ['Tríceps', 'Deltoides'] },
    variants: ['plancha-frontal'],
    objectives: ['rendimiento', 'fuerza'],
    tags: ['core', 'antiextensión', 'avanzado'],
    cues: ['Comienza con el recorrido corto y amplía progresivamente', 'Columna neutra durante la extensión'],
  },
  {
    id: 'pallof-press',
    name: 'Pallof press en polea',
    pattern: 'core-antirrotacion',
    category: 'core',
    level: 'principiante',
    equipment: 'polea',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 2,
    muscles: { primary: ['Oblicuos', 'Transverso abdominal'], secondary: ['Core'] },
    variants: [],
    objectives: ['rendimiento', 'fuerza', 'hipertrofia'],
    tags: ['core', 'antirrotación', 'funcional'],
    cues: ['Pies a la anchura de los hombros perpendiculares a la polea', 'Resiste la rotación del torso al extender'],
  },
  {
    id: 'crunch-cable',
    name: 'Crunch en polea alta',
    pattern: 'core-flexion',
    category: 'core',
    level: 'principiante',
    equipment: 'polea',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 2,
    muscles: { primary: ['Recto abdominal'], secondary: ['Oblicuos'] },
    variants: [],
    objectives: ['hipertrofia'],
    tags: ['core', 'abdomen', 'aislamiento'],
    cues: ['Rodillas en el suelo', 'Contrae enrollando la columna, no empujando la cabeza'],
  },
  {
    id: 'elevacion-piernas-colgado',
    name: 'Elevación de piernas colgado',
    pattern: 'core-flexion',
    category: 'core',
    level: 'intermedio',
    equipment: 'bodyweight',
    compound: false,
    fatigueLoad: 2,
    technicalDifficulty: 3,
    muscles: { primary: ['Recto abdominal inferior', 'Flexores de cadera'], secondary: ['Oblicuos'] },
    variants: ['crunch-cable'],
    objectives: ['rendimiento', 'hipertrofia'],
    tags: ['core', 'abdomen', 'funcional'],
    cues: ['Controla el descenso lento', 'Evita el balanceo del cuerpo'],
  },

  // ── PANTORRILLA ───────────────────────────────────────────────────────────────
  {
    id: 'elevacion-talones',
    name: 'Elevación de talones de pie',
    pattern: 'aislamiento-pantorrilla',
    category: 'pierna',
    level: 'principiante',
    equipment: 'máquina',
    compound: false,
    fatigueLoad: 1,
    technicalDifficulty: 1,
    muscles: { primary: ['Gemelos', 'Sóleo'], secondary: [] },
    variants: [],
    objectives: ['hipertrofia', 'recomp'],
    tags: ['gemelos', 'aislamiento', 'pantorrilla'],
    cues: ['Rango completo arriba y abajo', 'Pausa de 1 seg en el tope'],
  },
];

// ─── Metadata ────────────────────────────────────────────────────────────────

const PATTERN_META = {
  'empuje-horizontal':     { label: 'Empuje horizontal',  short: 'Emp. H',  color: '#2A6FDB', bg: 'rgba(42,111,219,0.08)' },
  'empuje-vertical':       { label: 'Empuje vertical',    short: 'Emp. V',  color: '#2A6FDB', bg: 'rgba(42,111,219,0.08)' },
  'traccion-horizontal':   { label: 'Tracción horizontal', short: 'Trac. H', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  'traccion-vertical':     { label: 'Tracción vertical',   short: 'Trac. V', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  'sentadilla':            { label: 'Sentadilla',          short: 'Sent.',   color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  'bisagra':               { label: 'Bisagra de cadera',   short: 'Bisagra', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  'core-antiextension':    { label: 'Core anti-extensión', short: 'Core',    color: '#1F8B3A', bg: 'rgba(31,139,58,0.08)' },
  'core-antirrotacion':    { label: 'Core anti-rotación',  short: 'Core',    color: '#1F8B3A', bg: 'rgba(31,139,58,0.08)' },
  'core-flexion':          { label: 'Core flexión',        short: 'Core',    color: '#1F8B3A', bg: 'rgba(31,139,58,0.08)' },
  'aislamiento-pantorrilla': { label: 'Pantorrilla',       short: 'Pant.',   color: '#5C6477', bg: 'rgba(92,100,119,0.08)' },
};

const EQUIPMENT_META = {
  barra:       { label: 'Barra',       color: '#0F1A2E', bg: 'rgba(15,26,46,0.07)' },
  mancuernas:  { label: 'Mancuernas',  color: '#1a4fa0', bg: 'rgba(42,111,219,0.08)' },
  bodyweight:  { label: 'Bodyweight',  color: '#1F8B3A', bg: 'rgba(31,139,58,0.08)' },
  polea:       { label: 'Polea',       color: '#C24545', bg: 'rgba(194,69,69,0.08)' },
  máquina:     { label: 'Máquina',     color: '#5C6477', bg: 'rgba(92,100,119,0.12)' },
  kettlebell:  { label: 'Kettlebell',  color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  rueda:       { label: 'Rueda ab.',   color: '#5C6477', bg: 'rgba(92,100,119,0.12)' },
};

// Objective weights: how to score and select exercises
const OBJECTIVE_WEIGHTS = {
  hipertrofia: { compoundBonus: 40, isolationBonus: 20, fatigueMax: 5, techMin: 1, techMax: 4 },
  fuerza:      { compoundBonus: 80, isolationBonus: 0,  fatigueMax: 5, techMin: 3, techMax: 5 },
  recomp:      { compoundBonus: 50, isolationBonus: 15, fatigueMax: 4, techMin: 1, techMax: 4 },
  rendimiento: { compoundBonus: 70, isolationBonus: 5,  fatigueMax: 5, techMin: 3, techMax: 5 },
};

// Which movement patterns each session type should cover
const SESSION_PATTERN_MAP = {
  'Push':    [{ p: 'empuje-horizontal', n: 2 }, { p: 'empuje-vertical', n: 2 }],
  'Pull':    [{ p: 'traccion-vertical', n: 2 }, { p: 'traccion-horizontal', n: 2 }],
  'Legs':    [{ p: 'sentadilla', n: 2 }, { p: 'bisagra', n: 2 }, { p: 'aislamiento-pantorrilla', n: 1 }],
  'Upper A': [{ p: 'empuje-horizontal', n: 2 }, { p: 'traccion-vertical', n: 2 }, { p: 'empuje-vertical', n: 1 }],
  'Upper B': [{ p: 'empuje-vertical', n: 2 }, { p: 'traccion-horizontal', n: 2 }, { p: 'empuje-horizontal', n: 1 }],
  'Lower A': [{ p: 'sentadilla', n: 2 }, { p: 'bisagra', n: 2 }],
  'Lower B': [{ p: 'bisagra', n: 2 }, { p: 'sentadilla', n: 2 }],
  'Full A':  [{ p: 'sentadilla', n: 1 }, { p: 'empuje-horizontal', n: 1 }, { p: 'traccion-vertical', n: 1 }, { p: 'bisagra', n: 1 }],
  'Full B':  [{ p: 'bisagra', n: 1 }, { p: 'empuje-vertical', n: 1 }, { p: 'traccion-horizontal', n: 1 }, { p: 'sentadilla', n: 1 }],
  'Full C':  [{ p: 'sentadilla', n: 1 }, { p: 'empuje-horizontal', n: 1 }, { p: 'traccion-horizontal', n: 1 }, { p: 'bisagra', n: 1 }],
};

// ─── Core scoring function ─────────────────────────────────────────────────────

function scoreExercise(ex, objetivo, nivel, usedPatternCounts) {
  const w = OBJECTIVE_WEIGHTS[objetivo] || OBJECTIVE_WEIGHTS.hipertrofia;
  let score = 100;

  // Compound preference per objective
  score += ex.compound ? w.compoundBonus : w.isolationBonus;

  // Technical difficulty fit
  if (ex.technicalDifficulty >= w.techMin && ex.technicalDifficulty <= w.techMax) score += 20;
  else score -= 15;

  // Level match
  if (ex.level === nivel) score += 30;
  else if (ex.level === 'principiante') score += 10;
  else if (ex.level === 'avanzado' && nivel !== 'avanzado') score -= 40;

  // Fatigue ceiling
  if (ex.fatigueLoad > w.fatigueMax) score -= 60;

  // Slightly prefer variety (penalize patterns already well-represented)
  const patternCount = usedPatternCounts[ex.pattern] || 0;
  score -= patternCount * 8;

  return score;
}

// ─── Public API ───────────────────────────────────────────────────────────────

const ExerciseService = {

  getAll(filters = {}) {
    let list = [...EXERCISES_DB];
    if (filters.pattern) list = list.filter(e => e.pattern === filters.pattern);
    if (filters.category) list = list.filter(e => e.category === filters.category);
    if (filters.equipment) list = list.filter(e => e.equipment === filters.equipment);
    if (filters.level) list = list.filter(e => e.level === filters.level);
    if (filters.objective) list = list.filter(e => e.objectives.includes(filters.objective));
    if (filters.compound !== undefined) list = list.filter(e => e.compound === filters.compound);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.tags.some(t => t.includes(q)) ||
        e.muscles.primary.some(m => m.toLowerCase().includes(q)) ||
        e.muscles.secondary.some(m => m.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getById(id) {
    return EXERCISES_DB.find(e => e.id === id) || null;
  },

  getVariants(id) {
    const ex = ExerciseService.getById(id);
    if (!ex) return [];
    return ex.variants.map(vid => ExerciseService.getById(vid)).filter(Boolean);
  },

  // Smart exercise selection for a given session type, objetivo, nivel, tiempo
  selectForSession(sessionLabel, objetivo, nivel, tiempo, excludeIds = []) {
    const slots = SESSION_PATTERN_MAP[sessionLabel] || SESSION_PATTERN_MAP['Full A'];
    const maxEx = tiempo <= 45 ? 4 : tiempo <= 60 ? 5 : 7;
    const selected = [];
    const usedIds = new Set(excludeIds);
    const usedPatternCounts = {};

    for (const slot of slots) {
      if (selected.length >= maxEx) break;

      const candidates = EXERCISES_DB.filter(ex =>
        ex.pattern === slot.p &&
        !usedIds.has(ex.id) &&
        ex.objectives.includes(objetivo) &&
        (nivel === 'principiante' ? ex.level !== 'avanzado' : true)
      );

      const scored = candidates
        .map(ex => ({ ...ex, _score: scoreExercise(ex, objetivo, nivel, usedPatternCounts) }))
        .sort((a, b) => b._score - a._score);

      const toAdd = scored.slice(0, Math.min(slot.n, maxEx - selected.length));
      toAdd.forEach(ex => {
        selected.push(ex);
        usedIds.add(ex.id);
        usedPatternCounts[ex.pattern] = (usedPatternCounts[ex.pattern] || 0) + 1;
      });
    }

    // Add one core exercise if time allows
    if (tiempo >= 60 && selected.length < maxEx) {
      const corePatterns = ['core-antiextension', 'core-antirrotacion', 'core-flexion'];
      const coreEx = EXERCISES_DB.find(ex =>
        corePatterns.includes(ex.pattern) &&
        !usedIds.has(ex.id) &&
        (nivel === 'principiante' ? ex.level !== 'avanzado' : true)
      );
      if (coreEx) selected.push(coreEx);
    }

    return selected;
  },

  // Suggest exercises to complement an existing workout (for Builder "Sugeridos" tab)
  suggestForWorkout(currentExercises, objetivo = 'hipertrofia', nivel = 'intermedio', limit = 5) {
    const usedIds = new Set(currentExercises.map(e => e.id));
    const patternCounts = {};
    currentExercises.forEach(ex => {
      patternCounts[ex.pattern] = (patternCounts[ex.pattern] || 0) + 1;
    });

    // Identify the most under-represented antagonist
    const pushCount = (patternCounts['empuje-horizontal'] || 0) + (patternCounts['empuje-vertical'] || 0);
    const pullCount = (patternCounts['traccion-horizontal'] || 0) + (patternCounts['traccion-vertical'] || 0);
    const quadCount = patternCounts['sentadilla'] || 0;
    const postCount = patternCounts['bisagra'] || 0;
    const coreCount = (patternCounts['core-antiextension'] || 0) + (patternCounts['core-antirrotacion'] || 0) + (patternCounts['core-flexion'] || 0);

    // Build inverse-frequency score for pattern suggestions
    const inversePatternWeights = {};
    Object.keys(PATTERN_META).forEach(p => {
      inversePatternWeights[p] = 1 / ((patternCounts[p] || 0) + 1);
    });

    // Boost antagonist patterns
    if (pushCount > pullCount) {
      inversePatternWeights['traccion-horizontal'] *= 3;
      inversePatternWeights['traccion-vertical'] *= 3;
    }
    if (pullCount > pushCount) {
      inversePatternWeights['empuje-horizontal'] *= 3;
      inversePatternWeights['empuje-vertical'] *= 3;
    }
    if (quadCount > postCount) {
      inversePatternWeights['bisagra'] *= 3;
    }
    if (postCount > quadCount) {
      inversePatternWeights['sentadilla'] *= 3;
    }
    if (coreCount === 0 && currentExercises.length >= 3) {
      inversePatternWeights['core-antiextension'] *= 5;
      inversePatternWeights['core-antirrotacion'] *= 5;
    }

    const scored = EXERCISES_DB
      .filter(ex =>
        !usedIds.has(ex.id) &&
        ex.objectives.includes(objetivo) &&
        (nivel === 'principiante' ? ex.level !== 'avanzado' : true)
      )
      .map(ex => ({
        ...ex,
        _score: scoreExercise(ex, objetivo, nivel, patternCounts) * (inversePatternWeights[ex.pattern] || 1),
      }))
      .sort((a, b) => b._score - a._score);

    return scored.slice(0, limit);
  },

  // Compute push:pull and quad:posterior balance ratios
  computeBalance(exercises) {
    const push = exercises.filter(e => e.pattern === 'empuje-horizontal' || e.pattern === 'empuje-vertical').length;
    const pull = exercises.filter(e => e.pattern === 'traccion-horizontal' || e.pattern === 'traccion-vertical').length;
    const quad = exercises.filter(e => e.pattern === 'sentadilla').length;
    const post = exercises.filter(e => e.pattern === 'bisagra').length;
    const core = exercises.filter(e => e.pattern.startsWith('core')).length;
    return { push, pull, quad, post, core };
  },

  // For protocol display: return the reason an exercise was selected
  getSelectionReason(ex, objetivo, nivel) {
    const reasons = [];
    if (ex.compound && (objetivo === 'fuerza' || objetivo === 'rendimiento')) reasons.push('ejercicio compuesto clave');
    if (ex.level === nivel) reasons.push(`nivel ${nivel}`);
    if (ex.fatigueLoad >= 4) reasons.push('alto estímulo mecánico');
    if (ex.fatigueLoad <= 2) reasons.push('bajo costo de fatiga');
    if (ex.tags.includes('clásico')) reasons.push('evidencia sólida');
    return reasons.slice(0, 2).join(' · ') || 'seleccionado para este contexto';
  },

  META: { PATTERN_META, EQUIPMENT_META, OBJECTIVE_WEIGHTS },
};

Object.assign(window, { ExerciseService });
