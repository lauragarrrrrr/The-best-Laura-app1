import {
  siAirbnb, siApple, siApplemusic, siAppletv, siAudible, siCarrefour, siClaude, siCrunchyroll,
  siDazn, siDeezer, siDeliveroo, siDiscord, siDropbox, siDuolingo, siEpicgames, siFigma, siFitbit,
  siGithub, siGlovo, siGoogledrive, siHbomax, siIberia, siIcloud, siIkea, siJusteat, siLidl,
  siMovistar, siNetflix, siNotion, siOrange, siPatreon, siPaypal, siPlaystation, siRakuten,
  siRevolut, siRyanair, siSoundcloud, siSpotify, siSteam, siStrava, siTidal, siTwitch, siUber,
  siVodafone, siYoutube, siYoutubemusic, siZara,
} from 'simple-icons';

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/** Icono de un gasto: logo de una app/marca o emoji con color de fondo. */
export type ExpenseIcon =
  | { kind: 'brand'; slug: string }
  | { kind: 'emoji'; emoji: string; color: string };

export type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  /** Gasto necesario (vivienda, comida…) frente a capricho, para la regla 50/30/20 */
  essential?: boolean;
};

/** Destino del ahorro (Inversión, Fondo de emergencia…). */
export type SavingsBucket = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  /** Cuenta como inversión (fondos, bolsa, planes…) */
  invest: boolean;
};

/** Dinero apartado: puntual o transferencia automática mensual. */
export type SavingEntry = {
  id: string;
  name: string;
  amount: number;
  bucket: string;
  date: string;
  recurring: boolean;
};

export type Expense = {
  id: string;
  name: string;
  amount: number;
  /** id de la categoría */
  category: string;
  /** Fecha del gasto (YYYY-MM-DD). Si es recurrente, es la fecha de inicio y el día de cobro. */
  date: string;
  recurring: boolean;
  /** Si no se indica, se usa el logo detectado por el nombre o el emoji de la categoría. */
  icon?: ExpenseIcon;
};

export type MoneyState = {
  expenses: Expense[];
  /** Pagos marcados como hechos: clave `${expenseId}:${YYYY-MM}` */
  paid: Record<string, boolean>;
  categories: Category[];
  buckets: SavingsBucket[];
  savings: SavingEntry[];
  /** Ingresos netos por mes (`YYYY-MM`). Un mes sin valor usa el último anterior. */
  income: Record<string, number>;
  /** Pasos de la ruta de Aprende marcados a mano */
  checks: Record<string, boolean>;
};

/* ------------------------------------------------------------------ */
/* Categorías y colores                                                */
/* ------------------------------------------------------------------ */

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'hogar', label: 'Hogar', emoji: '🏠', color: '#5EC8E5', essential: true },
  { id: 'alimentacion', label: 'Alimentación', emoji: '🍴', color: '#F5A300', essential: true },
  { id: 'ocio', label: 'Ocio y viajes', emoji: '🎭', color: '#F2D24B' },
  { id: 'suscripciones', label: 'Suscripciones', emoji: '📺', color: '#E5484D' },
  { id: 'transporte', label: 'Transporte', emoji: '🚗', color: '#8E7CF0', essential: true },
  { id: 'salud', label: 'Salud y deporte', emoji: '💪', color: '#4CC38A', essential: true },
  { id: 'compras', label: 'Compras', emoji: '🛍️', color: '#E26AC1' },
  { id: 'otros', label: 'Otros', emoji: '📦', color: '#9A958E' },
];

export const FALLBACK_CATEGORY_ID = 'otros';

export const DEFAULT_BUCKETS: SavingsBucket[] = [
  { id: 'inversion', label: 'Inversión', emoji: '📈', color: '#F5A300', invest: true },
  { id: 'emergencia', label: 'Fondo de emergencia', emoji: '🛟', color: '#5EC8E5', invest: false },
  { id: 'objetivos', label: 'Objetivos', emoji: '✈️', color: '#E26AC1', invest: false },
  { id: 'colchon', label: 'Cuenta de ahorro', emoji: '🏦', color: '#4CC38A', invest: false },
];
export const EMERGENCY_BUCKET_ID = 'emergencia';
export const FALLBACK_BUCKET_ID = 'colchon';

/** Paleta para emojis y categorías personalizadas. */
export const SWATCHES = [
  '#F5A300', '#E5484D', '#E26AC1', '#8E7CF0', '#3E7BFA', '#5EC8E5',
  '#4CC38A', '#F2D24B', '#9A958E', '#F2EEE8', '#2B2B2B', '#B4643C',
];

