'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useHasHydrated } from '../../lib/useHasHydrated';

/* ------------------------------------------------------------------ */
/* Tipos y constantes                                                  */
/* ------------------------------------------------------------------ */

type CategoryId =
  | 'hogar'
  | 'alimentacion'
  | 'ocio'
  | 'suscripciones'
  | 'transporte'
  | 'salud'
  | 'compras'
  | 'otros';

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: CategoryId;
  /** Fecha del gasto (YYYY-MM-DD). Si es recurrente, es la fecha de inicio y el día de cobro. */
  date: string;
  recurring: boolean;
};

type MoneyState = {
  expenses: Expense[];
  /** Pagos marcados como hechos: clave `${expenseId}:${YYYY-MM}` */
  paid: Record<string, boolean>;
};

const CATEGORIES: Record<CategoryId, { label: string; color: string; icon: string }> = {
  hogar: { label: 'Hogar', color: '#5EDCF5', icon: '🏠' },
  alimentacion: { label: 'Alimentación', color: '#F29C38', icon: '🍴' },
  ocio: { label: 'Ocio y viajes', color: '#F5D547', icon: '🎭' },
  suscripciones: { label: 'Suscripciones', color: '#EE6A4D', icon: '📺' },
  transporte: { label: 'Transporte', color: '#8B7CF6', icon: '🚗' },
  salud: { label: 'Salud y deporte', color: '#5ED68C', icon: '💪' },
  compras: { label: 'Compras', color: '#E066C8', icon: '🛍️' },
  otros: { label: 'Otros', color: '#A3A3A3', icon: '📦' },
};

const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];
const STORAGE_KEY = 'tbl_money_v2';
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/* ------------------------------------------------------------------ */
/* Utilidades de fechas y formato                                      */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');
const monthKey = (y: number, m: number) => `${y}-${pad(m + 1)}`;
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

// `useGrouping: 'always'` para que 1052 se muestre como "1.052" (es-ES no agrupa 4 cifras por defecto)
const eurFormat = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  useGrouping: 'always',
} as Intl.NumberFormatOptions);
const eur = (n: number) => eurFormat.format(n);

const monthLabel = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d };
}

/** Día del mes (y, m) en que cae el gasto, o null si no aplica ese mes. */
function dayInMonth(e: Expense, y: number, m: number): number | null {
  const start = parseDate(e.date);
  if (!e.recurring) return start.y === y && start.m === m ? start.d : null;
  if (y * 12 + m < start.y * 12 + start.m) return null;
  return Math.min(start.d, daysInMonth(y, m));
}

function expensesForMonth(expenses: Expense[], y: number, m: number) {
  return expenses
    .map((e) => ({ e, day: dayInMonth(e, y, m) }))
    .filter((x): x is { e: Expense; day: number } => x.day !== null)
    .sort((a, b) => a.day - b.day);
}

const uid = () => Math.random().toString(36).slice(2, 10);

