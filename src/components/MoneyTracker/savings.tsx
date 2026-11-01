'use client';

import React, { useMemo, useState } from 'react';
import {
  FALLBACK_BUCKET_ID, eur, expensesForMonth, incomeFor, monthKey, monthLong, monthShort, pad, savingsTotals,
  seedSavings, uid,
  type MoneyState, type SavingEntry, type SavingsBucket,
} from './data';
import { IconTile } from './icons';
import { GroupSheet, Sheet, ToggleRow, type PendingConfirm } from './ui';

type Props = {
  state: MoneyState;
  setState: React.Dispatch<React.SetStateAction<MoneyState>>;
  y: number;
  m: number;
  setPending: (p: PendingConfirm) => void;
};

export function SavingsView({ state, setState, y, m, setPending }: Props) {
  const [entryEditor, setEntryEditor] = useState<{ entry?: SavingEntry } | null>(null);
  const [bucketEditor, setBucketEditor] = useState<{ bucket?: SavingsBucket } | null>(null);
  const [incomeOpen, setIncomeOpen] = useState(false);

  const mk = monthKey(y, m);
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() === m;
  const buckets = state.buckets;
  const bucketOf = (id: string) => buckets.find((b) => b.id === id) ?? buckets.find((b) => b.id === FALLBACK_BUCKET_ID) ?? buckets[0];

  const monthEntries = useMemo(() => expensesForMonth(state.savings, y, m), [state.savings, y, m]);
  const monthTotal = monthEntries.reduce((s, x) => s + x.e.amount, 0);
  const monthInvest = monthEntries.filter((x) => bucketOf(x.e.bucket)?.invest).reduce((s, x) => s + x.e.amount, 0);
  const monthOther = monthTotal - monthInvest;
  const income = incomeFor(state.income, y, m);
  const rate = income ? (monthTotal / income) * 100 : null;

  const totals = useMemo(() => savingsTotals(state.savings, y, m), [state.savings, y, m]);
  const totalAll = [...totals.values()].reduce((a, b) => a + b, 0);
  const milestone = [100000, 50000, 25000, 10000, 5000, 2500, 1000, 500].find((v) => totalAll >= v);

  const history = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(y, m - 5 + i, 1);
        const items = expensesForMonth(state.savings, d.getFullYear(), d.getMonth());
        const invest = items.filter((x) => state.buckets.find((b) => b.id === x.e.bucket)?.invest).reduce((s, x) => s + x.e.amount, 0);
        const total = items.reduce((s, x) => s + x.e.amount, 0);
        return { label: monthShort(d.getFullYear(), d.getMonth()), invest, other: total - invest, total };
      }),
    [state.savings, state.buckets, y, m],
  );
  const maxHist = Math.max(...history.map((h) => h.total), 1);

  const byBucket = buckets.map((b) => ({
    b,
    month: monthEntries.filter((x) => x.e.bucket === b.id).reduce((s, x) => s + x.e.amount, 0),
    total: totals.get(b.id) ?? 0,
  }));

  const saveEntry = (e: SavingEntry) => {
    setState((s) => {
      const exists = s.savings.some((x) => x.id === e.id);
      return { ...s, savings: exists ? s.savings.map((x) => (x.id === e.id ? e : x)) : [...s.savings, e] };
    });
    setEntryEditor(null);
  };

  const deleteEntry = (e: SavingEntry) =>
    setPending({
      message: e.recurring ? `¿Eliminar «${e.name}»? Es mensual: desaparece de todos los meses.` : `¿Eliminar «${e.name}»?`,
      action: 'Eliminar',
      run: () => {
        setState((s) => ({ ...s, savings: s.savings.filter((x) => x.id !== e.id) }));
        setEntryEditor(null);
      },
    });

  const saveBucket = (g: { id: string; label: string; emoji: string; color: string }, invest: boolean) => {
    const b: SavingsBucket = { ...g, invest };
    setState((s) => {
      const exists = s.buckets.some((x) => x.id === b.id);
      return { ...s, buckets: exists ? s.buckets.map((x) => (x.id === b.id ? b : x)) : [...s.buckets, b] };
    });
    setBucketEditor(null);
  };

  const deleteBucket = (b: SavingsBucket) => {
    const n = state.savings.filter((e) => e.bucket === b.id).length;
    setPending({
      message: n ? `¿Eliminar «${b.label}»? Sus ${n} aportaciones pasarán a «${bucketOf(FALLBACK_BUCKET_ID)?.label ?? 'otro destino'}».` : `¿Eliminar «${b.label}»?`,
      action: 'Eliminar',
      run: () => {
        setState((s) => ({
          ...s,
          buckets: s.buckets.filter((x) => x.id !== b.id),
          savings: s.savings.map((e) => (e.bucket === b.id ? { ...e, bucket: FALLBACK_BUCKET_ID } : e)),
        }));
        setBucketEditor(null);
      },
    });
  };

  const investPct = monthTotal > 0 ? (monthInvest / monthTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* ---------- Cabecera ---------- */}
      <section className="space-y-4">
        <div>
          <p className="hero-num">{eur(monthTotal)}</p>
          <p className="hero-sub mt-2">ahorrado en {monthLong(y, m)}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rate !== null ? (
            <span className={`chip ${rate >= 20 ? '!text-[#8BE8B4]' : rate >= 10 ? '!text-amber' : '!text-[#FF9A8A]'}`}>
              {rate.toFixed(0)}% DE TUS INGRESOS
            </span>
          ) : null}
          <span className="chip">ACUMULADO <b>{eur(totalAll)}</b></span>
          {milestone && <span className="ribbon">HITO · {milestone.toLocaleString('es-ES', { useGrouping: 'always' } as Intl.NumberFormatOptions)} € AHORRADOS</span>}
        </div>
        <button onClick={() => setIncomeOpen(true)} className="glass w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
          <span>
            <span className="mono text-[10px] text-ink/55 block">INGRESOS DE {monthLong(y, m).toUpperCase()}</span>
            <span className="font-extrabold">{income !== null ? eur(income) : 'Añade lo que cobras para ver tu tasa de ahorro'}</span>
          </span>
          <span className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center shrink-0" aria-hidden="true">✎</span>
        </button>
      </section>

      {state.savings.length === 0 ? (
        <div className="glass p-6 space-y-3 text-center">
          <p className="display text-2xl">Empieza a apartar.</p>
          <p className="text-sm text-ink/65">
            Apunta lo que metes cada mes y en qué: inversión, fondo de emergencia, un viaje… Verás cuánto tienes invertido y cuánto en otros ahorros.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <button onClick={() => setEntryEditor({})} className="btn-3d">Añadir aportación</button>
            <button
              onClick={() => setState((s) => ({ ...s, ...seedSavings(), income: Object.keys(s.income).length ? s.income : seedSavings().income }))}
              className="px-5 py-3 rounded-full bg-ink/8 font-bold"
            >
              Ver un ejemplo
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ---------- Reparto del mes ---------- */}
          <section className="slab p-5 space-y-5">
            <div className="flex items-baseline justify-between">
              <h2 className="display text-xl text-paper">¿Dónde va?</h2>
              <span className="mono text-xs text-paper">{monthShort(y, m)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex h-4 rounded-full overflow-hidden bg-[#2A2A2A]" role="img" aria-label={`${investPct.toFixed(0)}% invertido, ${(100 - investPct).toFixed(0)}% en otros ahorros`}>
                <div className="h-full bg-amber transition-all duration-500" style={{ width: `${investPct}%` }} />
                <div className="h-full bg-paper/85 transition-all duration-500" style={{ width: `${monthTotal > 0 ? 100 - investPct : 0}%` }} />
              </div>
              <div className="flex justify-between gap-3">
                <div>
                  <p className="mono text-[10px] text-amber">INVERTIDO · {investPct.toFixed(0)}%</p>
                  <p className="display text-lg text-paper tabular-nums">{eur(monthInvest)}</p>
                </div>
                <div className="text-right">
                  <p className="mono text-[10px] text-paper/70">OTROS AHORROS · {monthTotal > 0 ? (100 - investPct).toFixed(0) : 0}%</p>
                  <p className="display text-lg text-paper tabular-nums">{eur(monthOther)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {byBucket.map(({ b, month, total }) => (
                <div key={b.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 flex items-center gap-3 p-2">
                    <IconTile icon={{ kind: 'emoji', emoji: b.emoji, color: b.color }} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-paper text-sm truncate">
                          {b.label}
                          {b.invest && <span className="ml-1.5 mono text-[9px] text-ink bg-amber rounded px-1 py-[1px] align-middle">INV</span>}
                        </span>
                        <span className="font-bold text-paper text-sm tabular-nums shrink-0">{eur(month)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-[5px] rounded-full bg-[#2A2A2A] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${monthTotal ? (month / monthTotal) * 100 : 0}%`, background: b.color }} />
                        </div>
                        <span className="mono text-[10px] text-mute shrink-0">TOTAL {eur(total)}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setBucketEditor({ bucket: b })} className="w-9 h-9 rounded-full text-mute hover:text-paper hover:bg-[#2A2A2A] shrink-0" aria-label={`Editar ${b.label}`}>
                    ✎
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setBucketEditor({})} className="w-full py-3 rounded-2xl border-2 border-dashed border-[#3A3A3A] text-mute hover:text-paper hover:border-mute font-bold text-sm">
              + Nuevo destino de ahorro
            </button>
          </section>

          {/* ---------- Últimos 6 meses ---------- */}
          <section className="slab p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="display text-xl text-paper">Últimos 6 meses</h2>
              <span className="mono text-[10px] text-mute flex items-center gap-3">
                <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-amber inline-block" /> INVERSIÓN</span>
                <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-paper/85 inline-block" /> OTROS</span>
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2 items-end h-36">
              {history.map((h, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full gap-1">
                  <span className={`mono text-[9px] ${i === 5 ? 'text-paper' : 'text-mute'}`}>{h.total ? Math.round(h.total) : ''}</span>
                  <div className="w-full max-w-[34px] flex flex-col justify-end rounded-[10px] overflow-hidden bg-[#202020]" style={{ height: `${(h.total / maxHist) * 100}%`, minHeight: 4 }}>
                    <div className="bg-paper/85" style={{ height: `${h.total ? (h.other / h.total) * 100 : 0}%` }} />
                    <div className="bg-amber" style={{ height: `${h.total ? (h.invest / h.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {history.map((h, i) => (
                <span key={i} className={`mono text-[10px] text-center ${i === 5 ? 'text-amber' : 'text-mute'}`}>{h.label}</span>
              ))}
            </div>
          </section>

          {/* ---------- Aportaciones ---------- */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="page-h2">Aportaciones</h2>
              <span className="page-meta">{monthEntries.length} EN {monthShort(y, m)}</span>
            </div>
            {monthEntries.length === 0 && (
              <div className="glass p-6 text-center">
                <p className="font-bold">Este mes aún no has apartado nada.</p>
                <p className="text-sm text-ink/60 mt-1">Pulsa el botón amarillo para añadir una aportación.</p>
              </div>
            )}
            {monthEntries.map(({ e, day }) => {
              const b = bucketOf(e.bucket);
              const future = isCurrentMonth && day > now.getDate();
              return (
                <button key={e.id} onClick={() => setEntryEditor({ entry: e })} className="glass w-full flex items-center gap-3 p-3 text-left">
                  <IconTile icon={{ kind: 'emoji', emoji: b?.emoji ?? '🏦', color: b?.color ?? '#4CC38A' }} size={46} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-extrabold truncate">{e.name}</p>
                      <p className="font-extrabold tabular-nums shrink-0 text-[#1F7A4D]">+{eur(e.amount)}</p>
                    </div>
                    <p className="mono text-[10px] text-ink/55 truncate mt-0.5">
                      {e.recurring ? 'AUTOMÁTICA' : 'PUNTUAL'} · {future ? `PREVISTA DÍA ${day}` : `DÍA ${day}`} · {(b?.label ?? '').toUpperCase()}
                    </p>
                  </div>
                </button>
              );
            })}
          </section>
        </>
      )}

      {/* ---------- Botón principal ---------- */}
      <div className="fab-wrap">
        <button onClick={() => setEntryEditor({})} className="fab" aria-label="Añadir aportación">
          <span className="text-4xl leading-none font-black">+</span>
        </button>
      </div>

      {entryEditor && (
        <SavingSheet
          initial={entryEditor.entry}
          buckets={buckets}
          defaultDate={`${y}-${pad(m + 1)}-${pad(isCurrentMonth ? now.getDate() : 1)}`}
          onSave={saveEntry}
          onDelete={entryEditor.entry ? () => deleteEntry(entryEditor.entry!) : undefined}
          onClose={() => setEntryEditor(null)}
        />
      )}
      {bucketEditor && (
        <GroupSheet
          kind="destino"
          initial={bucketEditor.bucket}
          toggle={{ label: 'Cuenta como inversión', hint: 'Fondos, bolsa, planes de pensiones, cripto…', value: bucketEditor.bucket?.invest ?? false }}
          onSave={saveBucket}
          onDelete={bucketEditor.bucket && bucketEditor.bucket.id !== FALLBACK_BUCKET_ID ? () => deleteBucket(bucketEditor.bucket!) : undefined}
          onClose={() => setBucketEditor(null)}
        />
      )}
      {incomeOpen && (
        <IncomeSheet
          monthName={monthLong(y, m)}
          initial={state.income[mk] ?? income ?? undefined}
          hasOwnValue={mk in state.income}
          onSave={(v) => {
            setState((s) => {
              const next = { ...s.income };
              if (v === null) delete next[mk];
              else next[mk] = v;
              return { ...s, income: next };
            });
            setIncomeOpen(false);
          }}
          onClose={() => setIncomeOpen(false)}
        />
      )}
    </div>
  );
}

function SavingSheet({
  initial,
  buckets,
  defaultDate,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: SavingEntry;
  buckets: SavingsBucket[];
  defaultDate: string;
  onSave: (e: SavingEntry) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace('.', ',') : '');
  const [bucket, setBucket] = useState(initial?.bucket ?? buckets[0]?.id ?? FALLBACK_BUCKET_ID);
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [recurring, setRecurring] = useState(initial?.recurring ?? false);
  const value = parseFloat(amount.replace(',', '.'));
  const valid = value > 0 && date !== '';
  const b = buckets.find((x) => x.id === bucket);

  return (
    <Sheet title={initial ? 'Editar aportación' : 'Nueva aportación'} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!valid) return;
          onSave({
            id: initial?.id ?? uid(),
            name: name.trim() || b?.label || 'Ahorro',
            amount: Math.round(value * 100) / 100,
            bucket,
            date,
            recurring,
          });
        }}
      >
        <div className="flex items-center gap-3">
          <IconTile icon={{ kind: 'emoji', emoji: b?.emoji ?? '🏦', color: b?.color ?? '#4CC38A' }} size={60} />
          <input id="saving-amount" className="field flex-1 text-2xl font-black tabular-nums" placeholder="0,00 €" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus={!initial} />
        </div>
        <div className="space-y-1">
          <span className="mono text-[10px] text-ink/60">¿A DÓNDE VA?</span>
          <div className="flex flex-wrap gap-2">
            {buckets.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setBucket(x.id)}
                className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-bold border transition ${bucket === x.id ? 'bg-ink text-paper border-ink' : 'bg-white/50 border-ink/15'}`}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ background: x.color }}>{x.emoji}</span>
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1" htmlFor="saving-name">
            <span className="mono text-[10px] text-ink/60">CONCEPTO (OPCIONAL)</span>
            <input id="saving-name" className="field w-full" placeholder={b?.invest ? 'Fondo indexado' : 'Hucha viaje'} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="space-y-1" htmlFor="saving-date">
            <span className="mono text-[10px] text-ink/60">{recurring ? 'PRIMERA VEZ' : 'FECHA'}</span>
            <input id="saving-date" type="date" className="field w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <ToggleRow label="Transferencia automática cada mes" hint="Págate primero: el día que cobras, sin pensarlo." value={recurring} onChange={setRecurring} />
        <div className="flex gap-3">
          {onDelete && (
            <button type="button" onClick={onDelete} className="px-5 py-3.5 rounded-full bg-[#D93A2E]/10 text-[#B3261E] font-extrabold">
              Eliminar
            </button>
          )}
          <button type="submit" disabled={!valid} className="btn-3d flex-1">
            {initial ? 'Guardar cambios' : 'Guardar aportación'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

function IncomeSheet({
  monthName,
  initial,
  hasOwnValue,
  onSave,
  onClose,
}: {
  monthName: string;
  initial?: number;
  hasOwnValue: boolean;
  onSave: (v: number | null) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(initial !== undefined ? String(initial).replace('.', ',') : '');
  const value = parseFloat(amount.replace(',', '.'));
  return (
    <Sheet title="Ingresos" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (value > 0) onSave(Math.round(value * 100) / 100);
        }}
      >
        <label className="space-y-1 block" htmlFor="income-amount">
          <span className="mono text-[10px] text-ink/60">LO QUE COBRAS EN {monthName.toUpperCase()} (NETO)</span>
          <input id="income-amount" className="field w-full text-2xl font-black tabular-nums" placeholder="0,00 €" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </label>
        <p className="text-xs text-ink/60">Se aplica a este mes y a los siguientes hasta que lo cambies. Sirve para calcular tu tasa de ahorro y la regla 50/30/20.</p>
        <div className="flex gap-3">
          {hasOwnValue && (
            <button type="button" onClick={() => onSave(null)} className="px-5 py-3.5 rounded-full bg-ink/8 font-bold">
              Quitar
            </button>
          )}
          <button type="submit" disabled={!(value > 0)} className="btn-3d flex-1">Guardar</button>
        </div>
      </form>
    </Sheet>
  );
}
