export interface Recipe {
  id: string;
  name: string;
  category: 'Desayuno' | 'Almuerzo' | 'Comida' | 'Merienda' | 'Cena';
  ingredients: { item: string; amount: string; category: 'Protein' | 'Veggie' | 'Carb' | 'Other'; price: number }[];
  time: string;
  instructions: string[];
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
};

export const RECIPES: Recipe[] = [
  // --- DESAYUNO ---
  {
    id: 'd1',
    name: 'Gachas de Avena Proteicas',
    category: 'Desayuno',
    time: '5 min',
    ingredients: [
      { item: 'Avena Milbona', amount: '50g', category: 'Carb', price: 0.10 },
      { item: 'Leche de Almendras', amount: '200ml', category: 'Other', price: 0.26 },
      { item: 'Proteína en polvo (Sportyfeel)', amount: '1 scoop', category: 'Protein', price: 0.80 },
      { item: 'Plátano', amount: '1', category: 'Other', price: 0.20 },
    ],
    instructions: ['1. Mezcla avena y leche en un bol.', '2. Calienta 2 min en microondas.', '3. Añade la proteína y mezcla bien.', '4. Decora con plátano.'],
  },
  {
    id: 'd2',
    name: 'Tortitas Fit de Plátano',
    category: 'Desayuno',
    time: '10 min',
    ingredients: [
      { item: 'Huevos (Claras)', amount: '3', category: 'Protein', price: 0.60 },
      { item: 'Plátano', amount: '1', category: 'Other', price: 0.20 },
      { item: 'Avena', amount: '30g', category: 'Carb', price: 0.06 },
    ],
    instructions: ['1. Tritura el plátano con las claras y la avena.', '2. Cocina a la plancha por ambos lados.', '3. Sirve caliente.'],
  },
  {
    id: 'd3',
    name: 'Tostada Aguacate y Huevo',
    category: 'Desayuno',
    time: '10 min',
    ingredients: [
      { item: 'Pan Integral 100%', amount: '2 rebanadas', category: 'Carb', price: 0.30 },
      { item: 'Aguacate', amount: '0.5', category: 'Veggie', price: 0.60 },
      { item: 'Huevo Cocido', amount: '1', category: 'Protein', price: 0.20 },
    ],
    instructions: ['1. Tuesta el pan.', '2. Machaca el aguacate encima.', '3. Añade el huevo cocido en rodajas.', '4. Sal y pimienta al gusto.'],
  },
  {
    id: 'd4',
    name: 'Bowl Queso Fresco Batido',
    category: 'Desayuno',
    time: '3 min',
    ingredients: [
      { item: 'Queso fresco batido Milbona', amount: '250g', category: 'Protein', price: 0.75 },
      { item: 'Arándanos', amount: 'un puñado', category: 'Veggie', price: 0.50 },
      { item: 'Nueces Alesto', amount: '5', category: 'Other', price: 0.25 },
    ],
    instructions: ['1. Pon el queso en un bol.', '2. Añade los arándanos y las nueces.', '3. Mezcla y disfruta.'],
  },
  {
    id: 'd5',
    name: 'Smoothie Verde Proteico',
    category: 'Desayuno',
    time: '5 min',
    ingredients: [
      { item: 'Espinacas Baby', amount: 'puñado', category: 'Veggie', price: 0.15 },
      { item: 'Proteína Vainilla', amount: '1 scoop', category: 'Protein', price: 0.80 },
      { item: 'Bebida de Avena', amount: '250ml', category: 'Other', price: 0.30 },
    ],
    instructions: ['1. Pon todo en la batidora.', '2. Bate hasta que sea homogéneo.', '3. Bebe frío.'],
  },
  {
    id: 'd6',
    name: 'Omelette de Pavo y Queso',
    category: 'Desayuno',
    time: '8 min',
    ingredients: [
      { item: 'Huevos', amount: '2', category: 'Protein', price: 0.40 },
      { item: 'Pavo en lonchas', amount: '3', category: 'Protein', price: 0.45 },
      { item: 'Queso ligero', amount: '1 loncha', category: 'Other', price: 0.20 },
    ],
    instructions: ['1. Bate los huevos.', '2. Echa en la sartén y añade el pavo y el queso.', '3. Dobla y sirve.'],
  },

  // --- ALMUERZO ---
  {
    id: 'a1',
    name: 'Yogur Griego con Almendras',
    category: 'Almuerzo',
    time: '2 min',
    ingredients: [
      { item: 'Yogur Griego Milbona', amount: '1', category: 'Protein', price: 0.45 },
      { item: 'Almendras Alesto', amount: '10', category: 'Other', price: 0.30 },
    ],
    instructions: ['1. Abre el yogur.', '2. Añade las almendras.', '3. Listo.'],
  },
  {
    id: 'a2',
    name: 'Rollitos de Pavo y Queso',
    category: 'Almuerzo',
    time: '4 min',
    ingredients: [
      { item: 'Pavo extra fatiado', amount: '4 lonchas', category: 'Protein', price: 0.60 },
      { item: 'Queso crema ligero', amount: '20g', category: 'Other', price: 0.20 },
    ],
    instructions: ['1. Extiende las lonchas de pavo.', '2. Unta el queso crema.', '3. Enrolla y come.'],
  },
  {
    id: 'a3',
    name: 'Hummus con Zanahorias',
    category: 'Almuerzo',
    time: '5 min',
    ingredients: [
      { item: 'Hummus Lidl', amount: '100g', category: 'Other', price: 0.80 },
      { item: 'Zanahorias', amount: '2', category: 'Veggie', price: 0.30 },
    ],
    instructions: ['1. Corta las zanahorias en bastones.', '2. Dipea en el hummus.'],
  },
  {
    id: 'a4',
    name: 'Queso Cottage y Manzana',
    category: 'Almuerzo',
    time: '5 min',
    ingredients: [
      { item: 'Queso Cottage Milbona', amount: '200g', category: 'Protein', price: 1.50 },
      { item: 'Manzana', amount: '1', category: 'Other', price: 0.30 },
    ],
    instructions: ['1. Corta la manzana.', '2. Mezcla con el queso cottage.'],
  },
  {
    id: 'a5',
    name: 'Barrita Proteica Lidl',
    category: 'Almuerzo',
    time: '1 min',
    ingredients: [
      { item: 'Barrita Sportyfeel', amount: '1', category: 'Protein', price: 1.15 },
    ],
    instructions: ['1. Abrir y disfrutar.'],
  },
  {
    id: 'a6',
    name: 'Huevo Cocido Express',
    category: 'Almuerzo',
    time: '10 min',
    ingredients: [
      { item: 'Huevo', amount: '2', category: 'Protein', price: 0.40 },
    ],
    instructions: ['1. Cuece los huevos 9 minutos.', '2. Pela y añade sal y pimentón.'],
  },

  // --- COMIDA ---
  {
    id: 'c1',
    name: 'Fajitas de Pollo Express',
    category: 'Comida',
    time: '12 min',
    ingredients: [
      { item: 'Tiras de Pollo Lidl', amount: '150g', category: 'Protein', price: 2.20 },
      { item: 'Tortillas Integrales', amount: '2', category: 'Carb', price: 0.50 },
      { item: 'Pimientos y Cebolla (bolsa)', amount: '100g', category: 'Veggie', price: 0.40 },
    ],
    instructions: ['1. Saltea las verduras 5 min.', '2. Añade el pollo y calienta.', '3. Rellena las tortillas.'],
  },
  {
    id: 'c2',
    name: 'Pasta Integral con Cottage',
    category: 'Comida',
    time: '12 min',
    ingredients: [
      { item: 'Pasta Integral Combino', amount: '80g', category: 'Carb', price: 0.20 },
      { item: 'Queso Cottage', amount: '100g', category: 'Protein', price: 0.75 },
      { item: 'Tomates Cherry', amount: '5', category: 'Veggie', price: 0.30 },
    ],
    instructions: ['1. Hierve la pasta 9 min.', '2. Escurre y mezcla con el queso y los tomates picados.'],
  },
  {
    id: 'c3',
    name: 'Arroz al Wok con Ternera',
    category: 'Comida',
    time: '10 min',
    ingredients: [
      { item: 'Arroz microondas', amount: '1 vasito', category: 'Carb', price: 0.60 },
      { item: 'Carne picada de vacuno magra', amount: '150g', category: 'Protein', price: 1.80 },
      { item: 'Verduras Wok Freshona', amount: '150g', category: 'Veggie', price: 0.50 },
    ],
    instructions: ['1. Saltea la carne con las verduras.', '2. Calienta el arroz en el micro.', '3. Mezcla todo con soja.'],
  },
  {
    id: 'c4',
    name: 'Tofu Salteado con Brócoli',
    category: 'Comida',
    time: '15 min',
    ingredients: [
      { item: 'Tofu My Best Veggie', amount: '200g', category: 'Protein', price: 2.00 },
      { item: 'Brócoli (Micro)', amount: '200g', category: 'Veggie', price: 1.00 },
    ],
    instructions: ['1. Corta el tofu y saltéalo.', '2. Calienta brócoli al vapor.', '3. Sirve con salsa de soja.'],
  },
  {
    id: 'c5',
    name: 'Ensalada de Quinoa y Pollo',
    category: 'Comida',
    time: '8 min',
    ingredients: [
      { item: 'Quinoa microondas', amount: '1', category: 'Carb', price: 1.20 },
      { item: 'Pechuga de Pollo asada', amount: '100g', category: 'Protein', price: 1.50 },
      { item: 'Espinacas', amount: 'puñado', category: 'Veggie', price: 0.20 },
    ],
    instructions: ['1. Mezcla quinoa templada con el pollo frío o caliente.', '2. Añade las espinacas y un chorro de limón.'],
  },
  {
    id: 'c6',
    name: 'Lentejas Fit Express',
    category: 'Comida',
    time: '10 min',
    ingredients: [
      { item: 'Lentejas cocidas (bote)', amount: '250g', category: 'Carb', price: 0.50 },
      { item: 'Pavo en dados', amount: '50g', category: 'Protein', price: 0.80 },
      { item: 'Espinacas', amount: 'puñado', category: 'Veggie', price: 0.20 },
    ],
    instructions: ['1. Lava las lentejas.', '2. Saltéalas con el pavo y las espinacas.', '3. Sazona con comino.'],
  },

  // --- MERIENDA ---
  {
    id: 'm1',
    name: 'Batido Proteico Vainilla',
    category: 'Merienda',
    time: '2 min',
    ingredients: [
      { item: 'Proteína Sportyfeel', amount: '1 scoop', category: 'Protein', price: 0.80 },
      { item: 'Agua o Leche', amount: '250ml', category: 'Other', price: 0.10 },
    ],
    instructions: ['1. Agitar en el shaker.', '2. Tomar al momento.'],
  },
  {
    id: 'm2',
    name: 'Edamame con Sal',
    category: 'Merienda',
    time: '5 min',
    ingredients: [
      { item: 'Edamame congelado Lidl', amount: '150g', category: 'Protein', price: 0.90 },
    ],
    instructions: ['1. Hierve o micro 5 min.', '2. Añade sal gorda.'],
  },
  {
    id: 'm3',
    name: 'Tortitas de Arroz y Cacahuete',
    category: 'Merienda',
    time: '2 min',
    ingredients: [
      { item: 'Tortitas de arroz', amount: '2', category: 'Carb', price: 0.20 },
      { item: 'Crema de cacahuete', amount: '20g', category: 'Other', price: 0.40 },
    ],
    instructions: ['1. Untar las tortitas.', '2. Comer.'],
  },
  {
    id: 'm4',
    name: 'Kefir con Semillas',
    category: 'Merienda',
    time: '2 min',
    ingredients: [
      { item: 'Kefir Milbona', amount: '200ml', category: 'Protein', price: 0.60 },
      { item: 'Semillas de calabaza Alesto', amount: '15g', category: 'Other', price: 0.30 },
    ],
    instructions: ['1. Echa el kefir en un vaso.', '2. Añade las semillas.'],
  },
  {
    id: 'm5',
    name: 'Mix de Frutos Secos Naturales',
    category: 'Merienda',
    time: '1 min',
    ingredients: [
      { item: 'Nueces/Almendras Alesto', amount: '30g', category: 'Other', price: 0.80 },
    ],
    instructions: ['1. Tomar un puñado.'],
  },
  {
    id: 'm6',
    name: 'Gelatina 0% y Arándanos',
    category: 'Merienda',
    time: '1 min',
    ingredients: [
      { item: 'Gelatina 0% Milbona', amount: '1', category: 'Other', price: 0.35 },
      { item: 'Arándanos', amount: 'unos pocos', category: 'Veggie', price: 0.20 },
    ],
    instructions: ['1. Añade los frutos a la gelatina.'],
  },

  // --- CENA ---
  {
    id: 'e1',
    name: 'Revuelto de Pavo y Espárragos',
    category: 'Cena',
    time: '10 min',
    ingredients: [
      { item: 'Huevos', amount: '2', category: 'Protein', price: 0.40 },
      { item: 'Espárragos trigueros', amount: 'media malla', category: 'Veggie', price: 1.00 },
      { item: 'Dados de Pavo', amount: '50g', category: 'Protein', price: 0.80 },
    ],
    instructions: ['1. Saltea espárragos y pavo.', '2. Añade los huevos batidos y revuelve.'],
  },
  {
    id: 'e2',
    name: 'Cuscús Express con Pollo',
    category: 'Cena',
    time: '8 min',
    ingredients: [
      { item: 'Cuscús', amount: '60g', category: 'Carb', price: 0.15 },
      { item: 'Pollo deshilachado', amount: '100g', category: 'Protein', price: 1.50 },
      { item: 'Calabacín', amount: '0.5', category: 'Veggie', price: 0.30 },
    ],
    instructions: ['1. Hidrata el cuscús con agua hirviendo.', '2. Saltea el calabacín con el pollo.', '3. Mezcla todo.'],
  },
  {
    id: 'e3',
    name: 'Ensalada César Fit',
    category: 'Cena',
    time: '10 min',
    ingredients: [
      { item: 'Lechuga Iceberg', amount: 'bolsa', category: 'Veggie', price: 1.00 },
      { item: 'Pollo a la plancha', amount: '120g', category: 'Protein', price: 1.80 },
      { item: 'Yogur Griego (Salsa)', amount: '50g', category: 'Other', price: 0.20 },
    ],
    instructions: ['1. Corta el pollo en tiras.', '2. Mezcla con la lechuga.', '3. Usa el yogur sazonado como salsa.'],
  },
  {
    id: 'e4',
    name: 'Tofu con Champiñones',
    category: 'Cena',
    time: '12 min',
    ingredients: [
      { item: 'Tofu', amount: '200g', category: 'Protein', price: 2.00 },
      { item: 'Champiñones laminados', amount: '100g', category: 'Veggie', price: 0.80 },
    ],
    instructions: ['1. Saltea el tofu con los champiñones.', '2. Añade ajo en polvo y soja.'],
  },
  {
    id: 'e5',
    name: 'Burguer Pollo y Ensalada',
    category: 'Cena',
    time: '10 min',
    ingredients: [
      { item: 'Hamburguesa de pollo (90%+)', amount: '1', category: 'Protein', price: 1.20 },
      { item: 'Ensalada mixta', amount: 'bolsa', category: 'Veggie', price: 1.00 },
    ],
    instructions: ['1. Cocina la hamburguesa.', '2. Acompaña con la ensalada aliñada.'],
  },
  {
    id: 'e6',
    name: 'Pavo al Papillote Micro',
    category: 'Cena',
    time: '8 min',
    ingredients: [
      { item: 'Pechuga de pavo fresca', amount: '150g', category: 'Protein', price: 2.50 },
      { item: 'Calabacín en rodajas', amount: '0.5', category: 'Veggie', price: 0.30 },
    ],
    instructions: ['1. Pon el pavo y calabacín en estuche de vapor o film.', '2. Micro 4-5 min.', '3. Sazona y listo.'],
  },
];
