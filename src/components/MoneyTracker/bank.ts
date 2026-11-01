import { BRANDS, dayInMonth, detectBrand, monthKey, normalize, pad, parseDate, type Brand, type Expense, type MoneyState } from './data';

/* ------------------------------------------------------------------ */
/* Lectura de archivos (CSV y Excel)                                   */
/* ------------------------------------------------------------------ */

export type Cell = string | number | Date | null;

/** Lee un CSV con separador ; , o tabulador, respetando comillas. */
export function parseCsv(text: string): Cell[][] {
  const sample = text.split(/\r?\n/).slice(0, 15).join('\n');
  const counts = [';', ',', '\t'].map((d) => [d, sample.split(d).length] as const);
  const delim = counts.sort((a, b) => b[1] - a[1])[0][0];
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) {
      row.push(field.trim());
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x !== ''));
}

type XlsxLib = {
  read: (data: ArrayBuffer, opts: Record<string, unknown>) => { SheetNames: string[]; Sheets: Record<string, unknown> };
  utils: { sheet_to_json: (ws: unknown, opts: Record<string, unknown>) => Cell[][] };
};

let xlsxPromise: Promise<XlsxLib> | null = null;
/** Carga la librería de Excel (SheetJS) solo cuando hace falta. */
function loadXlsx(): Promise<XlsxLib> {
  const w = window as unknown as { XLSX?: XlsxLib };
  if (w.XLSX) return Promise.resolve(w.XLSX);
  if (!xlsxPromise) {
    xlsxPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = () => (w.XLSX ? resolve(w.XLSX) : reject(new Error('xlsx')));
      s.onerror = () => {
        xlsxPromise = null;
        reject(new Error('xlsx'));
      };
      document.head.appendChild(s);
    });
  }
  return xlsxPromise;
}

export async function readBankFile(file: File): Promise<Cell[][]> {
  const name = file.name.toLowerCase();
  if (/\.(xlsx|xls|ods)$/.test(name)) {
    const XLSX = await loadXlsx();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' }).filter((r) => r.some((x) => x !== '' && x !== null));
  }
  const buf = await file.arrayBuffer();
  let text = new TextDecoder('utf-8').decode(buf);
  // muchos bancos exportan en Windows-1252: si hay caracteres rotos, se relee
  if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
  return parseCsv(text.replace(/^﻿/, ''));
}

/* ------------------------------------------------------------------ */
/* Columnas, importes y fechas                                         */
/* ------------------------------------------------------------------ */

export type Mapping = { header: number; date: number; concept: number; amount: number; debit: number; credit: number };

export function parseAmount(v: Cell): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (v === null || v instanceof Date) return null;
  let s = String(v).replace(/[€\s ]/g, '').replace(/EUR/i, '');
  if (!s) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  if (s.endsWith('-')) {
    neg = true;
    s = s.slice(0, -1);
  }
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
  else if (lastDot > lastComma && lastComma !== -1) s = s.replace(/,/g, '');
  else if (lastComma === -1 && ((s.match(/\./g) ?? []).length > 1 || /^[-+]?\d{1,3}\.\d{3}$/.test(s))) s = s.replace(/\./g, ''); // "1.950" = mil novecientos cincuenta
  if (!/^[-+]?\d+(\.\d+)?$/.test(s)) return null;
  const n = parseFloat(s);
  return neg ? -Math.abs(n) : n;
}

export function parseBankDate(v: Cell): string | null {
  const iso = (y: number, m: number, d: number) => (y > 1990 && m >= 1 && m <= 12 && d >= 1 && d <= 31 ? `${y}-${pad(m)}-${pad(d)}` : null);
  if (v instanceof Date && !isNaN(v.getTime())) return iso(v.getFullYear(), v.getMonth() + 1, v.getDate());
  if (typeof v === 'number' && v > 30000 && v < 60000) {
    const d = new Date(Math.round((v - 25569) * 86400000));
    return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) return iso(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
  m = s.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})/);
  if (m) return iso(+m[1], +m[2], +m[3]);
  return null;
}

