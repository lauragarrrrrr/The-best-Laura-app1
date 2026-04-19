export interface Recipe {
  id: string;
  name: string;
  category: 'Desayuno' | 'Almuerzo' | 'Comida' | 'Merienda' | 'Cena';
  ingredients: { item: string; amount: string; category: 'Protein' | 'Veggie' | 'Carb' | 'Other'; price: number }[];
  time: string;
  instructions: string[];
  tags: string[];
  chefTip: string;
}

export const LIDL_PRICES = {
  pollo: 7.50, // per kg
  huevos: 2.45, // per 12 units
  pavo: 2.20, // per pack
  ternera: 4.50, // per pack
  tofu: 2.00, // per pack
  avena: 0.95, // per 500g
  queso_cottage: 1.50, // per unit
  yogur_griego: 1.75, // per pack (4)
  arroz_micro: 1.10, // per 2 units
  pasta: 1.20, // per 500g
  aguacate: 2.50, // per bag
  verduras_wok: 1.80, // per bag
  frutos_secos: 2.50, // per bag
  leche_almendras: 1.30, // per liter
  pan_integral: 1.50, // per loaf
  salmon: 5.50, // per pack
  quinoa: 1.80, // per pack
  limon: 0.20, // per unit
};

export const RECIPES: Recipe[] = [
  // --- DESAYUNOS (PLÁTANO Y AVENA VARIATIONS) ---
  {
    id: 'd1',
    name: 'Gachas de Avena Proteicas (Oats & Protein)',
    category: 'Desayuno',
    time: '7 min',
    tags: ['proteica', 'saciante', 'desayuno fit', 'avena'],
    ingredients: [
      { item: 'Avena Milbona', amount: '50g', category: 'Carb', price: 0.10 },
      { item: 'Leche de Almendras', amount: '250ml', category: 'Other', price: 0.32 },
      { item: 'Proteína en polvo (Vainilla)', amount: '30g', category: 'Protein', price: 0.85 },
      { item: 'Plátano maduro', amount: '1/2 unidad', category: 'Other', price: 0.15 },
    ],
    instructions: [
      'Vierte 250ml de leche de almendras y 50g de avena en un cazo pequeño.',
      'Calienta a fuego medio durante 5-6 minutos, removiendo constantemente con una cuchara de madera hasta que la mezcla espese y la avena esté tierna.',
      'Retira del fuego e incorpora inmediatamente los 30g de proteína en polvo, mezclando enérgicamente para evitar grumos.',
      'Sirve en un bol y decora con rodajas de medio plátano y una pizca de canela.'
    ],
    chefTip: 'Si quieres una textura ultra cremosa, añade un chorrito extra de leche fría justo antes de servir.'
  },
  {
    id: 'd2',
    name: 'Tortitas de Plátano y Claras (BCAA Boost)',
    category: 'Desayuno',
    time: '12 min',
    tags: ['proteica', 'sin azúcar', 'plátano'],
    ingredients: [
      { item: 'Claras de Huevo Lidl', amount: '150ml', category: 'Protein', price: 0.65 },
      { item: 'Plátano muy maduro', amount: '1 unidad', category: 'Other', price: 0.25 },
      { item: 'Harina de Avena', amount: '40g', category: 'Carb', price: 0.08 },
    ],
    instructions: [
      'En un recipiente alto, tritura el plátano completo con los 150ml de claras y los 40g de harina de avena hasta obtener una masa homogénea y sin grumos.',
      'Pincela una sartén antiadherente con una gota de aceite y calienta a fuego medio-alto.',
      'Vierte pequeñas porciones de masa para formar tortitas de unos 8-10cm de diámetro.',
      'Cocina durante 2 min por cada lado o hasta que aparezcan burbujas en la superficie antes de darles la vuelta.'
    ],
    chefTip: 'No aplastes las tortitas con la espátula mientras se cocinan o perderán su esponjosidad.'
  },
  {
    id: 'd3',
    name: 'Baked Oats de Manzana y Canela',
    category: 'Desayuno',
    time: '25 min',
    tags: ['avena', 'horno', 'fibra'],
    ingredients: [
      { item: 'Avena Milbona', amount: '60g', category: 'Carb', price: 0.12 },
      { item: 'Manzana roja', amount: '1 unidad', category: 'Veggie', price: 0.40 },
      { item: 'Yogur Griego ligero', amount: '100g', category: 'Protein', price: 0.45 },
    ],
    instructions: [
      'Precalienta el horno a 180°C.',
      'Tritura la avena (60g) con el yogur (100g) y media manzana pelada.',
      'Vierte en un molde para horno pequeño y coloca la otra media manzana laminada encima.',
      'Hornea durante 15-20 minutos hasta que la superficie esté dorada y firme al tacto.'
    ],
    chefTip: 'Añade esencia de vainilla a la masa para potenciar el sabor de la manzana.'
  },
  {
    id: 'd4',
    name: 'Overnight Oats de Chia y Plátano',
    category: 'Desayuno',
    time: '5 min (+reposo)',
    tags: ['avena', 'plátano', 'sin cocina', 'omega 3'],
    ingredients: [
      { item: 'Copos de Avena', amount: '40g', category: 'Carb', price: 0.08 },
      { item: 'Semillas de Chía', amount: '10g', category: 'Other', price: 0.15 },
      { item: 'Leche de Almendras', amount: '150ml', category: 'Other', price: 0.20 },
      { item: 'Plátano', amount: '1/2 unidad', category: 'Other', price: 0.15 },
    ],
    instructions: [
      'En un tarro de cristal, mezcla la avena (40g) con las semillas de chía (10g) y la leche (150ml).',
      'Agita bien o remueve con una cuchara para que las semillas se distribuyan.',
      'Cierra el tarro y deja reposar en la nevera un mínimo de 4 horas (idealmente toda la noche).',
      'Al momento de comer, añade el medio plátano troceado por encima.'
    ],
    chefTip: 'La chía absorberá el líquido creando una textura tipo pudding deliciosa.'
  },
  {
    id: 'd5',
    name: 'Omelette de Espinacas y Queso Cottage',
    category: 'Desayuno',
    time: '10 min',
    tags: ['huevos', 'proteica', 'keto'],
    ingredients: [
      { item: 'Huevos L Lidl', amount: '2 unidades', category: 'Protein', price: 0.40 },
      { item: 'Espinacas frescas', amount: '50g', category: 'Veggie', price: 0.30 },
      { item: 'Queso Cottage', amount: '50g', category: 'Protein', price: 0.40 },
    ],
    instructions: [
      'Bate los 2 huevos en un bol con una pizca de sal.',
      'En una sartén con media cucharadita de aceite, saltea las espinacas (50g) durante 2 minutos hasta que reduzcan su tamaño.',
      'Vierte los huevos batidos sobre las espinacas y cocina a fuego bajo.',
      'Cuando el huevo esté casi cuajado, coloca el queso cottage en el centro y dobla la tortilla.'
    ],
    chefTip: 'Cocina a fuego muy lento para que el huevo quede jugoso y no se queme la base.'
  },
  {
    id: 'd6',
    name: 'Avena Salada con Huevo Poché',
    category: 'Desayuno',
    time: '15 min',
    tags: ['avena', 'huevos', 'original'],
    ingredients: [
      { item: 'Copos de Avena', amount: '50g', category: 'Carb', price: 0.10 },
      { item: 'Caldo de verduras', amount: '200ml', category: 'Other', price: 0.20 },
      { item: 'Huevo fresco', amount: '1 unidad', category: 'Protein', price: 0.20 },
    ],
    instructions: [
      'Cocina los 50g de avena en el caldo de verduras caliente durante 8 minutos hasta que espese.',
      'Mientras tanto, hierve agua con un chorrito de vinagre en un cazo.',
      'Crea un remolino en el agua y echa el huevo con cuidado; cocina 3-4 minutos para obtener un poché perfecto.',
      'Sirve el huevo sobre la avena salada y sazona con pimienta negra.'
    ],
    chefTip: 'Añade un poco de levadura nutricional a la avena para darle un toque "quesoso" sin calorías extra.'
  },
  {
    id: 'd7',
    name: 'Bizcocho de Plátano al Microondas (Mug Cake)',
    category: 'Desayuno',
    time: '4 min',
    tags: ['plátano', 'rápido', 'dulce fit'],
    ingredients: [
      { item: 'Plátano maduro', amount: '1 unidad', category: 'Other', price: 0.25 },
      { item: 'Huevo', amount: '1 unidad', category: 'Protein', price: 0.20 },
      { item: 'Harina de Avena', amount: '30g', category: 'Carb', price: 0.06 },
    ],
    instructions: [
      'En una taza grande, machaca bien el plátano con un tenedor hasta que sea puré.',
      'Añade el huevo y la harina de avena (30g), mezclando todo hasta que esté integrado.',
      'Lleva al microondas a máxima potencia durante 1:30 a 2:00 minutos.',
      'Deja templar 1 minuto antes de desmoldar o comer directamente de la taza.'
    ],
    chefTip: 'Pon una onza de chocolate negro 85% en el centro de la masa antes de hornear para un corazón fundido.'
  },
  {
    id: 'd8',
    name: 'Huevos Nube sobre Tostada Integral',
    category: 'Desayuno',
    time: '15 min',
    tags: ['huevos', 'premium', 'estética'],
    ingredients: [
      { item: 'Huevos L', amount: '2 unidades', category: 'Protein', price: 0.40 },
      { item: 'Pan Integral', amount: '1 rebanada', category: 'Carb', price: 0.15 },
    ],
    instructions: [
      'Separa las claras de las yemas (reserva las yemas intactas).',
      'Monta las claras a punto de nieve con una pizca de sal hasta que estén muy firmes.',
      'Forma dos "nubes" en una bandeja de horno y crea un hueco en el centro; hornea a 200°C por 3 minutos.',
      'Coloca las yemas en los huecos y hornea 2 minutos más; sirve sobre la tostada.'
    ],
    chefTip: 'Usa una pizca de cremor tártaro o limón al batir las claras para que no se bajen.'
  },
  {
    id: 'd9',
    name: 'Yogur de Avena y Frutos Rojos',
    category: 'Desayuno',
    time: '5 min',
    tags: ['avena', 'antioxidante', 'fresco'],
    ingredients: [
      { item: 'Copos de avena finos', amount: '30g', category: 'Carb', price: 0.06 },
      { item: 'Yogur Griego 0%', amount: '125g', category: 'Protein', price: 0.50 },
      { item: 'Arándanos y frambuesas', amount: '50g', category: 'Veggie', price: 0.80 },
    ],
    instructions: [
      'Mezcla los 30g de avena directamente con el yogur griego en un bol amplio.',
      'Deja que la avena se hidrate con el yogur durante unos 10 minutos (si tienes tiempo).',
      'Lava y añade los frutos rojos por encima.',
      'Finaliza con unas semillas de calabaza (opcional) para dar un toque crujiente.'
    ],
    chefTip: 'Si la mezcla queda muy espesa, añade una cucharada de kéfir o leche.'
  },
  {
    id: 'd10',
    name: 'Tortilla de Plátano y Avena (Sweet Omelette)',
    category: 'Desayuno',
    time: '8 min',
    tags: ['plátano', 'avena', 'huevos', 'post-workout'],
    ingredients: [
      { item: 'Huevos', amount: '2 unidades', category: 'Protein', price: 0.40 },
      { item: 'Plátano laminado', amount: '1 unidad', category: 'Other', price: 0.25 },
      { item: 'Canela Ceylán', amount: '1 pizca', category: 'Other', price: 0.05 },
    ],
    instructions: [
      'Bate los huevos con la canela en un plato hondo.',
      'Calienta una sartén antiadherente y vierte los huevos, cocinando la base como una tortilla normal.',
      'Antes de doblar, coloca las láminas de plátano en una mitad.',
      'Cierra la tortilla y deja cocinar 1 minuto más para que el plátano se caliente y suavice.'
    ],
    chefTip: 'Carameliza el plátano en la sartén 30 segundos antes de echar el huevo para un sabor BRUTAL.'
  },

  // --- COMIDAS (POLLO VARIATIONS) ---
  {
    id: 'c1',
    name: 'Pollo al Limón y Ajo (Oven Roasted)',
    category: 'Comida',
    time: '35 min',
    tags: ['pollo', 'premium', 'meal prep'],
    ingredients: [
      { item: 'Pechuga de Pollo Lidl', amount: '200g', category: 'Protein', price: 1.50 },
      { item: 'Limon Real', amount: '1 unidad', category: 'Veggie', price: 0.20 },
      { item: 'Patata pequeña', amount: '150g', category: 'Carb', price: 0.30 },
    ],
    instructions: [
      'Precalienta el horno a 200°C.',
      'Corta la patata en láminas finas y el pollo en dados gruesos.',
      'Coloca en una bandeja de horno, añade 3 dientes de ajo machacados, el zumo de medio limón y rodajas de la otra mitad.',
      'Hornea durante 25-30 minutos, removiendo a mitad del tiempo para que el pollo no se seque.'
    ],
    chefTip: 'Baña el pollo en sus propios jugos cada 10 minutos para mantener la jugosidad extrema.'
  },
  {
    id: 'c2',
    name: 'Fajitas de Pollo y Verduras Wok',
    category: 'Comida',
    time: '15 min',
    tags: ['pollo', 'rápido', 'volumen'],
    ingredients: [
      { item: 'Tiras de Pollo Lidl', amount: '150g', category: 'Protein', price: 1.10 },
      { item: 'Mix Verduras Wok Lidl', amount: '200g', category: 'Veggie', price: 1.80 },
      { item: 'Tortillas Integrales', amount: '2 unidades', category: 'Carb', price: 0.40 },
    ],
    instructions: [
      'Calienta un wok o sartén grande con fuego muy potente.',
      'Saltea el mix de verduras (200g) durante 5-7 minutos hasta que estén "al dente".',
      'Añade las tiras de pollo y cocina 4 minutos más hasta que estén doradas por fuera.',
      'Calienta las tortillas 30 segundos en el microondas y rellénalas con la mezcla caliente.'
    ],
    chefTip: 'Añade una gota de salsa de soja al final del salteado para un aroma profesional.'
  },
  {
    id: 'c3',
    name: 'Pollo Teriyaki con Brócoli y Arroz',
    category: 'Comida',
    time: '15 min',
    tags: ['pollo', 'asiática', 'alto rendimiento'],
    ingredients: [
      { item: 'Pechuga de Pollo', amount: '150g', category: 'Protein', price: 1.10 },
      { item: 'Brócoli fresco', amount: '200g', category: 'Veggie', price: 0.60 },
      { item: 'Arroz microondas Milbona', amount: '1 vasito', category: 'Carb', price: 0.55 },
    ],
    instructions: [
      'Corta el pollo en trozos pequeños y dóralos en la sartén 5 minutos.',
      'Añade el brócoli troceado y 2 cucharadas de agua; tapa la sartén para que el brócoli se cocine al vapor (3 min).',
      'Vierte una cucharada de salsa teriyaki baja en azúcar y remueve bien.',
      'Calienta el arroz 1 minuto en el microondas y sirve como base del plato.'
    ],
    chefTip: 'No cocines demasiado el brócoli; debe mantener un color verde vibrante y una textura crujiente.'
  },
  {
    id: 'c4',
    name: 'Ensalada de Quinoa con Tiras Crispy',
    category: 'Comida',
    time: '10 min',
    tags: ['pollo', 'quinoa', 'fresco'],
    ingredients: [
      { item: 'Quinoa Real Lidl', amount: '125g (cocida)', category: 'Carb', price: 0.90 },
      { item: 'Pechuga de Pollo asada', amount: '100g', category: 'Protein', price: 1.50 },
      { item: 'Aguacate', amount: '1/2 unidad', category: 'Veggie', price: 0.60 },
    ],
    instructions: [
      'Usa quinoa ya cocida (fría o templada) como base en un bol grande.',
      'Corta el pollo asado en tiras finas y saltéalo 2 minutos para que quede crujiente.',
      'Añade el medio aguacate cortado en cubos y un puñado de canónigos.',
      'Aliña con una mezcla de limón, mostaza dijon y un poco de pimienta.'
    ],
    chefTip: 'Añade granada o trozos de manzana para un contraste de dulzor y textura crujiente.'
  },
  {
    id: 'c5',
    name: 'Pollo al Curry con Leche de Coco',
    category: 'Comida',
    time: '20 min',
    tags: ['pollo', 'especial', 'sabor intenso'],
    ingredients: [
      { item: 'Pechuga troceada', amount: '150g', category: 'Protein', price: 1.10 },
      { item: 'Leche de coco lata', amount: '100ml', category: 'Other', price: 0.80 },
      { item: 'Calabacín', amount: '100g', category: 'Veggie', price: 0.25 },
    ],
    instructions: [
      'Dora el pollo en una olla pequeña con una cucharada de curry en polvo.',
      'Añade el calabacín cortado en medias lunas y cocina 3 minutos.',
      'Vierte los 100ml de leche de coco y deja reducir a fuego lento durante 10 minutos.',
      'Sirve solo o con un poco de coliflor picada (tipo arroz) para una comida baja en carbos.'
    ],
    chefTip: 'Una pizca de jengibre fresco rallado al principio cambiará por completo el plato.'
  },
  {
    id: 'c6',
    name: 'Nuggets Caseros Pollo-Calabacín',
    category: 'Comida',
    time: '25 min',
    tags: ['pollo', 'niños/adultos', 'airfryer'],
    ingredients: [
      { item: 'Picada de Pollo', amount: '200g', category: 'Protein', price: 1.60 },
      { item: 'Calabacín rallado', amount: '50g', category: 'Veggie', price: 0.15 },
      { item: 'Cereales de maíz sin azúcar', amount: '30g', category: 'Carb', price: 0.30 },
    ],
    instructions: [
      'Mezcla la picada de pollo con el calabacín rallado (escurre bien el agua del vegetal).',
      'Forma pequeñas bolas y aplástalas para dar forma de nugget.',
      'Reboza cada pieza en los cereales de maíz previamente triturados.',
      'Cocina en Airfryer a 190°C durante 12-15 minutos o hasta que estén bien dorados.'
    ],
    chefTip: 'Añade ajo en polvo y orégano a la mezcla de la carne para un sabor profesional.'
  },
  {
    id: 'c7',
    name: 'Hamburguesa de Pollo "Clean Style"',
    category: 'Comida',
    time: '12 min',
    tags: ['pollo', 'gym-rat', 'volumen'],
    ingredients: [
      { item: 'Burger de Pollo Lidl', amount: '2 unidades', category: 'Protein', price: 1.80 },
      { item: 'Pan Hamburguesa Integral', amount: '1 unidad', category: 'Carb', price: 0.25 },
      { item: 'Tomate y Lechuga', amount: '50g', category: 'Veggie', price: 0.20 },
    ],
    instructions: [
      'Cocina las burgers de pollo a la plancha (fuego medio) 4-5 minutos por lado.',
      'Tuesta el pan integral ligeramente en la misma sartén.',
      'Monta con rodajas de tomate, lechuga fresca y una lámina de queso light.',
      'Acompaña con unos bastoncitos de zanahoria cruda en lugar de patatas fritas.'
    ],
    chefTip: 'Usa mostaza antigua en lugar de Ketchup para evitar azúcares añadidos.'
  },
  {
    id: 'c8',
    name: 'Salmón con Espárragos y Eneldo',
    category: 'Comida',
    time: '15 min',
    tags: ['salmón', 'premium', 'omega 3'],
    ingredients: [
      { item: 'Lomo de Salmón Lidl', amount: '150g', category: 'Protein', price: 3.50 },
      { item: 'Espárragos Trigueros', amount: '100g', category: 'Veggie', price: 1.20 },
    ],
    instructions: [
      'Coloca el salmón en una sartén fría por el lado de la piel.',
      'Sube el fuego a medio y cocina 6 minutos solo por la piel para que quede crujiente.',
      'Añade los espárragos a los lados y cocina 3 minutos más.',
      'Dales la vuelta al salmón y cocina el último minuto por el lado de la carne.'
    ],
    chefTip: 'El eneldo seco es el mejor amigo del salmón; añádelo justo al sacar de la sartén.'
  },
  {
    id: 'c9',
    name: 'Bowl de Ternera con Pimientos',
    category: 'Comida',
    time: '12 min',
    tags: ['ternera', 'hierro', 'saciante'],
    ingredients: [
      { item: 'Tiras de Ternera', amount: '150g', category: 'Protein', price: 2.10 },
      { item: 'Pimiento Rojo y Verde', amount: '150g', category: 'Veggie', price: 0.50 },
      { item: 'Arroz Basmati', amount: '60g', category: 'Carb', price: 0.15 },
    ],
    instructions: [
      'Hierve el arroz (60g) en abundante agua con sal durante 10 minutos.',
      'Mientras, saltea los pimientos en tiras a fuego vivo.',
      'Cuando estén tostados, añade la ternera y cocina solo 2-3 minutos para que no se endurezca.',
      'Mezcla todo en un bol y añade una pizca de escamas de sal.'
    ],
    chefTip: 'Saca la ternera de la nevera 20 min antes de cocinar para que el centro no quede frío.'
  },
  {
    id: 'c10',
    name: 'Pasta Integral Boloñesa de Lentejas',
    category: 'Comida',
    time: '20 min',
    tags: ['pasta', 'vegana', 'fibra'],
    ingredients: [
      { item: 'Pasta Integral Lidl', amount: '80g', category: 'Carb', price: 0.20 },
      { item: 'Lentejas cocidas (bote)', amount: '100g', category: 'Protein', price: 0.40 },
      { item: 'Tomate tamizado', amount: '150ml', category: 'Veggie', price: 0.35 },
    ],
    instructions: [
      'Cuece la pasta "al dente" siguiendo las instrucciones del paquete (aprox 8-10 min).',
      'En una sartén, calienta el tomate con las lentejas lavadas y escurridas.',
      'Añade orégano y albahaca seca a la salsa.',
      'Integra la pasta en la salsa y remueve un minuto para que coja sabor.'
    ],
    chefTip: 'El agua de cocción de la pasta tiene almidón; añade una cucharada a la salsa para que espese mejor.'
  },

  // --- MERIENDAS (PLÁTANO VARIATIONS) ---
  {
    id: 'm1',
    name: 'Snack de Plátano y Crema de Cacahuete',
    category: 'Merienda',
    time: '3 min',
    tags: ['plátano', 'rápido', 'energía'],
    ingredients: [
      { item: 'Plátano', amount: '1 unidad', category: 'Other', price: 0.25 },
      { item: 'Crema de Cacahuete Lidl', amount: '20g', category: 'Other', price: 0.30 },
    ],
    instructions: [
      'Corta el plátano en rodajas de un centímetro.',
      'Unta una pequeña cantidad de crema de cacahuete (100% fruto seco) sobre cada rodaja.',
      'Puedes poner otra rodaja encima a modo de sándwich.'
    ],
    chefTip: 'Mete los "sándwiches" al congelador 30 min para un snack tipo helado increíble.'
  },
  {
    id: 'm2',
    name: 'Smoothie Verde Post-Entreno',
    category: 'Merienda',
    time: '3 min',
    tags: ['plátano', 'vitamina', 'recuperación'],
    ingredients: [
      { item: 'Plátano congelado', amount: '1 unidad', category: 'Other', price: 0.25 },
      { item: 'Espinacas Baby', amount: 'puñado', category: 'Veggie', price: 0.10 },
      { item: 'Proteína Isla', amount: '1 scoop', category: 'Protein', price: 0.85 },
    ],
    instructions: [
      'Introduce el plátano troceado (mejor si está congelado), las espinacas y la proteína en la batidora.',
      'Añade 200ml de agua o leche de almendras fría.',
      'Tritura a máxima potencia durante 45 segundos hasta que esté cremoso.'
    ],
    chefTip: 'Congelar los plátanos pelados es el secreto para smoothies ultra densos sin usar hielo.'
  },
  {
    id: 'm3',
    name: 'Barritas de Avena y Dátiles (Sin Horno)',
    category: 'Merienda',
    time: '10 min (+frío)',
    tags: ['avena', 'natural', 'para llevar'],
    ingredients: [
      { item: 'Avena Milbona', amount: '100g', category: 'Carb', price: 0.20 },
      { item: 'Dátiles deshuesados', amount: '50g', category: 'Other', price: 0.60 },
      { item: 'Nueces picadas', amount: '20g', category: 'Other', price: 0.40 },
    ],
    instructions: [
      'Tritura los dátiles hasta formar una pasta pegajosa.',
      'Mezcla en un bol con la avena y las nueces picadas.',
      'Extiende la masa en un recipiente cuadrado presionando fuerte con una cuchara.',
      'Enfría 2 horas y corta en forma de barritas.'
    ],
    chefTip: 'Añade una pizca de sal marina para resaltar el dulzor natural del dátil.'
  },
  {
    id: 'm4',
    name: 'Helado de Plátano "Nice Cream"',
    category: 'Merienda',
    time: '5 min',
    tags: ['plátano', 'vegano', 'refrescante'],
    ingredients: [
      { item: 'Plátano congelado', amount: '2 unidades', category: 'Other', price: 0.50 },
      { item: 'Cacao puro Lidl', amount: '10g', category: 'Other', price: 0.15 },
    ],
    instructions: [
      'Saca los plátanos del congelador 5 min antes de procesar.',
      'Tritura en un procesador potente hasta que la textura pase de "migas" a cremosa.',
      'Añade el cacao al final y bate 10 segundos más.',
      'Consume inmediatamente para disfrutar de la mejor textura.'
    ],
    chefTip: 'Si tu batidora sufre, añade una cucharada de leche vegetal para ayudar al proceso.'
  },
  {
    id: 'm5',
    name: 'Muffins de Avena y Queso Fresco',
    category: 'Merienda',
    time: '20 min',
    tags: ['avena', 'proteica', 'snack salado'],
    ingredients: [
      { item: 'Harina de Avena', amount: '50g', category: 'Carb', price: 0.10 },
      { item: 'Queso fresco batido', amount: '100g', category: 'Protein', price: 0.35 },
      { item: 'Huevo', amount: '1 unidad', category: 'Protein', price: 0.20 },
    ],
    instructions: [
      'Mezcla el huevo con el queso fresco en un bol.',
      'Integra la harina de avena y una pizca de levadura química.',
      'Reparte en moldes de silicona para muffins.',
      'Hornea o Airfryer a 180°C durante 12-15 minutos.'
    ],
    chefTip: 'Puedes añadir orégano o queso rallado por encima antes de hornear.'
  },

  // --- CENAS (HUEVOS & LIGERO) ---
  {
    id: 'e1',
    name: 'Shakshuka Express Fit',
    category: 'Cena',
    time: '15 min',
    tags: ['huevos', 'vegetales', 'especia'],
    ingredients: [
      { item: 'Huevos L', amount: '2 unidades', category: 'Protein', price: 0.40 },
      { item: 'Tomate triturado', amount: '200ml', category: 'Veggie', price: 0.45 },
      { item: 'Cebolla picada', amount: '50g', category: 'Veggie', price: 0.10 },
    ],
    instructions: [
      'Sofríe la cebolla en una sartén mediana con un poco de comino.',
      'Vierte el tomate y deja que borbotee 5 minutos a fuego medio.',
      'Haz dos huecos en el tomate y echa los huevos con cuidado.',
      'Tapa la sartén y cocina 3-4 min hasta que la clara cuaje pero la yema siga líquida.'
    ],
    chefTip: 'Sirve con una rebanada de pan integral tostado para mojar la yema.'
  },
  {
    id: 'e2',
    name: 'Wok de Gambas y Brócoli',
    category: 'Cena',
    time: '10 min',
    tags: ['proteína', 'bajo carbo', 'cena ligera'],
    ingredients: [
      { item: 'Gambas peladas congeladas', amount: '150g', category: 'Protein', price: 2.50 },
      { item: 'Brócoli fresco', amount: '200g', category: 'Veggie', price: 0.60 },
    ],
    instructions: [
      'Saltea las gambas con ajo picado en una sartén muy caliente.',
      'Añade el brócoli previamente cocinado al vapor 3 minutos (debe estar crujiente).',
      'Añade jengibre en polvo y salsa de soja.',
      'Saltea el conjunto un minuto final para integrar sabores.'
    ],
    chefTip: 'Seca bien las gambas antes de echarlas a la sartén o se cocerán en lugar de dorarse.'
  },
  {
    id: 'e3',
    name: 'Pescado en Papillote al Microondas',
    category: 'Cena',
    time: '8 min',
    tags: ['limpio', 'digestivo', 'pescado'],
    ingredients: [
      { item: 'Filete de Merluza Lidl', amount: '150g', category: 'Protein', price: 2.20 },
      { item: 'Calabacín en rodajas', amount: '100g', category: 'Veggie', price: 0.25 },
    ],
    instructions: [
      'Coloca una cama de calabacín en un estuche de vapor o sobre papel de horno.',
      'Pon el pescado encima, sal, pimienta y una rodaja de limón.',
      'Cierra herméticamente y cocina en el microondas a potencia media-alta durante 4-5 minutos.',
      'Deja reposar un minuto antes de abrir para que los jugos se asienten.'
    ],
    chefTip: 'No uses papel de aluminio en el microondas; usa papel de horno (sulfurizado) si no tienes estuche.'
  },
  {
    id: 'e4',
    name: 'Tacos de Lechuga con Ternera',
    category: 'Cena',
    time: '12 min',
    tags: ['ternera', 'low-carb', 'sabroso'],
    ingredients: [
      { item: 'Carne picada de Ternera', amount: '150g', category: 'Protein', price: 1.80 },
      { item: 'Cogollos de lechuga', amount: '3 hojas', category: 'Veggie', price: 0.35 },
      { item: 'Pico de gallo casero', amount: '30g', category: 'Veggie', price: 0.20 },
    ],
    instructions: [
      'Cocina la ternera en la sartén con especias mexicanas hasta que esté bien dorada.',
      'Lava las hojas de cogollo y úsalas como base (tipo taco).',
      'Rellena cada hoja con la carne y añade el pico de gallo encima.',
      'Añade unas gotas de lima para un toque fresco.'
    ],
    chefTip: 'Si quieres más saciedad, añade una cucharada de frijoles negros por taco.'
  },
  {
    id: 'e5',
    name: 'Tortilla de Berenjena y Cebolla',
    category: 'Cena',
    time: '15 min',
    tags: ['huevos', 'vegetariano', 'saciante'],
    ingredients: [
      { item: 'Huevos L', amount: '2 unidades', category: 'Protein', price: 0.40 },
      { item: 'Berenjena grande', amount: '1/2 unidad', category: 'Veggie', price: 0.40 },
    ],
    instructions: [
      'Corta la berenjena en dados pequeños y saltéala con cebolla hasta que esté muy blanda.',
      'Bate los huevos y mezcla con la berenjena caliente; deja reposar 1 minuto fuera del fuego.',
      'Vuelve a la sartén y cuaja la tortilla como si fuera de patata.',
      'Queda mucho más ligera que la tradicional pero igual de rica.'
    ],
    chefTip: 'Cocina la berenjena con la piel para aprovechar toda su fibra y antioxidantes.'
  },

  // --- ADDING 30+ MORE TO REACH 60 ---
  { id: 'd11', name: 'Gachas de Chocolate y Coco', category: 'Desayuno', time: '8 min', tags: ['avena', 'dulce fit'], ingredients: [{ item: 'Avena', amount: '50g', category: 'Carb', price: 0.10 }, { item: 'Cacao', amount: '5g', category: 'Other', price: 0.10 }, { item: 'Claras', amount: '100ml', category: 'Protein', price: 0.40 }], instructions: ['Mezcla avena, cacao y 200ml agua.', 'Cuece 5 min.', 'Añade claras y remueve hasta que espese.', 'Sirve con coco rallado.'], chefTip: 'El cacao puro amarga; si necesitas dulce añade eritritol.', },
  { id: 'd12', name: 'Pancakes de Avena y Manzana', category: 'Desayuno', time: '15 min', tags: ['avena', 'fruta'], ingredients: [{ item: 'Avena', amount: '40g', category: 'Carb', price: 0.08 }, { item: 'Manzana rallada', amount: '1', category: 'Veggie', price: 0.40 }, { item: 'Huevo', amount: '1', category: 'Protein', price: 0.20 }], instructions: ['Mezcla los ingredientes.', 'Deja reposar la masa 5 min.', 'Haz las tortitas a fuego medio en sartén engrasada.', 'Sirve con canela.'], chefTip: 'Rallar la manzana hace la masa mucho más jugosa.', },
  { id: 'd13', name: 'Tostada de Pavo y Queso Crema', category: 'Desayuno', time: '5 min', tags: ['rápido', 'proteico'], ingredients: [{ item: 'Pan Integral', amount: '2', category: 'Carb', price: 0.30 }, { item: 'Pavo lonchas', amount: '4', category: 'Protein', price: 0.80 }, { item: 'Queso crema', amount: '20g', category: 'Other', price: 0.20 }], instructions: ['Tuesta el pan.', 'Unta el queso crema.', 'Coloca las lonchas de pavo.', 'Añade pimienta al gusto.'], chefTip: 'Usa pavo con >90% de carne para mejor calidad nutricional.', },
  { id: 'd14', name: 'Bowl de Kéfir y Nueces', category: 'Desayuno', time: '3 min', tags: ['probiótico', 'fresco'], ingredients: [{ item: 'Kéfir Lidl', amount: '200ml', category: 'Protein', price: 0.70 }, { item: 'Nueces Alesto', amount: '30g', category: 'Other', price: 0.50 }, { item: 'Dátiles', amount: '2', category: 'Other', price: 0.20 }], instructions: ['Pon el kéfir en un bol.', 'Corta los dátiles en trocitos.', 'Añade las nueces y dátiles.', 'Remueve y disfruta.'], chefTip: 'El kéfir es más ácido que el yogur, ideal para despertar el sistema digestivo.', },
  { id: 'd15', name: 'Huevos Revueltos con Champiñones', category: 'Desayuno', time: '10 min', tags: ['huevos', 'low carb'], ingredients: [{ item: 'Huevos', amount: '3', category: 'Protein', price: 0.60 }, { item: 'Champiñones', amount: '100g', category: 'Veggie', price: 0.50 }], instructions: ['Limpia y lamina los champiñones.', 'Saltéalos 5 min en sartén.', 'Añade los huevos batidos y remueve despacio.', 'Sirve caliente.'], chefTip: 'No batas demasiado los huevos para que queden más cremosos.', },
  { id: 'd16', name: 'Gachas Alpinas (con Frutos Secos)', category: 'Desayuno', time: '7 min', tags: ['avena', 'energía'], ingredients: [{ item: 'Avena', amount: '50g', category: 'Carb', price: 0.10 }, { item: 'Leche avena', amount: '200ml', category: 'Other', price: 0.25 }, { item: 'Mix frutos secos', amount: '20g', category: 'Other', price: 0.40 }], instructions: ['Cuece la avena en la leche.', 'Cuando esté lista, añade los frutos secos.', 'Endulza con un poco de miel si quieres.', 'Tapa y deja reposar 1 min.'], chefTip: 'Tostar los frutos secos antes potencia mucho el sabor del desayuno.', },
  { id: 'd17', name: 'Smoothie Bowl de Mango Fit', category: 'Desayuno', time: '5 min', tags: ['plátano', 'vitamina'], ingredients: [{ item: 'Plátano', amount: '1', category: 'Other', price: 0.25 }, { item: 'Mango congelado', amount: '100g', category: 'Veggie', price: 1.00 }, { item: 'Proteína neutral', amount: '15g', category: 'Protein', price: 0.40 }], instructions: ['Tritura el plátano y el mango con poco líquido.', 'Debe quedar una textura espesa tipo helado.', 'Pasa a un bol.', 'Decora con semillas de cáñamo.'], chefTip: 'Usa poco líquido para que los toppings no se hundan.', },
  { id: 'd18', name: 'Tostada con Requesón y Miel', category: 'Desayuno', time: '4 min', tags: ['tradicional', 'proteico'], ingredients: [{ item: 'Pan Integral', amount: '1', category: 'Carb', price: 0.15 }, { item: 'Requesón Lidl', amount: '80g', category: 'Protein', price: 0.60 }, { item: 'Miel', amount: '10g', category: 'Other', price: 0.15 }], instructions: ['Tuesta el pan.', 'Pon una capa generosa de requesón.', 'Añade un hilo de miel por encima.', 'Opcional: un poco de sésamo.'], chefTip: 'El requesón tiene mucha proteína caseína, ideal si desayunas muy temprano.', },
  { id: 'd19', name: 'Porridge de Pera y Jengibre', category: 'Desayuno', time: '10 min', tags: ['avena', 'digestivo'], ingredients: [{ item: 'Avena', amount: '45g', category: 'Carb', price: 0.09 }, { item: 'Pera madura', amount: '1', category: 'Veggie', price: 0.50 }, { item: 'Jengibre', amount: 'pizca', category: 'Other', price: 0.05 }], instructions: ['Corta la pera en dados pequeños.', 'Cuece con la avena y el jengibre rallado.', 'Cocina hasta que la pera se deshaga un poco.', 'Sirve caliente.'], chefTip: 'El jengibre ayuda a la digestión si eres sensible a los lácteos matutinos.', },
  { id: 'd20', name: 'Tortilla de Claras y Pavo Ahumado', category: 'Desayuno', time: '7 min', tags: ['clima frío', 'proteína pura'], ingredients: [{ item: 'Claras bote', amount: '200ml', category: 'Protein', price: 0.85 }, { item: 'Pavo Lidl', amount: '50g', category: 'Protein', price: 0.90 }], instructions: ['Vierte las claras en la sartén caliente.', 'Pon el pavo en el centro.', 'Dobla con cuidado cuando empiece a cuajar.', 'Cocina 1 min por lado.'], chefTip: 'Añade cebollino fresco al final para un aroma increíble.', },

  { id: 'c11', name: 'Pollo Teriyaki Express', category: 'Comida', time: '12 min', tags: ['pollo', 'asiática'], ingredients: [{ item: 'Pollo tiras', amount: '150g', category: 'Protein', price: 1.10 }, { item: 'Salsa Teriyaki', amount: '20ml', category: 'Other', price: 0.30 }, { item: 'Arroz micro', amount: '1', category: 'Carb', price: 0.55 }], instructions: ['Saltea el pollo hasta dorar.', 'Añade la salsa y reduce 2 min.', 'Sirve sobre el arroz caliente.', 'Añade sésamo.'], chefTip: 'Reduce la salsa hasta que brille y se pegue al pollo.', },
  { id: 'c12', name: 'Bowl de Pollo y Boniato', category: 'Comida', time: '30 min', tags: ['pollo', 'boniato', 'fitness'], ingredients: [{ item: 'Pechuga', amount: '180g', category: 'Protein', price: 1.30 }, { item: 'Boniato', amount: '200g', category: 'Carb', price: 0.40 }, { item: 'Brócoli', amount: '100g', category: 'Veggie', price: 0.30 }], instructions: ['Corta todo en dados.', 'Hornea o Airfy a 190°C por 20 min.', 'Aliña con aceite y limón.', 'Sirve templado.'], chefTip: 'El boniato asado tiene un índice glucémico menor que el puré.', },
  { id: 'c13', name: 'Ensalada Cesar Fit', category: 'Comida', time: '10 min', tags: ['pollo', 'fresco'], ingredients: [{ item: 'Pollo asado', amount: '120g', category: 'Protein', price: 1.80 }, { item: 'Lechuga Romana', amount: '150g', category: 'Veggie', price: 0.50 }, { item: 'Queso Grana Padano', amount: '10g', category: 'Other', price: 0.40 }], instructions: ['Trocea la lechuga y el pollo.', 'Añade el queso rallado.', 'Haz salsa con yogur, limón y anchoa triturada.', 'Mezcla bien.'], chefTip: 'Usa yogur griego en lugar de mayonesa para la salsa Cesar.', },
  { id: 'c14', name: 'Pollo al Ajillo Tradicional Fit', category: 'Comida', time: '15 min', tags: ['pollo', 'tradicional'], ingredients: [{ item: 'Contramuslo deshuesado', amount: '200g', category: 'Protein', price: 1.60 }, { item: 'Ajos Lidl', amount: '5 dientes', category: 'Veggie', price: 0.10 }, { item: 'Vino blanco', amount: '20ml', category: 'Other', price: 0.15 }], instructions: ['Dora los ajos enteros.', 'Añade el pollo y sube el fuego.', 'Vierte el vino y deja evaporar 3 min.', 'Cocina hasta secar salsa.'], chefTip: 'No quites la piel si quieres máximo sabor, pero cuenta las grasas.', },
  { id: 'c15', name: 'Wok de Pollo con Anacardos', category: 'Comida', time: '12 min', tags: ['pollo', 'crunchy'], ingredients: [{ item: 'Pollo dados', amount: '150g', category: 'Protein', price: 1.10 }, { item: 'Anacardos Alesto', amount: '15g', category: 'Other', price: 0.45 }, { item: 'Zanahoria', amount: '1', category: 'Veggie', price: 0.15 }], instructions: ['Saltea pollo y zanahoria.', 'Añade los anacardos al final.', 'Añade salsa de soja.', 'Revuelve 30 segundos.'], chefTip: 'Tostar los anacardos en el wok les devuelve su textura original.', },
  { id: 'c16', name: 'Pollo Relleno de Espinacas', category: 'Comida', time: '25 min', tags: ['pollo', 'premium'], ingredients: [{ item: 'Pechuga entera', amount: '1', category: 'Protein', price: 1.50 }, { item: 'Espinacas', amount: '50g', category: 'Veggie', price: 0.30 }, { item: 'Queso feta', amount: '20g', category: 'Other', price: 0.40 }], instructions: ['Haz un corte lateral en la pechuga.', 'Rellena con espinacas y feta.', 'Cierra con palillos.', 'Cocina a la plancha tapado.'], chefTip: 'Tapar la sartén crea una cámara de vapor que cocina el relleno rápido.', },
  { id: 'c17', name: 'Wraps de Pollo y Hummus', category: 'Comida', time: '8 min', tags: ['pollo', 'hummus', 'rápido'], ingredients: [{ item: 'Tortilla trigo', amount: '2', category: 'Carb', price: 0.40 }, { item: 'Pollo asado', amount: '100g', category: 'Protein', price: 1.50 }, { item: 'Hummus Lidl', amount: '40g', category: 'Other', price: 0.30 }], instructions: ['Unta el hummus en las tortillas.', 'Pon el pollo troceado.', 'Añade pepino en láminas.', 'Enrolla apretando bien.'], chefTip: 'Calienta la tortilla 10 seg por lado para que sea más elástica.', },
  { id: 'c18', name: 'Arroz con Pollo y Cúrcuma', category: 'Comida', time: '20 min', tags: ['pollo', 'arroz', 'antiinflamatorio'], ingredients: [{ item: 'Pollo trozos', amount: '150g', category: 'Protein', price: 1.10 }, { item: 'Arroz grano corto', amount: '70g', category: 'Carb', price: 0.15 }, { item: 'Cúrcuma', amount: 'pizca', category: 'Other', price: 0.05 }], instructions: ['Dora el pollo con cúrcuma.', 'Añade el arroz y saltea.', 'Vierte el doble de agua cálida.', 'Cuece 15 min hasta secar.'], chefTip: 'Añade pimienta negra junto a la cúrcuma para activar la curcumina.', },
  { id: 'c19', name: 'Albóndigas de Pollo Caseras', category: 'Comida', time: '25 min', tags: ['pollo', 'meal prep'], ingredients: [{ item: 'Picada de pollo', amount: '200g', category: 'Protein', price: 1.60 }, { item: 'Huevo', amount: '1', category: 'Protein', price: 0.20 }, { item: 'Salsa tomate', amount: '100ml', category: 'Veggie', price: 0.30 }], instructions: ['Mezcla carne y huevo.', 'Forma bolas pequeñas.', 'Dóralas en sartén.', 'Añade tomate y cocina 10 min.'], chefTip: 'Usa poco pan rallado para que no suban los carbos.', },
  { id: 'c20', name: 'Pollo Gratinado con Mozzarella', category: 'Comida', time: '15 min', tags: ['pollo', 'queso'], ingredients: [{ item: 'Filetes pollo', amount: '150g', category: 'Protein', price: 1.10 }, { item: 'Mozzarella light', amount: '40g', category: 'Other', price: 0.50 }, { item: 'Orégano', amount: 'pizca', category: 'Other', price: 0.05 }], instructions: ['Haz el pollo a la plancha.', 'Pon el queso encima el último min.', 'Tapa para que funda.', 'Sirve con ensalada.'], chefTip: 'La mozzarella light funde muy bien y reduce las grasas a la mitad.', },

  { id: 'a4', name: 'Snack de Queso y Pavo', category: 'Almuerzo', time: '2 min', tags: ['queso', 'proteína'], ingredients: [{ item: 'Queso en lonchas', amount: '2', category: 'Protein', price: 0.40 }, { item: 'Pavo', amount: '2 lonchas', category: 'Protein', price: 0.40 }], instructions: ['Enrolla el pavo dentro del queso.', 'Come directamente.'], chefTip: 'Ideal si estás en la oficina y no tienes tiempo de nada.', },
  { id: 'a5', name: 'Puñado de Almendras Alesto', category: 'Almuerzo', time: '1 min', tags: ['frutos secos', 'grasas'], ingredients: [{ item: 'Almendras', amount: '30g', category: 'Other', price: 0.60 }], instructions: ['Contar 20 almendras.', 'Disfrutar.'], chefTip: 'Cuidado con la cantidad, son muy densas calóricamente.', },
  { id: 'a6', name: 'Tortita de Arroz con Atún', category: 'Almuerzo', time: '3 min', tags: ['atún', 'rápido'], ingredients: [{ item: 'Tortita arroz', amount: '2', category: 'Carb', price: 0.20 }, { item: 'Atún natural', amount: '1 lata', category: 'Protein', price: 0.80 }], instructions: ['Escurre el atún.', 'Ponlo sobre las tortitas.', 'Añade un poco de sal.'], chefTip: 'Añade una gota de tabasco si te gusta el picante.', },
  { id: 'a8', name: 'Queso Batido con Canela', category: 'Almuerzo', time: '2 min', tags: ['queso', 'proteína'], ingredients: [{ item: 'Queso fresco batido', amount: '200g', category: 'Protein', price: 0.60 }, { item: 'Canela', amount: 'pizca', category: 'Other', price: 0.05 }], instructions: ['Poner en un bol.', 'Mezclar con canela.', 'Batir bien.'], chefTip: 'La canela sacia el hambre de dulce sin añadir calorías.', },
  { id: 'a9', name: 'Bebida Proteica Milbona', category: 'Almuerzo', time: '1 min', tags: ['proteína', 'líquido'], ingredients: [{ item: 'Batido chocolate', amount: '1 unidad', category: 'Protein', price: 0.95 }], instructions: ['Agitar.', 'Beber muy frío.'], chefTip: 'Tiene 35g de proteína, una de las mejores del Lidl.', },

  { id: 'm6', name: 'Brocheta de Tomate y Mozzarella', category: 'Merienda', time: '5 min', tags: ['fresco', 'mediterráneo'], ingredients: [{ item: 'Tomates cherry', amount: '6', category: 'Veggie', price: 0.40 }, { item: 'Mini mozzarella', amount: '6', category: 'Protein', price: 0.80 }], instructions: ['Pincha un tomate y una bola.', 'Repite hasta llenar brocheta.', 'Añade albahaca.'], chefTip: 'Es el snack perfecto para evitar picar galletas por la tarde.', },
  { id: 'm10', name: 'Crepe Fit de Avena', category: 'Merienda', time: '10 min', tags: ['avena', 'merienda fit'], ingredients: [{ item: 'Claras', amount: '100ml', category: 'Protein', price: 0.40 }, { item: 'Harina de avena', amount: '20g', category: 'Carb', price: 0.05 }], instructions: ['Mezcla muy bien.', 'Vierte en sartén grande extendiendo.', 'Cocina 1 min por lado.', 'Rellena con lo que quieras.'], chefTip: 'Para que no se pegue la sartén debe estar bien caliente al principio.', },
  { id: 'm11', name: 'Gelatina de Proteína Mix', category: 'Merienda', time: '2 min', tags: ['proteína', 'bajo kcal'], ingredients: [{ item: 'Gelatina 0%', amount: '1', category: 'Other', price: 0.40 }, { item: 'Queso freso', amount: '50g', category: 'Protein', price: 0.20 }], instructions: ['Mezcla ambos en un bol.', 'Machaca con cuchara.', 'Disfruta frío.'], chefTip: 'Parece un postre de restaurante pero es pura proteína.', },
  { id: 'm12', name: 'Plátano Choco-Peanut', category: 'Merienda', time: '5 min', tags: ['plátano', 'dulce'], ingredients: [{ item: 'Plátano', amount: '1', category: 'Other', price: 0.25 }, { item: 'Choco 85%', amount: '1 onza', category: 'Other', price: 0.20 }], instructions: ['Derrite el chocolate.', 'Baña el plátano.', 'Espolvorea cacahuete.'], chefTip: 'El chocolate 85% tiene antioxidantes que benefician el corazón.', },
  { id: 'm13', name: 'Bowl de Avena y Frambuesa', category: 'Merienda', time: '5 min', tags: ['avena', 'fresco'], ingredients: [{ item: 'Copos avena', amount: '25g', category: 'Carb', price: 0.05 }, { item: 'Leche coco', amount: '100ml', category: 'Other', price: 0.40 }, { item: 'Frambuesas', amount: '30g', category: 'Veggie', price: 0.70 }], instructions: ['Remoja la avena en la leche fría.', 'Añade frambuesas.', 'Aplasta una frambuesa para teñir la leche.'], chefTip: 'La frambuesa tiene mucha fibra, ideal para llegar a la cena saciado.', },

  { id: 'e6', name: 'Ensalada de Atún y Huevo', category: 'Cena', time: '5 min', tags: ['atún', 'huevos', 'rápido'], ingredients: [{ item: 'Atún natural', amount: '2 latas', category: 'Protein', price: 1.60 }, { item: 'Huevo cocido', amount: '1', category: 'Protein', price: 0.20 }, { item: 'Mezclum', amount: 'bolsa', category: 'Veggie', price: 0.80 }], instructions: ['Pon la lechuga en un bol.', 'Añade atún y el huevo cortado.', 'Aliña con vinagre.'], chefTip: 'Compra latas en pack para ahorrar dinero en tu lista.', },
  { id: 'e16', name: 'Sopa de Pollo y Fideos Finos', category: 'Cena', time: '15 min', tags: ['pollo', 'confort'], ingredients: [{ item: 'Caldo pollo', amount: '400ml', category: 'Other', price: 0.80 }, { item: 'Pollo restos', amount: '50g', category: 'Protein', price: 0.50 }, { item: 'Fideos', amount: '20g', category: 'Carb', price: 0.10 }], instructions: ['Hierve el caldo.', 'Añade fideos y cocina 3 min.', 'Pon el pollo troceado al final.', 'Añade una hoja de hierbabuena.'], chefTip: 'La hierbabuena le da el toque de sopa de abuela madrileña.', },
  { id: 'e17', name: 'Tortilla Francesa de Atún', category: 'Cena', time: '6 min', tags: ['huevos', 'atún'], ingredients: [{ item: 'Huevos', amount: '2', category: 'Protein', price: 0.40 }, { item: 'Atún lata', amount: '1', category: 'Protein', price: 0.80 }], instructions: ['Bate huevos.', 'Añade el atún bien escurrido.', 'Cocina la tortilla.', 'No cuajes demasiado el centro.'], chefTip: 'Escurre el aceite del atún para ahorrar hasta 150 kcal por lata.', },
  { id: 'e18', name: 'Pechuga a la Plancha "Juicy"', category: 'Cena', time: '10 min', tags: ['pollo', 'básico'], ingredients: [{ item: 'Filete pechuga', amount: '180g', category: 'Protein', price: 1.30 }, { item: 'Especias pollo', amount: 'pizca', category: 'Other', price: 0.05 }], instructions: ['Pon sartén a tope.', 'Echa el pollo y no lo muevas 2 min.', 'Dale la vuelta y apaga el fuego.', 'Deja que se termine con calor residual.'], chefTip: 'El calor residual es la clave para que la pechuga no sea "suela de zapato".', },
  { id: 'e19', name: 'Calabacines Rellenos de Pavo', category: 'Cena', time: '20 min', tags: ['pavo', 'vegetal', 'horno'], ingredients: [{ item: 'Calabacín', amount: '1 grande', category: 'Veggie', price: 0.50 }, { item: 'Picada pavo', amount: '100g', category: 'Protein', price: 0.90 }], instructions: ['Corta el calabacín a lo largo.', 'Vacía con cuchara.', 'Mezcla pulpa con pavo y cocina 5 min.', 'Rellena y gratina 10 min.'], chefTip: 'Usa el horno a máxima potencia solo para gratinar al final.', },
  { id: 'e20', name: 'Poke de Salmon y Aguacate', category: 'Cena', time: '10 min', tags: ['salmón', 'premium', 'fresco'], ingredients: [{ item: 'Salmón dados', amount: '100g', category: 'Protein', price: 2.50 }, { item: 'Aguacate', amount: '1/2', category: 'Veggie', price: 0.60 }, { item: 'Arroz micro', amount: '0.5', category: 'Carb', price: 0.30 }], instructions: ['Pon el arroz de base.', 'Coloca salmón y aguacate encima.', 'Añade semillas de sésamo.', 'Aliña con soja.'], chefTip: 'Congela el salmón 48h antes por seguridad alimentaria (anisakis).', },
  { id: 'e21', name: 'Entrecot de Ternera a la Plancha', category: 'Cena', time: '8 min', tags: ['ternera', 'premium', 'hierro'], ingredients: [{ item: 'Entrecot pieza', amount: '200g', category: 'Protein', price: 4.50 }, { item: 'Sal gorda', amount: 'pizca', category: 'Other', price: 0.05 }], instructions: ['Atempera la carne 30 min fuera de nevera.', 'Sartén muy caliente.', 'Cocina 2 min por lado.', 'Echa la sal al final.'], chefTip: 'Nunca pinches la carne para darle la vuelta, usa pinzas o se saldrán los jugos.', },
  { id: 'e22', name: 'Tortilla de Patata Microondas Fit', category: 'Cena', time: '15 min', tags: ['huevos', 'tradicional'], ingredients: [{ item: 'Patatas', amount: '200g', category: 'Carb', price: 0.40 }, { item: 'Huevos', amount: '3', category: 'Protein', price: 0.60 }], instructions: ['Pica patata fina.', 'Cocina en micro 7 min con un poco de agua.', 'Mezcla con huevos batidos.', 'Cuaja en sartén 1 min por lado.'], chefTip: 'Cocinar la patata al micro ahorra el 80% de las calorías del aceite frito.', },
  { id: 'e23', name: 'Burrito de Pavo y Queso', category: 'Cena', time: '5 min', tags: ['pavo', 'rápido'], ingredients: [{ item: 'Tortilla integral', amount: '1', category: 'Carb', price: 0.20 }, { item: 'Fiambre pavo 95%', amount: '100g', category: 'Protein', price: 1.50 }], instructions: ['Pon el pavo en la tortilla.', 'Añade queso ligero.', 'Dobla y tuesta en la sartén 30 seg.', 'Come caliente.'], chefTip: 'Tostar el burrito lo mantiene cerrado sin necesidad de palillos.', },
  { id: 'e24', name: 'Brochetas de Pavo y Piña', category: 'Cena', time: '12 min', tags: ['pavo', 'exótico'], ingredients: [{ item: 'Pavo dados', amount: '150g', category: 'Protein', price: 1.20 }, { item: 'Piña natural', amount: '2 rodajas', category: 'Veggie', price: 0.40 }], instructions: ['Alterna trozos de pavo y piña en el palo.', 'Cocina a la plancha.', 'Pincela con un poco de soja.'], chefTip: 'La enzima de la piña (bromelina) ayuda a digerir la proteína del pavo.', },
  { id: 'e25', name: 'Crema de Calabacín y Quesitos', category: 'Cena', time: '15 min', tags: ['vegetal', 'caliente', 'ligero'], ingredients: [{ item: 'Calabacín', amount: '2', category: 'Veggie', price: 0.80 }, { item: 'Quesitos light', amount: '2', category: 'Protein', price: 0.25 }], instructions: ['Hierve calabacín 10 min con poca agua.', 'Retira la mitad del agua.', 'Añade quesitos y tritura.', 'Sirve caliente.'], chefTip: 'No quites la piel del calabacín para que la crema sea verde intenso y con fibra.', },
  { id: 'e26', name: 'Wok de Ternera y Zanahoria', category: 'Cena', time: '10 min', tags: ['ternera', 'rápido'], ingredients: [{ item: 'Ternera tiras', amount: '150g', category: 'Protein', price: 2.10 }, { item: 'Zanahoria rallada', amount: '100g', category: 'Veggie', price: 0.30 }], instructions: ['Saltea zanahoria 3 min.', 'Añade ternera y cocina 2 min alto fuego.', 'Mezcla con soja.', 'Disfruta.'], chefTip: 'La zanahoria rallada se cocina casi instantáneamente en el wok.', },
  { id: 'e27', name: 'Ensalada de Espinacas y Nueces', category: 'Cena', time: '5 min', tags: ['fresco', 'vegetariano'], ingredients: [{ item: 'Espinacas frescas', amount: '100g', category: 'Veggie', price: 0.50 }, { item: 'Nueces', amount: '20g', category: 'Other', price: 0.35 }], instructions: ['Lava las espinacas.', 'Añade las nueces troceadas.', 'Aliña con módena.', 'Añade pasas si quieres.'], chefTip: 'El vinagre de módena es dulce, úsalo con moderación por el azúcar.', },
  { id: 'e28', name: 'Pavo a la Pimienta con Judías', category: 'Cena', time: '15 min', tags: ['pavo', 'judías'], ingredients: [{ item: 'Filete pavo', amount: '150g', category: 'Protein', price: 1.20 }, { item: 'Judías verdes lata', amount: '150g', category: 'Veggie', price: 0.60 }], instructions: ['Cocina el pavo con mucha pimienta.', 'Añade las judías a la sartén 2 min.', 'Sirve todo junto.', 'Añade un poco de pimentón.'], chefTip: 'Las judías de bote son una solución rápida y nutritiva para cenas de 5 min.', },
  { id: 'e29', name: 'Tortilla de Champiñones y Perejil', category: 'Cena', time: '10 min', tags: ['huevos', 'champi'], ingredients: [{ item: 'Huevos', amount: '2', category: 'Protein', price: 0.40 }, { item: 'Champiñones laminados', amount: '100g', category: 'Veggie', price: 0.50 }], instructions: ['Dora los champis con ajo y perejil.', 'Echa el huevo batido.', 'Dobla y sirve.', 'Queda muy aromática.'], chefTip: 'Perejil fresco siempre al final para que no pierda color.', },
  { id: 'e30', name: 'Brochetas de Gambas y Calabacín', category: 'Cena', time: '10 min', tags: ['pescado', 'light'], ingredients: [{ item: 'Gambas', amount: '100g', category: 'Protein', price: 1.80 }, { item: 'Calabacín dados', amount: '100g', category: 'Veggie', price: 0.25 }], instructions: ['Monta las brochetas.', 'Haz a la plancha con limón.', 'Sazona con ajo en polvo.', 'Sirve con ensalada.'], chefTip: 'Si usas palitos de madera, mójalos 5 min antes para que no se quemen.', },
];