export const EMOJI_CHOICES = [
  '🏠', '🔑', '💡', '💧', '🔥', '📶', '📱', '💻',
  '🛒', '🍎', '🥖', '☕', '🍕', '🍷', '🥞', '🍿',
  '🚗', '⛽', '🚇', '🚲', '✈️', '🏖️', '🎟️', '🎤',
  '🏋️', '🧘', '💊', '🩺', '💆', '💇', '🐶', '👶',
  '🛍️', '👗', '👟', '💄', '🎁', '📚', '🎓', '🎮',
  '💳', '🏦', '📈', '🧾', '🛡️', '🔧', '🧹', '📦',
];

/* ------------------------------------------------------------------ */
/* Logos de apps (Simple Icons, CC0)                                   */
/* ------------------------------------------------------------------ */

export type Brand = { slug: string; title: string; hex: string; path: string; aliases: string[] };

const brand = (
  icon: { slug: string; title: string; hex: string; path: string },
  aliases: string[] = [],
): Brand => ({ slug: icon.slug, title: icon.title, hex: `#${icon.hex}`, path: icon.path, aliases: [icon.title, ...aliases] });

export const BRANDS: Brand[] = [
  brand(siNetflix),
  brand(siSpotify),
  brand(siHbomax, ['HBO', 'Max']),
  brand(siYoutube, ['YouTube Premium']),
  brand(siYoutubemusic),
  brand(siApplemusic),
  brand(siAppletv, ['Apple TV+']),
  brand(siIcloud),
  brand(siApple, ['Apple One']),
  brand(siDazn),
  brand(siMovistar, ['Movistar+']),
  brand(siVodafone),
  brand(siOrange),
  brand(siTwitch),
  brand(siPlaystation, ['PS Plus', 'PlayStation Plus']),
  brand(siSteam),
  brand(siEpicgames),
  brand(siCrunchyroll),
  brand(siRakuten, ['Rakuten TV']),
  brand(siTidal),
  brand(siDeezer),
  brand(siSoundcloud),
  brand(siAudible),
  brand(siPatreon),
  brand(siGoogledrive, ['Google One']),
  brand(siDropbox),
  brand(siNotion),
  brand(siFigma),
  brand(siGithub),
  brand(siClaude),
  brand(siDuolingo),
  brand(siStrava),
  brand(siFitbit),
  brand(siDiscord, ['Discord Nitro']),
  brand(siUber, ['Uber Eats']),
  brand(siGlovo),
  brand(siDeliveroo),
  brand(siJusteat),
  brand(siRyanair),
  brand(siIberia),
  brand(siAirbnb),
  brand(siZara),
  brand(siLidl),
  brand(siCarrefour),
  brand(siIkea),
  brand(siPaypal),
  brand(siRevolut),
];

export const BRANDS_BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

/** Busca la marca que mejor encaja con el nombre de un gasto ("Netflix", "Vuelo Ryanair"...). */
export function detectBrand(name: string): Brand | null {
  const n = normalize(name);
  if (!n) return null;
  let best: { b: Brand; len: number } | null = null;
  for (const b of BRANDS) {
    for (const alias of b.aliases) {
      const a = normalize(alias);
      // Los alias cortos ("Max", "HBO") solo cuentan si el nombre es exactamente eso
      const hit = a.length >= 4 ? n.includes(a) : n === a;
      if (hit && (!best || a.length > best.len)) best = { b, len: a.length };
    }
  }
  return best?.b ?? null;
}

/** Color de texto legible sobre un fondo dado. */
export function inkOn(hex: string) {
  const v = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#111111' : '#FFFFFF';
}

/* ------------------------------------------------------------------ */
/* Fechas y formato                                                    */
/* ------------------------------------------------------------------ */

export const pad = (n: number) => String(n).padStart(2, '0');
export const monthKey = (y: number, m: number) => `${y}-${pad(m + 1)}`;
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
export const uid = () => Math.random().toString(36).slice(2, 10);

// `useGrouping: 'always'` para que 1052 se muestre como "1.052" (es-ES no agrupa 4 cifras por defecto)
const eurFormat = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  useGrouping: 'always',
} as Intl.NumberFormatOptions);
export const eur = (n: number) => eurFormat.format(n);
const eurRoundFormat = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  useGrouping: 'always',
} as Intl.NumberFormatOptions);
/** Importe sin céntimos, para cifras grandes y estimaciones. */
export const eurRound = (n: number) => eurRoundFormat.format(n);

export const monthShort = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
export const monthLong = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString('es-ES', { month: 'long' });

