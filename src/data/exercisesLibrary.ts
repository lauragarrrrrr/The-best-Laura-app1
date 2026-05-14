export type ExerciseCategory = 'pull' | 'push' | 'legs' | 'core';
export type MuscleFilter = 'Espalda' | 'Pecho' | 'Hombro' | 'Bíceps' | 'Tríceps' | 'Cuádriceps' | 'Isquios' | 'Glúteo' | 'Core' | 'Antebrazo' | 'Gemelo';

export type ExerciseGuide = { 
  indications: string[]; 
  category: ExerciseCategory; 
  muscle: MuscleFilter;
  ytId: string;
};

// Generic GYM Youtube IDs mapping for high-quality thumbnail placeholders
const YT_PECHO = 'rT7DgCr-3pg';
const YT_ESPALDA = 'CAwf7n6Luuc';
const YT_QUAD = 'MawLFhNeBqE';
const YT_GLUTE = 'mX1Iqemnt5Y';
const YT_ISQUIO = 'F488k67BTNo';
const YT_BICEP = 'yTwo20kHw_o';
const YT_TRICEP = 'd_KZxkY_0cM';
const YT_SHOULDER = '3MqZA7f917Y';
const YT_CORE = 'vxPee4UEM_E';

export const GLOBAL_LIBRARY: Record<string, ExerciseGuide> = {
  // --- PECHO (1-10) ---
  'Press de Banca (Barra)': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Túmbate en el banco y clava los pies en el suelo.', 'Saca pecho y retrae las escápulas.', 'Agarra la barra un poco más ancho que tus hombros.', 'Baja la barra a la parte baja del pecho controlando la bajada.', 'Empuja fuerte hacia arriba soltando el aire.'] },
  'Press Inclinado Mancuerna': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Ajusta el banco inclinado a unos 30 o 45 grados.', 'Apoya fuerte la espalda y saca pecho.', 'Empuja las mancuernas hacia arriba hasta acercarlas.', 'Bájalas abriendo un poco los codos (forma de flecha).', 'Sube fuerte exhalando.'] },
  'Aperturas con Mancuernas': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Túmbate con mancuernas rectas sobre ti.', 'Mantén una mínima flexión en codos.', 'Abre los brazos en forma de cruz sintiendo el estiramiento.', 'Sube abrazando el aire como abrazando un árbol.'] },
  'Cruce de Poleas Alto': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Poleas arriba del todo.', 'Da un paso al frente quedando en el centro.', 'Tira de las poleas hacia abajo cruzando las manos frente a tu cadera.', 'Saca pecho apretándolo a tope abajo.'] },
  'Cruce de Poleas Bajo': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Poleas al nivel del suelo.', 'Levanta las manos hacia arriba y adentro (dirección a tu barbilla).', 'Aprieta el pecho alto superior.', 'Baja despacio.'] },
  'Fondos de Pecho (Dips)': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Inclina el torso hacia adelante para enfocar el pecho.', 'Baja flexionando el codo hasta los 90 grados.', 'Empuja explosivamente hacia arriba.'] },
  'Pec Deck / Contractor': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Ajusta el asiento para que las manos queden a la altura del pecho.', 'Cierra los brazos sintiendo la contracción en el centro.', 'Abre controladamente.'] },
  'Flexiones (Push-ups)': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Manos bajo los hombros, cuerpo recto.', 'Baja el pecho casi a rozar el suelo.', 'Sube manteniendo el core firme.'] },
  'Press de Banca con Mancuernas': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Mayor rango de movimiento que con barra.', 'Baja las mancuernas hasta los laterales del pecho.', 'Empuja hacia el centro arriba.'] },
  'Press de Pecho en Máquina': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['Ideal para aislar sin preocuparse por la estabilidad.', 'Empuja las asas hacia adelante.', 'Mantén los hombros pegados al respaldo.'] },

  // --- ESPALDA (11-20) ---
  'Dominadas (Pull-ups)': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Agarre ancho, palmas hacia afuera.', 'Tira de tu cuerpo hacia arriba llevando el pecho a la barra.', 'Baja controladamente hasta estirar dorsales.'] },
  'Jalón al Pecho': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Piernas bloqueadas bajo el rodillo.', 'Tira de la barra hacia la parte alta del pecho.', 'No te balancees excesivamente hacia atrás.'] },
  'Remo con Barra': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Torso inclinado a 45 grados, espalda recta.', 'Tira de la barra hacia el ombligo.', 'Aprieta las escápulas al final del movimiento.'] },
  'Remo en Polea Baja': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Pies apoyados, rodillas ligeramente flexionadas.', 'Tira del agarre hacia el abdomen.', 'Mantén la espalda erguida durante todo el recorrido.'] },
  'Remo con Mancuerna a una mano': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Un brazo y rodilla apoyados en el banco.', 'Tira de la mancuerna hacia la cadera.', 'Siente el estiramiento en la bajada.'] },
  'Pull-over con Polea Alta (Brazos Rectos)': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['De pie frente a la polea.', 'Brazos casi rectos, tira de la barra hacia tus muslos.', 'Enfoca el esfuerzo en el dorsal ancho.'] },
  'Peso Muerto Convencional': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Pies ancho de caderas.', 'Espalda neutra, tira de la barra pegada a tus piernas.', 'Bloquea arriba apretando glúteos.'] },
  'Remo en Máquina T-Bar': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Pecho apoyado en la almohadilla.', 'Tira de las asas hacia ti.', 'Controla la bajada para un máximo estiramiento.'] },
  'Chin-ups (Dominadas Supinas)': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Palmas mirando hacia ti.', 'Enfoca el esfuerzo en bíceps y espalda media.', 'Lleva la barbilla sobre la barra.'] },
  'Hiperextensiones Lumbar': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['Ajusta la máquina a la altura de tu cadera.', 'Baja el torso controladamente.', 'Sube hasta quedar en línea recta con las piernas.'] },

  // --- PIERNA (21-30) ---
  'Sentadilla Libre (Barra)': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['Barra sobre trapecios.', 'Baja la cadera rompiendo el paralelo.', 'Mantén los talones clavados al suelo.'] },
  'Prensa de Piernas': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['Espalda totalmente apoyada.', 'No bloquees las rodillas al final de la subida.', 'Baja la plataforma hasta que tus piernas formen 90 grados.'] },
  'Extensiones de Cuádriceps': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['Siéntate y ajusta el rodillo a tus tobillos.', 'Extiende las piernas completamente.', 'Aprieta 1 segundo arriba.'] },
  'Curl Femoral Tumbado': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['Túmbate boca abajo.', 'Lleva el rodillo hacia tus glúteos.', 'Controla la bajada lenta.'] },
  'Peso Muerto Rumano': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['Rodillas muy poco flexionadas.', 'Baja la barra pegada a las piernas sintiendo el estirón atrás.', 'Sube usando isquios y glúteos.'] },
  'Zancadas (Lunges)': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['Da un paso largo hacia adelante.', 'Baja hasta que la rodilla trasera casi toque el suelo.', 'Mantén el torso erguido.'] },
  'Hip Thrust (Empuje de Cadera)': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['Espalda apoyada en el banco.', 'Empuja la cadera hacia el techo apretando glúteos.', 'Mentón pegado al pecho.'] },
  'Prensa de Gemelos': { category: 'legs', muscle: 'Gemelo', ytId: YT_QUAD, indications: ['Usa la prensa para empujar solo con las puntas de los pies.', 'Siente el estiramiento máximo abajo.', 'Sube explosivo.'] },
  'Abducción de Cadera (Máquina)': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['Abre las piernas contra la resistencia.', 'Enfoca el esfuerzo en el glúteo medio.', 'Mantén la espalda erguida.'] },
  'Sentadilla Búlgara': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['Un pie apoyado en banco tras de ti.', 'Baja con la pierna delantera.', 'Mantén el equilibrio y el torso recto.'] },

  // --- HOMBRO (31-38) ---
  'Press Militar con Barra': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['De pie o sentado erguido.', 'Empuja la barra sobre tu cabeza.', 'No arquees la espalda baja.'] },
  'Elevaciones Laterales': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['Brazos ligeramente flexionados.', 'Sube las mancuernas hasta la altura de los hombros.', 'Baja despacio.'] },
  'Press Arnold': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['Empieza con palmas hacia ti.', 'Rota las manos mientras empujas hacia arriba.', 'Termina con palmas hacia adelante.'] },
  'Face Pull': { category: 'pull', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['Usa la cuerda en polea alta.', 'Tira de la cuerda hacia tu frente abriendo los codos.', 'Enfoca el deltoides posterior.'] },
  'Elevaciones Frontales': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['Sube la mancuerna frente a ti hasta altura de ojos.', 'Controla el descenso.', 'No uses balanceo.'] },
  'Pájaros (Vuelos Posteriores)': { category: 'pull', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['Torso inclinado o apoyado en banco.', 'Sube las mancuernas hacia los lados.', 'Enfoca la parte trasera del hombro.'] },
  'Encogimientos de Hombros (Trapecio)': { category: 'pull', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['Mancuernas a los lados.', 'Eleva los hombros hacia las orejas.', 'Aprieta 1 segundo arriba.'] },
  'Press de Hombros con Mancuernas': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['Siéntate en banco con respaldo.', 'Empuja las mancuernas desde los hombros hacia arriba.', 'No choques las pesas arriba.'] },

  // --- BRAZOS (39-46) ---
  'Curl de Bíceps con Barra Z': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['Agarre en las curvas de la barra.', 'Sube flexionando codos sin mover hombros.', 'Baja estirando el bíceps.'] },
  'Curl Martillo': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['Palmas enfrentadas (agarre neutro).', 'Ideal para el braquial y antebrazo.', 'Mantén los codos pegados al cuerpo.'] },
  'Curl con Cable en Polea Baja': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['Tensión constante durante todo el rango.', 'Controla el descenso.', 'No te inclines hacia atrás.'] },
  'Press Francés (Skull Crushers)': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['Tumbado, baja la barra hacia tu frente.', 'Extiende los brazos usando el tríceps.', 'Mantén los codos cerrados.'] },
  'Extensión de Tríceps en Polea Alta': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['Usa barra o cuerda.', 'Empuja hacia abajo extendiendo codos.', 'Mantén el torso fijo.'] },
  'Fondos entre Bancos': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['Pies apoyados adelante, manos en banco tras de ti.', 'Baja el cuerpo flexionando codos.', 'Empuja arriba.'] },
  'Curl Concentrado': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['Sentado, codo apoyado en muslo interno.', 'Flexiona concentrando el esfuerzo en el pico del bíceps.', 'Extiende completo.'] },
  'Copa de Tríceps (Mancuerna tras nuca)': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['Mancuerna sujeta con ambas manos sobre la cabeza.', 'Baja por detrás de la nuca.', 'Sube estirando tríceps.'] },

  // --- CORE (47-50) ---
  'Plancha Abdominal': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ['Apóyate en antebrazos y puntas de pies.', 'Cuerpo recto como una tabla.', 'Aprieta abdomen y glúteos.'] },
  'Crunch Abdominal': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ['Tumbado, rodillas flexionadas.', 'Eleva solo los hombros del suelo.', 'Aprieta el abdomen al subir.'] },
  'Elevación de Piernas Colgado': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ['Cuélgate de una barra.', 'Sube las piernas (estiradas o rodillas al pecho).', 'No uses balanceo.'] },
  'Rueda Abdominal': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ['De rodillas, rueda hacia adelante controlando con el core.', 'Vuelve a la posición inicial sin arquear espalda.', 'Máxima tensión abdominal.'] }
};
