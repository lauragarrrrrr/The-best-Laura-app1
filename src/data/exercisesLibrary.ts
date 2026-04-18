export type ExerciseCategory = 'pull' | 'push' | 'legs' | 'core';
export type MuscleFilter = 'Espalda' | 'Pecho' | 'Hombro' | 'Bíceps' | 'Tríceps' | 'Cuádriceps' | 'Isquios' | 'Glúteo' | 'Core';

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
  // --- PECHO ---
  'Press de Banca (Barra)': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Túmbate en el banco y clava los pies en el suelo.', '2. Saca pecho y retrae las escápulas.', '3. Agarra la barra un poco más ancho que tus hombros.', '4. Baja la barra a la parte baja del pecho controlando la bajada.', '5. Empuja fuerte hacia arriba soltando el aire.'] },
  'Press Inclinado Mancuerna': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Ajusta el banco inclinado a unos 30 o 45 grados.', '2. Apoya fuerte la espalda y saca pecho.', '3. Empuja las mancuernas hacia arriba hasta acercarlas.', '4. Bájalas abriendo un poco los codos (forma de flecha).', '5. Sube fuerte exhalando.'] },
  'Press Declinado (Máquina)': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Ajusta el asiento alto para empujar hacia abajo.', '2. Mantén la espalda totalmente pegada.', '3. Empuja hacia abajo y al frente.', '4. Controla la excéntrica (bajada) al máximo.'] },
  'Aperturas con Mancuernas': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Túmbate con mancuernas rectas sobre ti.', '2. Mantén una mínima flexión en codos.', '3. Abre los brazos en forma de cruz sintiendo el estiramiento.', '4. Sube abrazando el aire como abrazando un árbol.'] },
  'Cruce de Poleas Alto': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Poleas arriba del todo.', '2. Da un paso al frente quedando en el centro.', '3. Tira de las poleas hacia abajo cruzando las manos frente a tu cadera.', '4. Saca pecho apretándolo a tope abajo.'] },
  'Cruce de Poleas Bajo': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Poleas al nivel del suelo.', '2. Levanta las manos hacia arriba y adentro (dirección a tu barbilla).', '3. Aprieta el pecho alto superior.', '4. Baja despacio.'] },
  'Fondos Asistidos': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Pon peso en la máquina y sube la rodilla a la placa.', '2. Inclina el torso hacia adelante para el pecho.', '3. Baja flexionando el codo a 90 grados.', '4. Empuja el cuerpo arriba firme.'] },
  'Mariposa / Pec Deck': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Asiento a nivel (manos al pecho).', '2. Agarra los mangos, mantén postura firme.', '3. Cierra como si fueses a abrazar a alguien fuerte.', '4. Abre despacio y sintiendo el estirón.'] },
  'Press Inclinado Multipower': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Banco inclinado bajo la guía.', '2. Desciende lento a la parte alta del pecho clavicular.', '3. Explota concéntricamente empujando.'] },
  'Flexiones / Push-Up': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Manos bajo los hombros, cuerpo recto.', '2. Baja el pecho casi a rozar suelo.', '3. Sube con los codos un poco cerrados.'] },
  'Svend Press': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Toma dos discos pequeños apretándolos frente a tu pecho.', '2. Empuja hacia afuera rectas.', '3. Siente el bombeo interno pectoral.'] },
  'Pullover Mancuerna': { category: 'push', muscle: 'Pecho', ytId: YT_PECHO, indications: ['1. Tumbado transversalmente (cabeza y hombros en banco).', '2. Sujeta mancuerna arriba.', '3. Déjala caer lentamente sobre tu cabeza extendiendo brazos.', '4. Regresa exhalando enfocado al pecho.'] },

  // --- ESPALDA ---
  'Dominadas (Asistidas)': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Pon peso asistencia para contra-restar.', '2. Agarre más ancho que hombros.', '3. Saca pecho y tira clavando codos hacia abajo.', '4. Baja completo y repite.'] },
  'Dominadas Supinas': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Agarrate con palmas mirando a ti.', '2. Fuerte tracción hacia el mentón.', '3. Ideal para incluir bíceps intensamente.'] },
  'Jalón al Pecho': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Piernas bloqueadas. Seleccionas peso pesado.', '2. Tira hacia clavícula, echando hombros atrás.', '3. Regresa controlando la elongación.'] },
  'Jalón Tras Nuca': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Asegura súper control escapular.', '2. Baja la barra directo hacia nuca sin mover la barbilla adelante abrupto.', '3. Baja reteniendo peso.'] },
  'Remo en Punta (T-Bar)': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Postura de bisagra de cadera firme a 45 grados.', '2. Agarre V.', '3. Tira el peso al ombligo reventando el dorsal.', '4. Desciende firme.'] },
  'Remo con Barra Péndlay': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Barra parte en el piso en cada rep.', '2. Endereza la espalda a tope.', '3. Tiro explosivo hacia abdomen.', '4. Devolver rápido al suelo sin rebotes.'] },
  'Remo Mancuerna a 1 Brazo': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Apóyate en banco. Espalda como mesa.', '2. Tira de la mancuerna al bolsillo del pantalón.', '3. Siente cómo contraes la espalda superior.'] },
  'Remo Máquina Sentada': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Apoyo pecho fuerte.', '2. Tira hacia ti retrayendo todo el hombro.', '3. No te eches para atrás.'] },
  'Remo Gironda': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. Siéntate, pies en apoyos. No encorves.', '2. Usa triángulo o barra recta.', '3. Lleva al núcleo ombligal apretando espaldas media.'] },
  'Dorsal con brazos rectos': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. De pie en polea alta.', '2. Brazos rectos en ligero arco.', '3. Empujas peso abajo usando las dorsales.'] },
  'Jalón Remo 1 Brazo (Cable)': { category: 'pull', muscle: 'Espalda', ytId: YT_ESPALDA, indications: ['1. De rodillas enfrente de la polea alta.', '2. Toma agarre simple y estíralo completamente.', '3. Regresa jalón sintiendo hasta la cadera baja.'] },

  // --- CUÁDRICEPS ---
  'Sentadilla Libre (Barra)': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Carga barra sobre trapecios y recula del rack.', '2. Abre pies ancho hombros.', '3. Baja cadera agazapado abriendo rodillas afuera.', '4. Empuja el piso fuertemente arriba asfíctico.'] },
  'Sentadilla Péndulo': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Espalda CIENTÍFICAMENTE apoyada en el respaldo curvo.', '2. Descender rompiendo paralelo siguiendo la estricta TRAYECTORIA DE ARCO que dicta la máquina.', '3. Cero estrés axial: el péndulo direcciona el estímulo 100% al Cuádriceps.', '4. Ascenso controlado rompiendo la inercia del péndulo inferior.'] },
  'Sentadilla con Cinturón (Belt Squat)': { category: 'legs', muscle: 'Cuádriceps', ytId: 'Q-iUoOQ5D2c', indications: ['1. Ponte el cinturón lastrado encajado en tu zona pélvica.', '2. A diferencia del péndulo o barra, el peso CUELGA LIBRE debajo de tu centro de gravedad.', '3. Tu columna vertebral está ABSOLUTAMENTE LIBRE y descomprimida.', '4. Sentadilla profunda pura sentándote verticalmente hacia abajo.', '5. Empuje recto concéntrico a tope impulsando el suelo.'] },
  'Sentadilla Búlgara': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Apoyo pierna postiza en tapiz trasero.', '2. Zancada firme sobre frente frontal.', '3. Baja perpendicular al suelo sintiendo quemón de cuadro.', '4. Vuelve hacia arriba.'] },
  'Prensa de Piernas': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Coxis clavado abajo del todo.', '2. Si separas leve los pies activas lágrima vasto externo.', '3. Desciende bajando plataforma sin girar pélvis.', '4. Sube seguro.'] },
  'Prensa Hacksquat': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Apoya perfecta la espalda entera.', '2. Desciende profundísimo de cuad.', '3. Destroza el muslo en subida fluida.'] },
  'Extensiones de Cuádriceps': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Sentada e inmoviliza con los asideros laterales.', '2. Golpea hacia arriba pateando.', '3. Congela la pata estirada 1 segundo entero.'] },
  'Zancadas estáticas': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Abre buena zancada.', '2. Sube y baja como un ascensor repetidamente sin desplazamiento.'] },
  'Sissy Squat': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Encaja los gemelos en la base de retención.', '2. Echate atras puro bloque, abriendo rodilla.', '3. Subida con tracción de muslos.'] },
  'Sentadilla Frontal': { category: 'legs', muscle: 'Cuádriceps', ytId: YT_QUAD, indications: ['1. Descansa en deltoides frontal.', '2. Flexión muy vertical para super core/quad.'] },

  // --- ISQUIOS ---
  'Peso Muerto Rumano (Barra)': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Piernas cuasi rectificadas pero semi tensas.', '2. Cadera disparada super atrasado.', '3. Tirón infernal en tendón trasero y subir de culo.'] },
  'Peso Muerto Rumano (Mancuerna)': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Mismo concepto, pesas te permiten rosar muslos y lateralizar mejor el agarre.'] },
  'Curl Pierna Sentado': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Engancha el muslo alto fuertísimo.', '2. Dobla detrás de las pantorrillas hasta el tope interior.', '3. Cede y estira gradual.'] },
  'Curl Pierna Acostado': { category: 'legs', muscle: 'Core', ytId: YT_ISQUIO, indications: ['1. Tumbada recta y pelvis apretando forro de cuero.', '2. Sube hacia trasero.', '3. Resiste excéntrica super duro y largo tiempo.'] },
  'Curl Pierna Unilateral (Pie)': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Encaja el apoyo en gemelo individual de pie.', '2. Tira hacia nalgas concéntrica estricta.'] },
  'Buenos Días (Barra)': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Barra en espalda nuca.', '2. Reverencia de salón empujando cadera traseras.', '3. Sube por palanca de erector y glúteos.'] },
  'Nordic Curl': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Retención corporal pura en banco de tobillos.', '2. Caída frenando peso corporal.', '3. Avanzado excéntrico isquio bestial.'] },
  'Peso Muerto Piernas Rígidas': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Como rumano pero con piernas literal hiper-rígidas rectificadas completas (Riesgo).'] },
  'Glute Ham Raise (GHR)': { category: 'legs', muscle: 'Isquios', ytId: YT_ISQUIO, indications: ['1. Aparato especializado. Curvas arriba y abajo entero usando femoral en la cama cóncava.'] },

  // --- GLÚTEO ---
  'Hip Thrust Smith': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Carga barra sobre bisagra pélvica.', '2. Tracción vertical máxima apuntando rodillas un poco exterior.', '3. Apretar brutal arriba nabo al cielo.'] },
  'Hip Thrust Barra Libre': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Más inestable, demanda control de estabilizadores extra bajos al empujar.'] },
  'Puente de Glúteo Suelo': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. En el suelo de espaldas.', '2. Simplemente levantando pelvis hasta línea recta rodilla/hombro.'] },
  'Patada Glúteo Cable': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Atado a tobillo polo bajo.', '2. Golpea raso atras al cielo diagonal.', '3. Sostén y frena retorno.'] },
  'Patada Glúteo Máquina': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Empujar el pad rotativo atrás directo contra la nalgada dura y contundente.'] },
  'Hiperextensión con peso': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Flexiona desde cadera (cojín bajo inglés).', '2. Relaja isquíos y saca tiro directo estrujando posaderas al topar plano horizontal.'] },
  'Abducción Sentada (Máquina)': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Máquina separadora que bombardea glúteo medio purísimo a repes altísimas.'] },
  'Paso arriba (Step Up)': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Cajón 50cm.', '2. Propulsión unilateral, gran activación glútea profunda compensatoria.'] },
  'Sentadilla Sumo': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Apertura ancha, pies muy a los costados.', '2. Sentadilla reclinando pecho menos y hundiendo isquión.'] },
  'Frog Pumps': { category: 'legs', muscle: 'Glúteo', ytId: YT_GLUTE, indications: ['1. Plantas de pies cruzadas como sapo boca-atrás del suelo, eleva cadera muy intenso.'] },

  // --- HOMBRO ---
  'Press Hombro Máquina': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Siéntate en máquina push.', '2. Empujes hacia el techo y resistes bajo.'] },
  'Press Militar Manco / Barra': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Baza frontal fuerte, sin arquear la lumbar exageradamente.'] },
  'Arnold Press': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Rotación del mancuernal de mentón a frente plano arriba, quema deltoides intermedio intenso y anterior.'] },
  'Elevación Lateral Cable': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Tirón constante del cable con brazo un pelo rotado interno lateralmente.'] },
  'Elevaciones Laterales Mancuernas': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Codos semiflex, subida pajaros rápida hasta línea clavicular.', '2. Regreso alante fémur.'] },
  'Pájaros (Deck Inverso)': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Maquina mariposa Inversa, repta deltoides posterior trapecio bajo intensísimo.'] },
  'Face Pull (Polea)': { category: 'pull', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Cuerda doble polea frente a cara, se abren manos altura ojos exhalando tracción dorsal hombro final.'] },
  'Encogimiento Trapecios': { category: 'pull', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Peso libre a morir y solo elevación hombrera cual encogerse "no sé" repetidas.'] },
  'Elevación Frontal Disco': { category: 'push', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Sostiene lateral volante un disco mediano.', '2. Elevar hasta altura ocular.'] },
  'Remo al Mentón (Upright)': { category: 'pull', muscle: 'Hombro', ytId: YT_SHOULDER, indications: ['1. Agarre medio.', '2. Codos altos tirando a barbilla (cuidado pinzamiento si mala movil).'] },

  // --- BÍCEPS ---
  'Curl con Barra Z': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Agarre semi-supinado confortable.', '2. Bombea y retén.', '3. Nada de impulsarlo de caderas flojas.'] },
  'Curl Alterno Mancuernas': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Turno de mazo y supina, machacando pico individual.'] },
  'Curl Martillo': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Suprimen giro, agarre jarra cervecero.', '2. Reclutamiento Braquial extremo masivo.'] },
  'Curl Bayersian Cable': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Cable cruzado espaldas frente.', '2. Tiras y la contínua tensión excéntrica elonga la peli muscular con rabia controlada.'] },
  'Curl predicador (máquina)': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Ajusta el asiento para que tus axilas apoyen arriba.', '2. Agarra la barra con palmas hacia arriba.', '3. Sube apretando y baja despacio.'] },
  'Curl Araña': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Pecho plano boca-abajo banco.', '2. Abrazas vacio y halas sin impulso dorsal.'] },
  'Curl Concentrado': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Codo pegadísimo muslo interno en silla.', '2. Tira purificado solo con ese lado islado.'] },
  'Dominada Bíceps Cerrada': { category: 'pull', muscle: 'Bíceps', ytId: YT_BICEP, indications: ['1. Subida cerrada supina pura, tira de brazo fuerte si aguanta todo ese lastre humano.'] },

  // --- TRÍCEPS ---
  'Extensión Tríceps Polea / Cuerda': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['1. Codos engrapados tórax inferior.', '2. Empujes hacia zócalo de piso fracturando terminación.'] },
  'Press Francés (Skullcrusher)': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['1. EZ Barra tumba.', '2. Flexion a corona perimetral exhalante con triceps blindados propulsión al cielo.'] },
  'Extensión sobre Cabeza Mancuerna': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['1. Bi-manual tras nucas caida pesada codos.', '2. Propulsión recto al zenith techo.'] },
  'Fondos Paralelas / Tarima': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['1. Codos cerraditos a costillas.', '2. Bajar vertical neutro sin pecho inclín... puro trícep puro empuje rudo.'] },
  'JM Press': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['1. Mezcla de french curvo y banca cerrado. Técnica pro avanzada destructora de codos flojos/fortalecedora masa magra extensa trícep.'] },
  'Patada Tríceps Mancuerna': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['1. Plana base codos altos e inmóviles.', '2. Patadas cortantes finales apretón.'] },
  'Press Cerrado Banca': { category: 'push', muscle: 'Tríceps', ytId: YT_TRICEP, indications: ['1. Banca pecho pero agarre corto de índice cerrado trícepes propulsivos primarios absolutos bloqueadores superiores exatos.'] },

  // --- CORE ---
  'Crunch Lateral': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Acuéstate de lado, apoyándote.", "2. Coloca mano tras cabeza para soporte.", "3. Intenta juntar costillas y cadera contrarrestando el piso.", "4. Exhala fuertemente."] },
  'Single Dead Bug': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Posición bocarriba. Imprime (pega y aplasta) tu cintura en el mat.", "2. Elevas piernas a 90 (mesita).", "3. Toca el piso leve con el pie rotando extension y luego torna el pie arriba.", "4. La cadera y espalda nunca despegan."] },
  'Plancha': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Apoya antebrazos paralelos con hombros por encima.", "2. Pies estirados. Espalda neutra como una tabla de planchar rígida.", "3. Ajusta pelvis sin estar caída ni arriba, totalmente en bloque rectilíneo.", "4. Continúa tu respiración torácica y aguanta."] },
  'Escalador (Mountain)': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Posición de máxima flexión estática, palmas abajo brazos fijos.", "2. Empieza la rodilla hacia la mandíbula sin saltar excesivamente con glúteos arriba.", "3. Corre en formato horizontal marcando una rodilla o con explosividad."] },
  'Russian Twist': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Inclina el torso hacia atrás 45 grados sentado.", "2. Eleva y cruza las piernas en el aire si puedes.", "3. Gira el torso entero de lado a lado portando el peso."] },
  'Rueda Abdominal (Ab Wheel)': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Rodillas acolchadas.", "2. Estira rodando lejos sin perder comba pelvínica (sin partir riñón y columna lumbar arquerías).", "3. Regreso core concentrado jalón transverso."] },
  'Elevación Piernas Colgado': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Cuélgate fijo.", "2. Cierra transverso y lanza pies/rodillas sobre obligo/pectoral.", "3. No balancees kipping pendular como columpio falso core inútil."] },
  'Crunch Máquina Inclinado': { category: 'core', muscle: 'Core', ytId: YT_CORE, indications: ["1. Cargado fuerte crunch rodando tu caja pectoral empujando placa contra muslo duro.", "2. Resistir bajada estricto."] }
};