/** Ingresos de un mes: el valor de ese mes o el último anterior. */
export function incomeFor(income: Record<string, number>, y: number, m: number): number | null {
  const key = monthKey(y, m);
  let best: string | null = null;
  for (const k of Object.keys(income)) if (k <= key && (!best || k > best)) best = k;
  return best ? income[best] : null;
}

/** Ahorro acumulado de cada destino hasta el final del mes (y, m), incluido. */
export function savingsTotals(savings: SavingEntry[], y: number, m: number) {
  const target = y * 12 + m;
  const totals = new Map<string, number>();
  for (const s of savings) {
    const st = parseDate(s.date);
    const start = st.y * 12 + st.m;
    if (start > target) continue;
    const times = s.recurring ? target - start + 1 : 1;
    totals.set(s.bucket, (totals.get(s.bucket) ?? 0) + s.amount * times);
  }
  return totals;
}

export function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d };
}

/** Día del mes (y, m) en que cae el gasto, o null si no aplica ese mes. */
export function dayInMonth(e: Pick<Expense, 'date' | 'recurring'>, y: number, m: number): number | null {
  const start = parseDate(e.date);
  if (!e.recurring) return start.y === y && start.m === m ? start.d : null;
  if (y * 12 + m < start.y * 12 + start.m) return null;
  return Math.min(start.d, daysInMonth(y, m));
}

export function expensesForMonth<T extends Pick<Expense, 'date' | 'recurring'>>(expenses: T[], y: number, m: number) {
  return expenses
    .map((e) => ({ e, day: dayInMonth(e, y, m) }))
    .filter((x): x is { e: T; day: number } => x.day !== null)
    .sort((a, b) => a.day - b.day);
}

/* ------------------------------------------------------------------ */
/* Datos de ejemplo y almacenamiento                                   */
/* ------------------------------------------------------------------ */

export const STORAGE_KEY = 'tbl_money_v3';
const LEGACY_KEY = 'tbl_money_v2';

const emoji = (e: string, color: string): ExpenseIcon => ({ kind: 'emoji', emoji: e, color });