const has = (cell: Cell, words: string[]) => {
  const n = normalize(String(cell ?? ''));
  return words.some((w) => n.includes(w));
};

/** Encuentra la fila de cabecera y las columnas de fecha, concepto e importe. */
export function detectMapping(rows: Cell[][]): Mapping | null {
  for (let h = 0; h < Math.min(rows.length, 40); h++) {
    const r = rows[h];
    // "Fecha", "F. Operación", "F. Valor", "Fecha contable"…: se prefiere la de operación
    const dateCols = r.map((c, i) => (has(c, ['fecha', 'foperacion', 'fvalor', 'fcontable', 'date']) ? i : -1)).filter((i) => i !== -1);
    if (!dateCols.length) continue;
    const date = dateCols.find((i) => has(r[i], ['operacion', 'contable'])) ?? dateCols[0];
    const amount = r.findIndex((c) => has(c, ['importe', 'cantidad', 'monto']));
    const debit = r.findIndex((c) => has(c, ['cargo', 'debe', 'gasto', 'salida']));
    const credit = r.findIndex((c) => has(c, ['abono', 'haber', 'ingreso', 'entrada']));
    if (amount === -1 && debit === -1 && credit === -1) continue;
    let concept = r.findIndex((c, i) => i !== date && has(c, ['concepto', 'descripcion', 'movimiento', 'detalle', 'comercio', 'referencia']));
    if (concept === -1) {
      // la columna con textos más largos
      let best = -1;
      let bestLen = 0;
      r.forEach((_, i) => {
        if ([date, amount, debit, credit].includes(i)) return;
        const len = rows.slice(h + 1, h + 15).reduce((a, row) => a + String(row[i] ?? '').length, 0);
        if (len > bestLen) {
          bestLen = len;
          best = i;
        }
      });
      concept = best;
    }
    if (concept === -1) continue;
    return { header: h, date, concept, amount, debit, credit };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Comercios y categorías                                              */
/* ------------------------------------------------------------------ */

const NOISE = new Set([
  'COMPRA', 'COMPRAS', 'TARJ', 'TARJETA', 'TJ', 'PAGO', 'PAGOS', 'CON', 'EN', 'DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'RECIBO', 'ADEUDO',
  'DOMICILIACION', 'DOMICILIADO', 'CARGO', 'MOVIL', 'CONTACTLESS', 'OPERACION', 'OP', 'COMERCIO', 'TPV', 'SL',
  'SA', 'SLU', 'SAU', 'ESPANA', 'ES', 'EUR', 'ONLINE', 'WWW', 'COM', 'INTERNET', 'TRANSF', 'TRANSFERENCIA', 'A', 'FAVOR', 'NUM', 'REF',
]);

const wordsOf = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter(Boolean);
const realWords = (t: string) => wordsOf(t).filter((w) => w.length > 1 && !/\d/.test(w) && !NOISE.has(w.toUpperCase()));

/**
 * Marca del comercio, solo si es el primer nombre real del concepto:
 * "RECIBO NETFLIX.COM" → Netflix, pero "RECIBO NATURGY IBERIA GAS" no es la aerolínea Iberia.
 */
export function brandInConcept(concept: string): Brand | null {
  const real = realWords(concept);
  if (!real.length) return null;
  let best: { b: Brand; len: number } | null = null;
  for (const b of BRANDS) {
    for (const alias of b.aliases) {
      const aw = realWords(alias);
      if (!aw.length) continue;
      const joined = aw.join('');
      if (real.slice(0, aw.length).join('') === joined && (!best || joined.length > best.len)) best = { b, len: joined.length };
    }
  }
  return best?.b ?? null;
}

/** Palabras genéricas: el comercio es la palabra siguiente ("CAFETERIA LA PLAZA" → "Cafeteria Plaza"). */
const GENERIC = new Set(['CAFETERIA', 'RESTAURANTE', 'FARMACIA', 'BAR', 'BIZUM', 'SUPERMERCADO', 'SUPERMERCADOS', 'GASOLINERA', 'ESTACION', 'PARKING', 'HOTEL', 'CLINICA', 'TIENDA', 'PANADERIA', 'FRUTERIA', 'CARNICERIA', 'PELUQUERIA', 'TALLER', 'LIBRERIA', 'GIMNASIO']);

/** "COMPRA TARJ. 5402XXXX1234 MERCADONA VALENCIA" → { key: "MERCADONA", name: "Mercadona" } */
export function merchantOf(rawConcept: string) {
  // "Apple Pay" / "Google Pay" es el medio de pago, no el comercio
  const concept = rawConcept.replace(/\b(apple|google|samsung)\s*pay\b/gi, ' ');
  const brand = brandInConcept(concept);
  const tokens = concept
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !NOISE.has(t) && !/\d/.test(t) && t.length > 1);
  // dos palabras si la primera es genérica (CAFETERIA…) o corta (BASIC FIT, CORTE INGLES); si no, una (MERCADONA VALENCIA → MERCADONA)
  const take = tokens[0] && (GENERIC.has(tokens[0]) || tokens[0].length <= 5) ? 2 : 1;
  const key = tokens.slice(0, take).join(' ') || concept.toUpperCase().slice(0, 20);
  const title = (t: string) => t.charAt(0) + t.slice(1).toLowerCase();
  const name = brand ? brand.title : tokens.slice(0, take).map(title).join(' ') || concept.slice(0, 24);
  return { key: brand ? brand.slug.toUpperCase() : key, name };
}

/** Palabras clave de comercios habituales en España → categoría. */
const KEYWORDS: [string, string[]][] = [
  ['alimentacion', ['mercadona', 'lidl', 'carrefour', 'alcampo', 'aldi', 'eroski', 'consum', 'hipercor', 'supercor', 'bonarea', 'ahorramas', 'caprabo', 'condis', 'froiz', 'gadis', 'mas y mas', 'supermercado', 'super ', 'fruteria', 'carniceria', 'panaderia', 'dia ', 'glovo', 'just eat', 'justeat', 'deliveroo', 'uber eats']],
  ['suscripciones', ['netflix', 'spotify', 'hbo', 'max.com', 'disney', 'prime video', 'amazon prime', 'apple.com', 'icloud', 'youtube', 'dazn', 'movistar plus', 'filmin', 'audible', 'playstation', 'xbox', 'nintendo', 'chatgpt', 'openai', 'claude', 'google one', 'dropbox', 'notion', 'patreon', 'twitch', 'crunchyroll']],
  ['hogar', ['alquiler', 'comunidad', 'iberdrola', 'endesa', 'naturgy', 'repsol luz', 'holaluz', 'totalenergies', 'aguas', 'canal de isabel', 'agua', 'digi', 'movistar', 'vodafone', 'orange', 'yoigo', 'masmovil', 'pepephone', 'jazztel', 'lowi', 'o2 ', 'ikea', 'leroy', 'bricomart', 'seguro hogar', 'hipoteca']],
  ['transporte', ['repsol', 'cepsa', 'galp', 'bp ', 'shell', 'petronor', 'gasolinera', 'estacion de servicio', 'renfe', 'metro', 'emt ', 'tmb ', 'cabify', 'uber', 'bolt', 'freenow', 'taxi', 'parking', 'aparcamiento', 'peaje', 'autopista', 'alsa', 'blablacar', 'itv', 'seguro coche', 'mapfre', 'mutua']],
  ['salud', ['farmacia', 'gimnasio', 'gym', 'fitness', 'basic fit', 'dentista', 'dental', 'clinica', 'optica', 'fisio', 'sanitas', 'adeslas', 'dkv', 'asisa', 'hospital', 'medico', 'decathlon', 'yoga', 'pilates']],
  ['compras', ['zara', 'pull bear', 'pull&bear', 'bershka', 'stradivarius', 'massimo dutti', 'mango', 'primark', 'h&m', 'hm ', 'uniqlo', 'shein', 'amazon', 'aliexpress', 'corte ingles', 'fnac', 'mediamarkt', 'media markt', 'pccomponentes', 'sephora', 'druni', 'primor', 'kiko', 'action ', 'tiger', 'vinted', 'wallapop']],
  ['ocio', ['restaurante', 'bar ', 'cafeteria', 'cafe', 'starbucks', 'mcdonald', 'burger king', 'telepizza', 'domino', 'vips', 'foster', 'cine', 'yelmo', 'cinesa', 'teatro', 'ticketmaster', 'entradas', 'concierto', 'ryanair', 'vueling', 'iberia', 'easyjet', 'booking', 'airbnb', 'hotel', 'edreams', 'museo', 'discoteca', 'copas']],
];

export function guessCategory(concept: string, merchantKey: string, rules: Record<string, string>, categoryIds: Set<string>): string {
  const learned = rules[merchantKey];
  if (learned && categoryIds.has(learned)) return learned;
  const n = ` ${concept.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')} `;
  for (const [cat, words] of KEYWORDS) if (categoryIds.has(cat) && words.some((w) => n.includes(w.endsWith(' ') ? ` ${w}` : w))) return cat;
  return categoryIds.has('otros') ? 'otros' : [...categoryIds][0];
}

/* ------------------------------------------------------------------ */
/* Movimientos para revisar antes de importar                          */
/* ------------------------------------------------------------------ */

export type Movement = {
  key: string;
  date: string;
  concept: string;
  amount: number;
  merchant: string;
  name: string;
  category: string;
  /** nuevo: se importa · duplicado: ya estaba · recibo: coincide con un recibo mensual (se marcará pagado) · ingreso */
  status: 'nuevo' | 'duplicado' | 'recibo' | 'ingreso';
  /** id del recibo mensual que coincide */
  matches?: string;
  /** Parece un cargo periódico (recibo, adeudo, cuota, suscripción…) */
  bill: boolean;
  include: boolean;
};

const fingerprint = (date: string, amount: number, concept: string) => `${date}|${amount.toFixed(2)}|${normalize(concept).slice(0, 40)}`;

/** Recibo mensual al que corresponde un movimiento (mismo comercio, importe parecido, ese mes). */
function matchRecurring(state: MoneyState, date: string, concept: string, amount: number): Expense | undefined {
  const d = parseDate(date);
  const brand = brandInConcept(concept);
  const n = normalize(concept);
  return state.expenses.find((e) => {
    if (!e.recurring || dayInMonth(e, d.y, d.m) === null) return false;
    const sameName = (brand && detectBrand(e.name)?.slug === brand.slug) || (normalize(e.name).length >= 3 && n.includes(normalize(e.name)));
    return !!sameName && Math.abs(Math.abs(amount) - e.amount) <= Math.max(e.amount * 0.2, 1);
  });
}

export function buildMovements(rows: Cell[][], map: Mapping, state: MoneyState): Movement[] {
  const existing = new Set(state.expenses.map((e) => e.bankKey).filter(Boolean));
  const catIds = new Set(state.categories.map((c) => c.id));
  const out: Movement[] = [];
  for (const r of rows.slice(map.header + 1)) {
    const date = parseBankDate(r[map.date]);
    if (!date) continue;
    let amount: number | null = null;
    if (map.amount !== -1) amount = parseAmount(r[map.amount]);
    else {
      const debit = map.debit !== -1 ? parseAmount(r[map.debit]) ?? 0 : 0;
      const credit = map.credit !== -1 ? parseAmount(r[map.credit]) ?? 0 : 0;
      amount = credit - Math.abs(debit);
    }
    if (amount === null || amount === 0) continue;
    const concept = String(r[map.concept] ?? '').trim() || 'Movimiento';
    const { key: merchant, name } = merchantOf(concept);
    const key = fingerprint(date, amount, concept);
    const rec = amount < 0 ? matchRecurring(state, date, concept, amount) : undefined;
    const status: Movement['status'] = existing.has(key) ? 'duplicado' : amount > 0 ? 'ingreso' : rec ? 'recibo' : 'nuevo';
    const category = guessCategory(concept, merchant, state.bankRules, catIds);
    out.push({
      key, date, concept, amount, merchant, name,
      category,
      bill: /recibo|adeudo|domicili|cuota|suscrip|mensualidad/i.test(concept) || category === 'suscripciones',
      status,
      matches: rec?.id,
      include: status === 'nuevo',
    });
  }
  // si el banco no pone signo y todo es positivo, se asume que son gastos
  if (out.length && out.every((x) => x.amount > 0) && map.amount !== -1) {
    return buildMovements(rows.map((r, i) => (i > map.header ? r.map((c, j) => (j === map.amount ? -Math.abs(parseAmount(c) ?? 0) : c)) : r)), map, state);
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

/** Aplica la importación: gastos nuevos, recibos marcados como pagados. */
export function applyImport(state: MoneyState, movements: Movement[]): MoneyState {
  const fresh: Expense[] = movements
    .filter((m) => m.include && m.amount < 0 && m.status !== 'duplicado')
    .map((m) => ({
      id: Math.random().toString(36).slice(2, 10),
      name: m.name,
      amount: Math.round(Math.abs(m.amount) * 100) / 100,
      category: m.category,
      date: m.date,
      recurring: false,
      source: 'banco' as const,
      bankKey: m.key,
      merchant: m.merchant,
      ...(m.bill ? { bill: true } : {}),
    }));
  const paid = { ...state.paid };
  for (const m of movements) {
    if (m.status === 'recibo' && m.matches) {
      const d = parseDate(m.date);
      paid[`${m.matches}:${monthKey(d.y, d.m)}`] = true;
    }
  }
  return { ...state, expenses: [...state.expenses, ...fresh], paid };
}

/** Ingresos por mes encontrados en el extracto (nóminas, transferencias recibidas…). */
export function incomeByMonth(movements: Movement[]) {
  const map = new Map<string, number>();
  for (const m of movements) {
    if (m.amount <= 0) continue;
    const d = parseDate(m.date);
    const k = monthKey(d.y, d.m);
    map.set(k, (map.get(k) ?? 0) + m.amount);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

/* ------------------------------------------------------------------ */
/* Recibos que se repiten                                              */
/* ------------------------------------------------------------------ */

export type RecurringSuggestion = { merchant: string; name: string; amount: number; day: number; category: string; months: number; ids: string[]; firstDate: string };

export function detectRecurring(state: MoneyState): RecurringSuggestion[] {
  const recurringNames = state.expenses.filter((e) => e.recurring).map((e) => detectBrand(e.name)?.slug.toUpperCase() ?? normalize(e.name).toUpperCase());
  const groups = new Map<string, Expense[]>();
  for (const e of state.expenses) {
    if (e.recurring || e.source !== 'banco' || !e.merchant || !e.bill) continue;
    groups.set(e.merchant, [...(groups.get(e.merchant) ?? []), e]);
  }
  const out: RecurringSuggestion[] = [];
  for (const [merchant, list] of groups) {
    const months = new Set(list.map((e) => e.date.slice(0, 7)));
    if (months.size < 2 || list.length > months.size + 1) continue; // varias compras al mes = no es un recibo
    const amounts = list.map((e) => e.amount).sort((a, b) => a - b);
    const median = amounts[Math.floor(amounts.length / 2)];
    if (amounts.some((a) => Math.abs(a - median) > Math.max(median * 0.15, 1.5))) continue;
    if (recurringNames.some((n) => n && (n === merchant || normalize(merchant).toUpperCase().includes(n)))) continue;
    const days = list.map((e) => parseDate(e.date).d).sort((a, b) => a - b);
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    out.push({
      merchant, name: list[0].name, amount: sorted[sorted.length - 1].amount, day: days[Math.floor(days.length / 2)],
      category: list[0].category, months: months.size, ids: list.map((e) => e.id), firstDate: sorted[0].date,
    });
  }
  return out.sort((a, b) => b.amount - a.amount);
}

/** Convierte las compras sueltas de un comercio en un recibo mensual (y marca pagados esos meses). */
export function convertToRecurring(state: MoneyState, s: RecurringSuggestion): MoneyState {
  const id = Math.random().toString(36).slice(2, 10);
  const f = parseDate(s.firstDate);
  const ids = new Set(s.ids);
  const months = state.expenses.filter((e) => ids.has(e.id)).map((e) => e.date.slice(0, 7));
  const paid = { ...state.paid };
  for (const mk of months) paid[`${id}:${mk}`] = true;
  return {
    ...state,
    paid,
    expenses: [
      ...state.expenses.filter((e) => !ids.has(e.id)),
      { id, name: s.name, amount: s.amount, category: s.category, date: `${f.y}-${pad(f.m + 1)}-${pad(s.day)}`, recurring: true, merchant: s.merchant },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Extracto de ejemplo                                                 */
/* ------------------------------------------------------------------ */

/** CSV con el formato típico de un banco español, con fechas relativas a hoy. */
export function sampleStatement(now = new Date()): string {
  const lines = ['Movimientos de la cuenta ES12 3456 **** **** **** 7890', '', 'Fecha;Fecha valor;Concepto;Importe;Saldo'];
  const rows: [number, string, number][] = [];
  for (let back = 1; back <= 2; back++) {
    const base = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const at = (day: number) => new Date(base.getFullYear(), base.getMonth(), day);
    const push = (day: number, concept: string, amount: number) => rows.push([at(day).getTime(), concept, amount]);
    push(1, 'TRANSFERENCIA NOMINA ACME CONSULTING SL', 1950);
    push(2, 'COMPRA TARJ. 5402XXXXXXXX1234 MERCADONA VALENCIA', -(52.3 + back * 3.1));
    push(4, 'PAGO MOVIL EN STARBUCKS COFFEE', -4.2);
    push(5, 'RECIBO NETFLIX.COM', -13.99);
    push(6, 'ADEUDO IBERDROLA CLIENTES SAU', -(47.1 + back));
    push(7, 'COMPRA TARJ. 5402XXXXXXXX1234 CAFETERIA LA PLAZA', -2.8);
    push(9, 'COMPRA AMAZON EU SARL', -(23.99 + back * 6));
    push(10, 'RECIBO SPOTIFY P2A1B3', -11.99);
    push(11, 'PAGO MOVIL EN CABIFY ESPANA', -12.4);
    push(12, 'RECIBO BASIC FIT SPAIN SA', -24.99);
    push(13, 'COMPRA TARJ. 5402XXXXXXXX1234 LIDL SUPERMERCADOS', -(38.75 + back * 4.3));
    push(14, 'BIZUM ENVIADO A MARTA', -15);
    push(15, 'COMPRA TARJ. 5402XXXXXXXX1234 FARMACIA LDO PEREZ', -9.8);
    push(16, 'PAGO MOVIL EN STARBUCKS COFFEE', -4.6);
    push(18, 'COMPRA TARJ. 5402XXXXXXXX1234 ZARA ESPANA SA', -(35.95 + back * 10));
    push(19, 'COMPRA GLOVO APP', -18.9);
    push(20, 'COMPRA TARJ. 5402XXXXXXXX1234 REPSOL ESTACION 4521', -50);
    push(21, 'COMPRA TARJ. 5402XXXXXXXX1234 CAFETERIA LA PLAZA', -2.6);
    push(23, 'COMPRA TARJ. 5402XXXXXXXX1234 MERCADONA VALENCIA', -(61.2 - back * 2));
    push(25, 'COMPRA TARJ. 5402XXXXXXXX1234 RESTAURANTE EL FARO', -32.5);
    push(27, 'PAGO MOVIL EN STARBUCKS COFFEE', -3.9);
    push(28, 'RECIBO NATURGY IBERIA GAS', -34.5);
  }
  for (const [t, concept, amount] of rows.sort((a, b) => b[0] - a[0])) {
    const d = new Date(t);
    const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    lines.push(`${date};${date};${concept};${amount.toFixed(2).replace('.', ',')};`);
  }
  return lines.join('\n');
}
