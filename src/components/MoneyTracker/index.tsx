'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useHasHydrated } from '../../lib/useHasHydrated';
import {
  FALLBACK_CATEGORY_ID, SWATCHES, daysInMonth, detectBrand, eur, expensesForMonth, loadState, monthKey,
  monthLong, monthShort, pad, saveState, seedData, uid,
  type Category, type Expense, type ExpenseIcon, type MoneyState,
} from './data';
import { EmojiColorPicker, IconPicker, IconTile, resolveIcon } from './icons';

const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

/* ------------------------------------------------------------------ */
/* Piezas pequeñas                                                     */
/* ------------------------------------------------------------------ */

function CheckMark({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.5l5 5L19.5 7" />
    </svg>
  );
}

/** Botón de "pagado" táctil: cuadrado hundido cuando está marcado. */
function PaidToggle({ paid, onClick, label }: { paid: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={paid}
      aria-label={label}
      className={`w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0 transition-all duration-150 ${
        paid
          ? 'bg-ink text-paper shadow-[inset_0_2px_0_rgba(255,255,255,0.12)] translate-y-[1px]'
          : 'bg-paper border-2 border-ink/80 shadow-[0_3px_0_rgba(17,17,17,0.85)] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-none'
      }`}
    >
      {paid && <CheckMark size={18} />}
    </button>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px]" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="sheet w-full sm:max-w-md max-h-[92%] overflow-y-auto bg-paper text-ink rounded-t-[32px] sm:rounded-[32px] p-5 space-y-4 shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="display text-2xl">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-ink/8 text-xl leading-none" aria-label="Cerrar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Donut({
  slices,
  total,
  selected,
  onSelect,
}: {
  slices: { cat: Category; value: number }[];
  total: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const r = 72;
  const stroke = 30;
  const C = 2 * Math.PI * r;
  const gap = slices.length > 1 ? 4 : 0;
  let offset = 0;
  const sel = selected ? slices.find((s) => s.cat.id === selected) : null;

  return (
    <div className="relative w-full max-w-[250px] aspect-square mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#262626" strokeWidth={stroke} />
        {total > 0 &&
          slices.map((s) => {
            const len = (s.value / total) * C;
            const dash = Math.max(len - gap, 0.5);
            const el = (
              <circle
                key={s.cat.id}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke={s.cat.color}
                strokeWidth={selected === s.cat.id ? stroke + 8 : stroke}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                opacity={selected && selected !== s.cat.id ? 0.25 : 1}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelect(selected === s.cat.id ? null : s.cat.id)}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-14">
        {sel ? (
          <>
            <span className="text-3xl leading-none">{sel.cat.emoji}</span>
            <span className="display text-xl text-paper mt-1">{eur(sel.value)}</span>
            <span className="mono text-[11px] text-amber">{Math.round((sel.value / total) * 100)}% · {sel.cat.label.toUpperCase()}</span>
          </>
        ) : (
          <>
            <span className="mono text-[11px] text-mute">TODAS LAS CATEGORÍAS</span>
            <span className="display text-2xl text-paper mt-1">{eur(total)}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

/** Solo renderiza en cliente: la fecha actual y localStorage no existen en el servidor. */
export const MoneyTracker = () => {
  const hasHydrated = useHasHydrated();
  if (!hasHydrated) return <div className="h-[80vh] rounded-[32px] bg-slab/20 animate-pulse" />;
  return <MoneyTrackerInner />;
};

type EditorState = { mode: 'new' } | { mode: 'edit'; expense: Expense };
type CategoryEditorState = { mode: 'new' } | { mode: 'edit'; category: Category };

function MoneyTrackerInner() {
  const [state, setState] = useState<MoneyState>(loadState);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const [view, setView] = useState<'calendario' | 'categorias'>('calendario');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [catEditor, setCatEditor] = useState<CategoryEditorState | null>(null);
  const [pending, setPending] = useState<{ message: string; action: string; run: () => void } | null>(null);

  useEffect(() => saveState(state), [state]);

  const { y, m } = cursor;
  const mk = monthKey(y, m);
  const prev = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };
  const categories = state.categories;
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const catOf = (id: string) => catById.get(id) ?? catById.get(FALLBACK_CATEGORY_ID) ?? categories[0];

  const monthItems = useMemo(() => expensesForMonth(state.expenses, y, m), [state.expenses, y, m]);
  const total = monthItems.reduce((s, x) => s + x.e.amount, 0);
  const prevTotal = useMemo(
    () => expensesForMonth(state.expenses, prev.y, prev.m).reduce((s, x) => s + x.e.amount, 0),
    [state.expenses, prev.y, prev.m],
  );
  const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;

  const isPaid = (e: Expense) => !e.recurring || !!state.paid[`${e.id}:${mk}`];
  const recurringItems = monthItems.filter((x) => x.e.recurring);
  const paidCount = recurringItems.filter((x) => isPaid(x.e)).length;
  const pendingTotal = recurringItems.filter((x) => !isPaid(x.e)).reduce((s, x) => s + x.e.amount, 0);

  const slices = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const { e } of monthItems) {
      const id = catById.has(e.category) ? e.category : FALLBACK_CATEGORY_ID;
      byCat.set(id, (byCat.get(id) ?? 0) + e.amount);
    }
    return [...byCat.entries()]
      .map(([id, value]) => ({ cat: catById.get(id)!, value }))
      .filter((s) => s.cat)
      .sort((a, b) => b.value - a.value);
  }, [monthItems, catById]);

  const byDay = useMemo(() => {
    const map = new Map<number, Expense[]>();
    for (const { e, day } of monthItems) map.set(day, [...(map.get(day) ?? []), e]);
    return map;
  }, [monthItems]);

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() === m;
  const monthIndex = y * 12 + m;
  const nowIndex = now.getFullYear() * 12 + now.getMonth();
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

  const saveExpense = (e: Expense) => {
    setState((s) => {
      const exists = s.expenses.some((x) => x.id === e.id);
      return { ...s, expenses: exists ? s.expenses.map((x) => (x.id === e.id ? e : x)) : [...s.expenses, e] };
    });
    setEditor(null);
  };

  const deleteExpense = (e: Expense) =>
    setPending({
      message: e.recurring
        ? `¿Eliminar «${e.name}»? Al ser mensual, desaparece de todos los meses.`
        : `¿Eliminar «${e.name}»?`,
      action: 'Eliminar',
      run: () => {
        setState((s) => ({ ...s, expenses: s.expenses.filter((x) => x.id !== e.id) }));
        setEditor(null);
      },
    });

  const saveCategory = (c: Category) => {
    setState((s) => {
      const exists = s.categories.some((x) => x.id === c.id);
      return { ...s, categories: exists ? s.categories.map((x) => (x.id === c.id ? c : x)) : [...s.categories, c] };
    });
    setCatEditor(null);
  };

  const deleteCategory = (c: Category) => {
    const n = state.expenses.filter((e) => e.category === c.id).length;
    setPending({
      message: n
        ? `¿Eliminar «${c.label}»? Sus ${n} gastos pasarán a «Otros».`
        : `¿Eliminar la categoría «${c.label}»?`,
      action: 'Eliminar',
      run: () => {
        setState((s) => ({
          ...s,
          categories: s.categories.filter((x) => x.id !== c.id),
          expenses: s.expenses.map((e) => (e.category === c.id ? { ...e, category: FALLBACK_CATEGORY_ID } : e)),
        }));
        setCatEditor(null);
        setSelectedCat(null);
      },
    });
  };

  const resetData = (mode: 'demo' | 'vacio') =>
    setPending({
      message:
        mode === 'demo'
          ? '¿Cargar los datos de ejemplo? Se perderán los gastos actuales.'
          : '¿Borrar todos los gastos y empezar de cero? Las categorías se mantienen.',
      action: mode === 'demo' ? 'Cargar ejemplo' : 'Borrar todo',
      run: () => {
        setState((s) => (mode === 'demo' ? seedData() : { expenses: [], paid: {}, categories: s.categories }));
        setSelectedDay(null);
        setSelectedCat(null);
        const today = new Date();
        setCursor({ y: today.getFullYear(), m: today.getMonth() });
      },
    });

  const listItems =
    view === 'calendario'
      ? selectedDay
        ? monthItems.filter((x) => x.day === selectedDay)
        : recurringItems
      : selectedCat
        ? monthItems.filter((x) => (catById.has(x.e.category) ? x.e.category : FALLBACK_CATEGORY_ID) === selectedCat)
        : monthItems;

  const relative = (day: number) => {
    if (!isCurrentMonth) return null;
    const diff = day - now.getDate();
    if (diff === 0) return 'HOY';
    if (diff === 1) return 'MAÑANA';
    return diff > 0 ? `EN ${diff} DÍAS` : `HACE ${-diff} D`;
  };

  const listTitle =
    view === 'calendario'
      ? selectedDay
        ? `${selectedDay} de ${monthLong(y, m)}`
        : 'Pagos del mes'
      : selectedCat
        ? catOf(selectedCat).label
        : 'Todos los gastos';

  return (
    <div className="space-y-6 pb-28">
      {/* ---------- Cabecera ---------- */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => moveMonth(-1)} className="nav-btn" aria-label="Mes anterior">‹</button>
          <span className="mono text-sm font-medium tracking-[0.2em] text-ink">
            {monthShort(y, m)} {y}
          </span>
          <button onClick={() => moveMonth(1)} className="nav-btn" aria-label="Mes siguiente">›</button>
          <span className="flex-1 h-[2px] bg-gradient-to-r from-amber to-transparent rounded-full" aria-hidden="true" />
        </div>

        <div>
          <p className="display text-[clamp(3rem,15vw,4.75rem)] leading-[0.9] text-ink tabular-nums">{eur(total)}</p>
          <p className="display text-2xl text-ink/80 mt-1">
            gastado en {monthLong(y, m)}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {change !== null && (
            <span className={`chip ${change > 0 ? 'text-[#B3261E]' : 'text-[#1F7A4D]'}`}>
              {change > 0 ? '↗' : '↘'} {Math.abs(change).toFixed(0)}% VS {monthShort(prev.y, prev.m)}
              {isCurrentMonth && <span className="text-ink/45"> · EN CURSO</span>}
            </span>
          )}
          <span className="chip">
            PENDIENTE <b className={pendingTotal > 0 ? 'text-[#9A5B00]' : 'text-[#1F7A4D]'}>{eur(pendingTotal)}</b>
          </span>
        </div>
      </section>

      {/* ---------- Selector de vista ---------- */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-slab shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        {(['calendario', 'categorias'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`py-3 rounded-full text-sm font-extrabold transition-all ${
              view === v ? 'bg-paper text-ink' : 'text-mute hover:text-paper'
            }`}
          >
            {v === 'calendario' ? 'Calendario' : 'Categorías'}
          </button>
        ))}
      </div>

      {/* ---------- Calendario ---------- */}
      {view === 'calendario' && (
        <section className="slab p-4 sm:p-5">
          <div className="flex items-baseline justify-between mb-1 px-1">
            <h2 className="display text-xl text-paper">Cobros</h2>
            <span className="mono text-xs text-paper">
              {paidCount} / {recurringItems.length}
            </span>
          </div>
          <div className="h-[3px] rounded-full bg-[#2A2A2A] mb-4 mx-1 overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-500"
              style={{ width: `${recurringItems.length ? (paidCount / recurringItems.length) * 100 : 0}%` }}
            />
          </div>
          <div className="grid grid-cols-7 gap-y-2 mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="mono text-center text-[10px] text-mute">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2.5 justify-items-center">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: nDays }, (_, i) => i + 1).map((day) => {
              const items = byDay.get(day) ?? [];
              const isToday = isCurrentMonth && now.getDate() === day;
              const isSel = selectedDay === day;
              const isPast = monthIndex < nowIndex || (isCurrentMonth && day < now.getDate());
              const allPaid = items.length > 0 && items.every(isPaid);
              const first = items[0];
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSel ? null : day)}
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                    isSel ? 'ring-2 ring-paper ring-offset-2 ring-offset-slab' : ''
                  } ${isToday && !isSel ? 'ring-2 ring-amber ring-offset-2 ring-offset-slab' : ''}`}
                  aria-label={`${day}${items.length ? `: ${items.map((e) => e.name).join(', ')}` : ''}`}
                >
                  {first ? (
                    <>
                      <IconTile icon={resolveIcon(first, categories)} size={44} round />
                      {items.length > 1 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber text-ink mono text-[10px] font-bold flex items-center justify-center">
                          {items.length}
                        </span>
                      )}
                      {allPaid && (
                        <span className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-paper text-ink flex items-center justify-center shadow">
                          <CheckMark size={11} />
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      className={`w-full h-full rounded-full flex items-center justify-center mono text-[13px] ${
                        isToday ? 'bg-[#1F1A10] text-amber font-bold' : isPast ? 'bg-[#232323] text-[#6E6E6E]' : 'bg-[#0B0B0B] text-[#E6E6E6]'
                      }`}
                    >
                      {day}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Categorías ---------- */}
      {view === 'categorias' && (
        <section className="slab p-5 space-y-5">
          {slices.length === 0 ? (
            <p className="text-center text-mute py-10">Sin gastos este mes.</p>
          ) : (
            <Donut slices={slices} total={total} selected={selectedCat} onSelect={setSelectedCat} />
          )}
          <div className="space-y-2">
            {categories.map((cat) => {
              const value = slices.find((s) => s.cat.id === cat.id)?.value ?? 0;
              const pct = total > 0 ? (value / total) * 100 : 0;
              const active = selectedCat === cat.id;
              return (
                <div key={cat.id} className={`flex items-center gap-2 rounded-2xl transition ${active ? 'bg-[#2A2A2A]' : ''}`}>
                  <button
                    onClick={() => setSelectedCat(active ? null : cat.id)}
                    className="flex-1 min-w-0 flex items-center gap-3 p-2 text-left"
                  >
                    <IconTile icon={{ kind: 'emoji', emoji: cat.emoji, color: cat.color }} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-paper text-sm truncate">{cat.label}</span>
                        <span className="font-bold text-paper text-sm tabular-nums">{eur(value)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-[5px] rounded-full bg-[#2A2A2A] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat.color }} />
                        </div>
                        <span className="mono text-[10px] text-mute w-8 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCatEditor({ mode: 'edit', category: cat })}
                    className="w-9 h-9 rounded-full text-mute hover:text-paper hover:bg-[#2A2A2A] shrink-0"
                    aria-label={`Editar categoría ${cat.label}`}
                  >
                    ✎
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setCatEditor({ mode: 'new' })}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-[#3A3A3A] text-mute hover:text-paper hover:border-mute font-bold text-sm"
          >
            + Nueva categoría
          </button>
        </section>
      )}

      {/* ---------- Lista ---------- */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="display text-2xl text-ink first-letter:uppercase">{listTitle}</h2>
          <span className="mono text-xs text-ink/60">{listItems.length} {listItems.length === 1 ? 'GASTO' : 'GASTOS'}</span>
        </div>

        {listItems.length === 0 && (
          <div className="glass p-6 text-center">
            <p className="font-bold">Nada por aquí.</p>
            <p className="text-sm text-ink/60 mt-1">Pulsa el botón amarillo para añadir un gasto.</p>
          </div>
        )}

        {listItems.map(({ e, day }) => {
          const cat = catOf(e.category);
          const rel = relative(day);
          return (
            <div key={e.id} className="glass flex items-center gap-3 p-3 pr-3">
              <button onClick={() => setEditor({ mode: 'edit', expense: e })} className="flex-1 min-w-0 flex items-center gap-3 text-left">
                <IconTile icon={resolveIcon(e, categories)} size={46} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-extrabold truncate">{e.name}</p>
                    <p className="font-extrabold tabular-nums shrink-0">{eur(e.amount)}</p>
                  </div>
                  <p className="mono text-[10px] text-ink/55 truncate mt-0.5">
                    {e.recurring ? 'MENSUAL' : 'PUNTUAL'} · {rel ?? `DÍA ${day}`} · {cat.label.toUpperCase()}
                  </p>
                </div>
              </button>
              {e.recurring ? (
                <PaidToggle
                  paid={isPaid(e)}
                  onClick={() => togglePaid(e.id)}
                  label={isPaid(e) ? `Marcar ${e.name} como pendiente` : `Marcar ${e.name} como pagado`}
                />
              ) : (
                <span className="w-10 h-10 rounded-[13px] bg-ink/8 flex items-center justify-center text-ink/45 shrink-0" title="Gasto puntual">
                  <CheckMark size={16} />
                </span>
              )}
            </div>
          );
        })}
      </section>

      {/* ---------- Datos de la demo ---------- */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 mono text-[11px] text-ink/55">
        <button onClick={() => resetData('demo')} className="hover:text-ink underline-offset-4 hover:underline">CARGAR DATOS DE EJEMPLO</button>
        <button onClick={() => resetData('vacio')} className="hover:text-[#B3261E] underline-offset-4 hover:underline">EMPEZAR DE CERO</button>
      </div>

      {/* ---------- Botón principal ---------- */}
      <div className="fab-wrap">
        <button onClick={() => setEditor({ mode: 'new' })} className="fab" aria-label="Añadir gasto">
          <span className="text-4xl leading-none font-black">+</span>
        </button>
      </div>

      {/* ---------- Hojas ---------- */}
      {editor && (
        <ExpenseSheet
          key={editor.mode === 'edit' ? editor.expense.id : 'new'}
          initial={editor.mode === 'edit' ? editor.expense : undefined}
          categories={categories}
          defaultDate={`${y}-${pad(m + 1)}-${pad(selectedDay ?? (isCurrentMonth ? now.getDate() : 1))}`}
          defaultCategory={selectedCat ?? 'alimentacion'}
          onSave={saveExpense}
          onDelete={editor.mode === 'edit' ? () => deleteExpense(editor.expense) : undefined}
          onClose={() => setEditor(null)}
        />
      )}

      {catEditor && (
        <CategorySheet
          initial={catEditor.mode === 'edit' ? catEditor.category : undefined}
          onSave={saveCategory}
          onDelete={
            catEditor.mode === 'edit' && catEditor.category.id !== FALLBACK_CATEGORY_ID
              ? () => deleteCategory(catEditor.category)
              : undefined
          }
          onClose={() => setCatEditor(null)}
        />
      )}

      {pending && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={() => setPending(null)} role="alertdialog" aria-modal="true">
          <div className="w-full max-w-sm bg-paper text-ink rounded-[28px] p-5 space-y-4 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <p className="font-bold leading-snug">{pending.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setPending(null)} className="flex-1 py-3 rounded-full bg-ink/8 font-bold" autoFocus>
                Cancelar
              </button>
              <button
                onClick={() => {
                  pending.run();
                  setPending(null);
                }}
                className="flex-1 py-3 rounded-full bg-[#D93A2E] text-white font-extrabold"
              >
                {pending.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hoja: añadir / editar gasto                                         */
/* ------------------------------------------------------------------ */

function ExpenseSheet({
  initial,
  categories,
  defaultDate,
  defaultCategory,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: Expense;
  categories: Category[];
  defaultDate: string;
  defaultCategory: string;
  onSave: (e: Expense) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace('.', ',') : '');
  const [category, setCategory] = useState(
    initial?.category ?? (categories.some((c) => c.id === defaultCategory) ? defaultCategory : categories[0]?.id ?? FALLBACK_CATEGORY_ID),
  );
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [recurring, setRecurring] = useState(initial?.recurring ?? false);
  const [icon, setIcon] = useState<ExpenseIcon | undefined>(initial?.icon);
  const [showPicker, setShowPicker] = useState(false);

  const value = parseFloat(amount.replace(',', '.'));
  const valid = name.trim() !== '' && value > 0 && date !== '';
  const auto = resolveIcon({ name, category, icon: undefined }, categories);
  const current = icon ?? auto;
  const detected = !icon && detectBrand(name);

  return (
    <Sheet title={initial ? 'Editar gasto' : 'Nuevo gasto'} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!valid) return;
          onSave({
            id: initial?.id ?? uid(),
            name: name.trim(),
            amount: Math.round(value * 100) / 100,
            category,
            date,
            recurring,
            ...(icon ? { icon } : {}),
          });
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="relative shrink-0 rounded-[18px] focus-visible:outline-2"
            aria-label="Cambiar icono"
          >
            <IconTile icon={current} size={60} />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-ink text-paper text-xs flex items-center justify-center">✎</span>
          </button>
          <div className="flex-1 space-y-2">
            <input id="expense-name" className="field w-full text-base font-bold" placeholder="Concepto (ej. Netflix)" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!initial} />
            <p className="mono text-[10px] text-ink/55">
              {detected ? `LOGO DE ${detected.title.toUpperCase()} ✓` : 'TOCA EL ICONO PARA PERSONALIZARLO'}
            </p>
          </div>
        </div>

        {showPicker && (
          <div className="rounded-3xl bg-white/60 p-3 border border-ink/10">
            <IconPicker name={name} value={icon} fallback={auto} onChange={setIcon} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1" htmlFor="expense-amount">
            <span className="mono text-[10px] text-ink/60">IMPORTE</span>
            <input id="expense-amount" className="field w-full tabular-nums" placeholder="0,00 €" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="space-y-1" htmlFor="expense-date">
            <span className="mono text-[10px] text-ink/60">{recurring ? 'PRIMER COBRO' : 'FECHA'}</span>
            <input id="expense-date" type="date" className="field w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <div className="space-y-1">
          <span className="mono text-[10px] text-ink/60">CATEGORÍA</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  category === c.id ? 'bg-ink text-paper border-ink' : 'bg-white/50 border-ink/15'
                }`}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ background: c.color }}>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRecurring((r) => !r)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-ink/10 text-left"
          aria-pressed={recurring}
        >
          <span className={`w-7 h-7 rounded-[9px] flex items-center justify-center ${recurring ? 'bg-ink text-paper' : 'border-2 border-ink/70'}`}>
            {recurring && <CheckMark size={14} />}
          </span>
          <span className="text-sm">
            <b>Se repite cada mes</b>
            <span className="block text-ink/60 text-xs">Suscripciones, recibos, alquiler…</span>
          </span>
        </button>

        <div className="flex gap-3">
          {onDelete && (
            <button type="button" onClick={onDelete} className="px-5 py-3.5 rounded-full bg-[#D93A2E]/10 text-[#B3261E] font-extrabold">
              Eliminar
            </button>
          )}
          <button type="submit" disabled={!valid} className="btn-3d flex-1">
            {initial ? 'Guardar cambios' : 'Añadir gasto'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Hoja: añadir / editar categoría                                     */
/* ------------------------------------------------------------------ */

function CategorySheet({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: Category;
  onSave: (c: Category) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✨');
  const [color, setColor] = useState(initial?.color ?? SWATCHES[0]);
  const valid = label.trim() !== '';

  return (
    <Sheet title={initial ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!valid) return;
          onSave({ id: initial?.id ?? `cat_${uid()}`, label: label.trim(), emoji, color });
        }}
      >
        <div className="flex items-center gap-3">
          <IconTile icon={{ kind: 'emoji', emoji, color }} size={60} />
          <input id="category-name" className="field flex-1 text-base font-bold" placeholder="Nombre (ej. Mascotas)" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus={!initial} />
        </div>
        <EmojiColorPicker
          emoji={emoji}
          color={color}
          onChange={(em, c) => {
            setEmoji(em);
            setColor(c);
          }}
        />
        <div className="flex gap-3">
          {onDelete && (
            <button type="button" onClick={onDelete} className="px-5 py-3.5 rounded-full bg-[#D93A2E]/10 text-[#B3261E] font-extrabold">
              Eliminar
            </button>
          )}
          <button type="submit" disabled={!valid} className="btn-3d flex-1">
            {initial ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