/** Color estable a partir del nombre, para los "logos" de las suscripciones. */
function colorFromName(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 65% 55%)`;
}

/** Datos de ejemplo realistas: 3 meses de historial relativos a hoy. */
function seedData(): MoneyState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const daysAgo = (n: number) => iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - n));
  const startOfRecurring = (day: number) => iso(new Date(today.getFullYear(), today.getMonth() - 3, day));

  const recurring: [string, number, CategoryId, number][] = [
    ['Alquiler', 650, 'hogar', 1],
    ['Luz', 45.3, 'hogar', 3],
    ['Netflix', 13.99, 'suscripciones', 5],
    ['DIGI', 20, 'hogar', 7],
    ['Spotify', 11.99, 'suscripciones', 10],
    ['Disney+', 9.99, 'suscripciones', 11],
    ['Gimnasio', 39.9, 'salud', 12],
    ['iCloud', 2.99, 'suscripciones', 19],
    ['Seguro del coche', 32.5, 'transporte', 22],
  ];

  // [concepto, importe, categoría, hace cuántos días]
  const oneOff: [string, number, CategoryId, number][] = [
    ['Mercadona', 64.2, 'alimentacion', 1],
    ['Brunch', 24.5, 'ocio', 2],
    ['Gasolina', 55, 'transporte', 4],
    ['Lidl', 41.75, 'alimentacion', 6],
    ['Zara', 49.95, 'compras', 8],
    ['Cine', 17, 'ocio', 10],
    ['Mercadona', 78.4, 'alimentacion', 13],
    ['Farmacia', 12.6, 'salud', 15],
    ['Cena con amigas', 38, 'ocio', 18],
    ['Frutería', 18.3, 'alimentacion', 20],
    ['Mercadona', 82.1, 'alimentacion', 24],
    ['Gasolina', 52, 'transporte', 27],
    ['Escapada a Valencia', 186, 'ocio', 31],
    ['Mercadona', 71.35, 'alimentacion', 34],
    ['Amazon', 34.99, 'compras', 37],
    ['Lidl', 39.9, 'alimentacion', 41],
    ['Concierto', 45, 'ocio', 44],
    ['Mercadona', 88.6, 'alimentacion', 48],
    ['Gasolina', 58, 'transporte', 52],
    ['Mercadona', 69.8, 'alimentacion', 55],
    ['Regalo cumpleaños', 40, 'compras', 58],
    ['Cena', 32, 'ocio', 62],
    ['Mercadona', 75.2, 'alimentacion', 66],
    ['Fisioterapeuta', 45, 'salud', 70],
  ];

  const expenses: Expense[] = [
    ...recurring.map(([name, amount, category, day]) => ({
      id: uid(), name, amount, category, date: startOfRecurring(day), recurring: true,
    })),
    ...oneOff.map(([name, amount, category, ago]) => ({
      id: uid(), name, amount, category, date: daysAgo(ago), recurring: false,
    })),
  ];

  // Los recibos ya pasados aparecen como pagados; los que están por venir, pendientes.
  const paid: Record<string, boolean> = {};
  for (const e of expenses.filter((x) => x.recurring)) {
    for (let back = 0; back <= 3; back++) {
      const y = today.getFullYear();
      const m = today.getMonth() - back;
      const ref = new Date(y, m, 1);
      const day = dayInMonth(e, ref.getFullYear(), ref.getMonth());
      if (day === null) continue;
      if (new Date(ref.getFullYear(), ref.getMonth(), day) < today || (back === 0 && day === today.getDate())) {
        paid[`${e.id}:${monthKey(ref.getFullYear(), ref.getMonth())}`] = true;
      }
    }
  }
  return { expenses, paid };
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-black text-white shrink-0"
      style={{ width: size, height: size, background: colorFromName(name), fontSize: size * 0.42 }}
      title={name}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function Donut({
  slices,
  total,
  selected,
  onSelect,
}: {
  slices: { id: CategoryId; value: number }[];
  total: number;
  selected: CategoryId | null;
  onSelect: (id: CategoryId | null) => void;
}) {
  const r = 70;
  const stroke = 34;
  const C = 2 * Math.PI * r;
  const gap = slices.length > 1 ? 3 : 0;
  let offset = 0;

  const sel = selected ? slices.find((s) => s.id === selected) : null;

  return (
    <div className="relative w-full max-w-[260px] aspect-square mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {total > 0 &&
          slices.map((s) => {
            const len = (s.value / total) * C;
            const dash = Math.max(len - gap, 0.5);
            const el = (
              <circle
                key={s.id}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke={CATEGORIES[s.id].color}
                strokeWidth={selected === s.id ? stroke + 6 : stroke}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                opacity={selected && selected !== s.id ? 0.3 : 1}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelect(selected === s.id ? null : s.id)}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-12">
        {sel ? (
          <>
            <span className="text-2xl">{CATEGORIES[sel.id].icon}</span>
            <span className="text-xs text-foreground/60 mt-1">{CATEGORIES[sel.id].label}</span>
            <span className="font-bold text-lg">{eur(sel.value)}</span>
            <span className="text-xs text-accent">{Math.round((sel.value / total) * 100)}%</span>
          </>
        ) : (
          <>
            <span className="text-sm text-foreground/70 leading-tight">Todas las categorías</span>
            <span className="font-bold text-lg mt-1">{eur(total)}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

function loadState(): MoneyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MoneyState) : seedData();
  } catch {
    return seedData();
  }
}

/** Solo renderiza en cliente: la fecha actual y localStorage no existen en el servidor. */
export const MoneyTracker = () => {
  const hasHydrated = useHasHydrated();
  if (!hasHydrated) return <div className="h-96 rounded-2xl bg-card/40 animate-pulse" />;
  return <MoneyTrackerInner />;
};

function MoneyTrackerInner() {
  const [state, setState] = useState<MoneyState>(loadState);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const [view, setView] = useState<'calendario' | 'categorias'>('calendario');
  const [selectedCat, setSelectedCat] = useState<CategoryId | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Guardado automático
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [state]);

  const { y, m } = cursor;
  const mk = monthKey(y, m);
  const prev = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };

  const monthItems = useMemo(() => expensesForMonth(state.expenses, y, m), [state.expenses, y, m]);
  const total = monthItems.reduce((s, x) => s + x.e.amount, 0);
  const prevTotal = useMemo(
    () => expensesForMonth(state.expenses, prev.y, prev.m).reduce((s, x) => s + x.e.amount, 0),
    [state.expenses, prev.y, prev.m],
  );
  const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;

  const recurringItems = monthItems.filter((x) => x.e.recurring);
  const recurringTotal = recurringItems.reduce((s, x) => s + x.e.amount, 0);
  const pendingTotal = recurringItems
    .filter((x) => !state.paid[`${x.e.id}:${mk}`])
    .reduce((s, x) => s + x.e.amount, 0);

  const slices = useMemo(() => {
    const byCat = new Map<CategoryId, number>();
    for (const { e } of monthItems) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount);
    return [...byCat.entries()]
      .map(([id, value]) => ({ id, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthItems]);

  const byDay = useMemo(() => {
    const map = new Map<number, Expense[]>();
    for (const { e, day } of monthItems) map.set(day, [...(map.get(day) ?? []), e]);
    return map;
  }, [monthItems]);

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() === m;
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // lunes = 0
  const nDays = daysInMonth(y, m);

  const moveMonth = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelectedDay(null);
    setSelectedCat(null);
  };

  const togglePaid = (id: string) =>
    setState((s) => ({ ...s, paid: { ...s.paid, [`${id}:${mk}`]: !s.paid[`${id}:${mk}`] } }));

  const removeExpense = (id: string) => {
    if (!confirm('¿Eliminar este gasto? Si es recurrente, desaparece de todos los meses.')) return;
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  };

  const resetData = (mode: 'demo' | 'vacio') => {
    const msg =
      mode === 'demo'
        ? '¿Cargar los datos de ejemplo? Se perderán los gastos actuales.'
        : '¿Borrar todos los gastos y empezar de cero?';
    if (!confirm(msg)) return;
    setState(mode === 'demo' ? seedData() : { expenses: [], paid: {} });
    setSelectedDay(null);
    setSelectedCat(null);
    const today = new Date();
    setCursor({ y: today.getFullYear(), m: today.getMonth() });
  };

  const addExpense = (e: Omit<Expense, 'id'>) => {
    setState((s) => ({ ...s, expenses: [...s.expenses, { ...e, id: uid() }] }));
    setShowForm(false);
  };

  const listItems =
    view === 'calendario'
      ? selectedDay
        ? monthItems.filter((x) => x.day === selectedDay)
        : recurringItems
      : selectedCat
        ? monthItems.filter((x) => x.e.category === selectedCat)
        : monthItems;

  return (
    <div className="space-y-6">
      {/* Cabecera: mes y total */}
      <div className="bg-card rounded-2xl p-6 border border-accent/10">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => moveMonth(-1)}
            className="w-10 h-10 rounded-full bg-background/60 hover:bg-background text-accent text-xl"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <h2 className="text-accent font-bold uppercase tracking-widest text-sm">{monthLabel(y, m)}</h2>
          <button
            onClick={() => moveMonth(1)}
            className="w-10 h-10 rounded-full bg-background/60 hover:bg-background text-accent text-xl"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl md:text-5xl font-bold tracking-tight">{eur(total)}</span>
          {change !== null && (
            <span className={`text-sm font-semibold ${change > 0 ? 'text-[#EE6A4D]' : 'text-[#5ED68C]'}`}>
              {change > 0 ? '↗' : '↘'} {Math.abs(change).toFixed(0)}% vs{' '}
              {new Date(prev.y, prev.m, 1).toLocaleDateString('es-ES', { month: 'long' })}
              {isCurrentMonth && <span className="text-foreground/40 font-normal"> · mes en curso</span>}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-xs text-foreground/50">Fijos / recurrentes</p>
            <p className="font-bold">{eur(recurringTotal)}</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-xs text-foreground/50">Pendiente de pagar</p>
            <p className={`font-bold ${pendingTotal > 0 ? 'text-[#F5D547]' : 'text-[#5ED68C]'}`}>{eur(pendingTotal)}</p>
          </div>
        </div>
      </div>

      {/* Selector de vista */}
      <div className="flex gap-2 bg-card/30 p-1.5 rounded-xl border border-accent/10">
        {(['calendario', 'categorias'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              view === v ? 'bg-accent text-background' : 'text-foreground/60 hover:text-accent'
            }`}
          >
            {v === 'calendario' ? 'Calendario' : 'Categorías'}
          </button>
        ))}
      </div>

      {/* Vista calendario */}
      {view === 'calendario' && (
        <div className="bg-card rounded-2xl p-3 sm:p-5 border border-accent/10">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-xs text-foreground/40 font-semibold">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: nDays }, (_, i) => i + 1).map((day) => {
              const items = byDay.get(day) ?? [];
              const isToday = isCurrentMonth && now.getDate() === day;
              const isSel = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSel ? null : day)}
                  className={`aspect-[3/4] sm:aspect-square rounded-lg p-1 flex flex-col items-center gap-1 transition-all border ${
                    isSel
                      ? 'border-accent bg-accent/10'
                      : 'border-transparent bg-background/50 hover:bg-background'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'text-[#5ED68C] font-bold' : 'text-foreground/60'}`}>{day}</span>
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {items.slice(0, 2).map((e) => (
                      <Avatar key={e.id} name={e.name} size={18} />
                    ))}
                    {items.length > 2 && <span className="text-[10px] text-foreground/50">+{items.length - 2}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista categorías */}
      {view === 'categorias' && (
        <div className="bg-card rounded-2xl p-5 border border-accent/10 space-y-5">
          {slices.length === 0 ? (
            <p className="text-center text-foreground/50 py-10">Sin gastos este mes.</p>
          ) : (
            <>
              <Donut slices={slices} total={total} selected={selectedCat} onSelect={setSelectedCat} />
              <div className="space-y-2">
                {slices.map((s) => {
                  const cat = CATEGORIES[s.id];
                  const pct = (s.value / total) * 100;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedCat(selectedCat === s.id ? null : s.id)}
                      className={`relative w-full overflow-hidden rounded-xl bg-background/60 text-left transition-all ${
                        selectedCat === s.id ? 'ring-1 ring-accent' : ''
                      }`}
                    >
                      <div className="absolute inset-y-0 left-0 opacity-20" style={{ width: `${pct}%`, background: cat.color }} />
                      <div className="relative flex items-center gap-3 p-3">
                        <span className="text-xl w-8 text-center">{cat.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{cat.label}</p>
                          <p className="text-xs text-foreground/50">{pct.toFixed(0)}%</p>
                        </div>
                        <span className="font-semibold text-sm">{eur(s.value)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Lista de gastos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-accent font-bold text-sm uppercase tracking-widest">
            {view === 'calendario'
              ? selectedDay
                ? `Día ${selectedDay}`
                : 'Pagos recurrentes'
              : selectedCat
                ? CATEGORIES[selectedCat].label
                : 'Todos los gastos'}
          </h3>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-full bg-accent text-background text-sm font-bold"
          >
            {showForm ? 'Cerrar' : '+ Añadir'}
          </button>
        </div>

        {showForm && (
          <ExpenseForm
            defaultDate={`${y}-${pad(m + 1)}-${pad(selectedDay ?? (isCurrentMonth ? now.getDate() : 1))}`}
            defaultCategory={selectedCat ?? 'alimentacion'}
            onSubmit={addExpense}
          />
        )}

        {listItems.length === 0 && (
          <p className="text-center text-foreground/40 text-sm py-6">No hay gastos aquí todavía.</p>
        )}

        {listItems.map(({ e, day }) => {
          const isPaid = !e.recurring || !!state.paid[`${e.id}:${mk}`];
          return (
            <div key={e.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-accent/5 group">
              <Avatar name={e.name} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{e.name}</p>
                <p className="text-xs text-foreground/50">
                  {e.recurring ? 'Mensual' : 'Puntual'} · día {day} · {CATEGORIES[e.category].label}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{eur(e.amount)}</p>
                {e.recurring ? (
                  <button
                    onClick={() => togglePaid(e.id)}
                    className={`text-xs font-semibold ${isPaid ? 'text-[#5ED68C]' : 'text-[#F5D547]'}`}
                  >
                    {isPaid ? 'Pagado ✓' : 'Pendiente'}
                  </button>
                ) : (
                  <p className="text-xs text-foreground/40">Gastado</p>
                )}
              </div>
              <button
                onClick={() => removeExpense(e.id)}
                className="text-foreground/30 hover:text-[#EE6A4D] text-lg px-1"
                aria-label={`Eliminar ${e.name}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Datos de la demo */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-xs text-foreground/40">
        <button onClick={() => resetData('demo')} className="hover:text-accent underline-offset-4 hover:underline">
          Cargar datos de ejemplo
        </button>
        <button onClick={() => resetData('vacio')} className="hover:text-[#EE6A4D] underline-offset-4 hover:underline">
          Empezar de cero
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formulario                                                          */
/* ------------------------------------------------------------------ */

function ExpenseForm({
  defaultDate,
  defaultCategory,
  onSubmit,
}: {
  defaultDate: string;
  defaultCategory: CategoryId;
  onSubmit: (e: Omit<Expense, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const [date, setDate] = useState(defaultDate);
  const [recurring, setRecurring] = useState(false);

  const value = parseFloat(amount.replace(',', '.'));
  const valid = name.trim() !== '' && value > 0 && date !== '';

  const inputCls =
    'w-full bg-background border border-accent/20 rounded-lg p-2.5 text-sm focus:outline-none focus:border-accent';

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!valid) return;
        onSubmit({ name: name.trim(), amount: Math.round(value * 100) / 100, category, date, recurring });
      }}
      className="bg-card rounded-xl p-4 border border-accent/20 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} placeholder="Concepto (ej. Netflix)" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className={inputCls}
          placeholder="Importe €"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
          {CATEGORY_IDS.map((id) => (
            <option key={id} value={id}>
              {CATEGORIES[id].icon} {CATEGORIES[id].label}
            </option>
          ))}
        </select>
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-[#D5CEA3]" />
        Se repite cada mes (suscripción, recibo, alquiler…)
      </label>
      <button
        type="submit"
        disabled={!valid}
        className="w-full py-2.5 rounded-lg bg-accent text-background font-bold disabled:opacity-40"
      >
        Guardar gasto
      </button>
    </form>
  );
}