/** Datos de ejemplo realistas: 3 meses de historial relativos a hoy. */
export function seedData(): MoneyState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const daysAgo = (n: number) => iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - n));
  const startOfRecurring = (day: number) => iso(new Date(today.getFullYear(), today.getMonth() - 3, day));

  const recurring: [string, number, string, number, ExpenseIcon?][] = [
    ['Alquiler', 650, 'hogar', 1, emoji('🔑', '#5EC8E5')],
    ['Luz', 45.3, 'hogar', 3, emoji('💡', '#F2D24B')],
    ['Netflix', 13.99, 'suscripciones', 5],
    ['DIGI', 20, 'hogar', 7, emoji('📶', '#3E7BFA')],
    ['Spotify', 11.99, 'suscripciones', 10],
    ['HBO Max', 9.99, 'suscripciones', 11],
    ['Gimnasio', 39.9, 'salud', 12, emoji('🏋️', '#4CC38A')],
    ['iCloud', 2.99, 'suscripciones', 19],
    ['Seguro del coche', 32.5, 'transporte', 22, emoji('🛡️', '#8E7CF0')],
  ];

  // [concepto, importe, categoría, hace cuántos días, icono]
  const oneOff: [string, number, string, number, ExpenseIcon?][] = [
    ['Mercadona', 64.2, 'alimentacion', 1, emoji('🛒', '#4CC38A')],
    ['Brunch', 24.5, 'ocio', 2, emoji('🥞', '#F5A300')],
    ['Gasolina', 55, 'transporte', 4, emoji('⛽', '#E5484D')],
    ['Lidl', 41.75, 'alimentacion', 6],
    ['Zara', 49.95, 'compras', 8],
    ['Cine', 17, 'ocio', 10, emoji('🍿', '#E5484D')],
    ['Glovo', 22.4, 'alimentacion', 11],
    ['Mercadona', 78.4, 'alimentacion', 13, emoji('🛒', '#4CC38A')],
    ['Farmacia', 12.6, 'salud', 15, emoji('💊', '#4CC38A')],
    ['Cena con amigas', 38, 'ocio', 18, emoji('🍷', '#B4643C')],
    ['Uber', 14.8, 'transporte', 19],
    ['Frutería', 18.3, 'alimentacion', 20, emoji('🍎', '#E5484D')],
    ['Mercadona', 82.1, 'alimentacion', 24, emoji('🛒', '#4CC38A')],
    ['Gasolina', 52, 'transporte', 27, emoji('⛽', '#E5484D')],
    ['Vuelo Ryanair', 96, 'ocio', 31],
    ['Airbnb Valencia', 140, 'ocio', 31],
    ['Mercadona', 71.35, 'alimentacion', 34, emoji('🛒', '#4CC38A')],
    ['IKEA', 34.99, 'hogar', 37],
    ['Carrefour', 39.9, 'alimentacion', 41],
    ['Concierto', 45, 'ocio', 44, emoji('🎤', '#E26AC1')],
    ['Mercadona', 88.6, 'alimentacion', 48, emoji('🛒', '#4CC38A')],
    ['Gasolina', 58, 'transporte', 52, emoji('⛽', '#E5484D')],
    ['Mercadona', 69.8, 'alimentacion', 55, emoji('🛒', '#4CC38A')],
    ['Regalo cumpleaños', 40, 'compras', 58, emoji('🎁', '#E26AC1')],
    ['Cena', 32, 'ocio', 62, emoji('🍷', '#B4643C')],
    ['Mercadona', 75.2, 'alimentacion', 66, emoji('🛒', '#4CC38A')],
    ['Fisioterapeuta', 45, 'salud', 70, emoji('💆', '#4CC38A')],
  ];

  const expenses: Expense[] = [
    ...recurring.map(([name, amount, category, day, icon]) => ({
      id: uid(), name, amount, category, date: startOfRecurring(day), recurring: true, ...(icon ? { icon } : {}),
    })),
    ...oneOff.map(([name, amount, category, ago, icon]) => ({
      id: uid(), name, amount, category, date: daysAgo(ago), recurring: false, ...(icon ? { icon } : {}),
    })),
  ];

  // Los recibos ya pasados aparecen como pagados; los que están por venir, pendientes.
  const paid: Record<string, boolean> = {};
  for (const e of expenses.filter((x) => x.recurring)) {
    for (let back = 0; back <= 3; back++) {
      const ref = new Date(today.getFullYear(), today.getMonth() - back, 1);
      const day = dayInMonth(e, ref.getFullYear(), ref.getMonth());
      if (day === null) continue;
      if (new Date(ref.getFullYear(), ref.getMonth(), day) <= today) {
        paid[`${e.id}:${monthKey(ref.getFullYear(), ref.getMonth())}`] = true;
      }
    }
  }
  const savings: SavingEntry[] = [
    { id: uid(), name: 'Colchón inicial', amount: 1800, bucket: 'emergencia', date: daysAgo(200), recurring: false },
    { id: uid(), name: 'Fondo indexado mundial', amount: 150, bucket: 'inversion', date: startOfRecurring(2), recurring: true },
    { id: uid(), name: 'Hucha emergencias', amount: 100, bucket: 'emergencia', date: startOfRecurring(2), recurring: true },
    { id: uid(), name: 'Viaje a Japón', amount: 60, bucket: 'objetivos', date: startOfRecurring(2), recurring: true },
    { id: uid(), name: 'Bonus extra', amount: 120, bucket: 'inversion', date: daysAgo(40), recurring: false },
    { id: uid(), name: 'Redondeos', amount: 25.4, bucket: 'colchon', date: daysAgo(20), recurring: false },
  ];
  const incomeStart = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const income = { [monthKey(incomeStart.getFullYear(), incomeStart.getMonth())]: 1950 };

  return { expenses, paid, categories: DEFAULT_CATEGORIES, buckets: DEFAULT_BUCKETS, savings, income, checks: {} };
}

/** Solo la parte de ahorro de los datos de ejemplo. */
export function seedSavings(): Pick<MoneyState, 'buckets' | 'savings' | 'income'> {
  const { buckets, savings, income } = seedData();
  return { buckets, savings, income };
}

const ESSENTIAL_IDS = new Set(DEFAULT_CATEGORIES.filter((c) => c.essential).map((c) => c.id));

/** Completa datos guardados por versiones anteriores. */
function normalizeState(raw: Partial<MoneyState>): MoneyState {
  return {
    expenses: raw.expenses ?? [],
    paid: raw.paid ?? {},
    categories: (raw.categories ?? DEFAULT_CATEGORIES).map((c) =>
      c.essential === undefined ? { ...c, essential: ESSENTIAL_IDS.has(c.id) } : c,
    ),
    buckets: raw.buckets ?? DEFAULT_BUCKETS,
    savings: raw.savings ?? [],
    income: raw.income ?? {},
    checks: raw.checks ?? {},
  };
}

export function loadState(): MoneyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw) as Partial<MoneyState>);
    // Datos de la versión anterior: se conservan y se añaden las categorías
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      return normalizeState(JSON.parse(legacy) as Partial<MoneyState>);
    }
  } catch {
    /* almacenamiento no disponible o datos corruptos */
  }
  return seedData();
}

export function saveState(state: MoneyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible */
  }
}
