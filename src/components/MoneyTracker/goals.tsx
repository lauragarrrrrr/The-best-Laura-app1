'use client';

import React, { useState } from 'react';
import {
  FALLBACK_BUCKET_ID, SWATCHES, eur, eurRound, goalStatus, pad, uid,
  type MoneyState, type SavingEntry, type SavingsBucket,
} from './data';
import { EmojiColorPicker, IconTile } from './icons';
import { SavingSheet } from './savings';
import { Sheet, type PendingConfirm } from './ui';

type Props = {
  state: MoneyState;
  setState: React.Dispatch<React.SetStateAction<MoneyState>>;
  setPending: (p: PendingConfirm) => void;
};

const STATUS: Record<'done' | 'ok' | 'behind' | 'overdue', { label: string; cls: string }> = {
  done: { label: 'CONSEGUIDO', cls: 'bg-amber text-ink' },
  ok: { label: 'VAS BIEN', cls: 'bg-[#4A3B31] text-paper' },
  behind: { label: 'VAS POR DETRÁS', cls: 'bg-burgundy text-paper' },
  overdue: { label: 'FECHA PASADA', cls: 'bg-[#6B6560] text-paper' },
};

const longDate = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

export function GoalsView({ state, setState, setPending }: Props) {
  const [editor, setEditor] = useState<{ goal?: SavingsBucket } | null>(null);
  const [contribute, setContribute] = useState<string | null>(null);
  const goals = state.buckets.filter((b) => b.goal);
  const now = new Date();

  const saveGoal = (b: SavingsBucket) => {
    setState((s) => {
      const exists = s.buckets.some((x) => x.id === b.id);
      return { ...s, buckets: exists ? s.buckets.map((x) => (x.id === b.id ? b : x)) : [...s.buckets, b] };
    });
    setEditor(null);
  };

  const deleteGoal = (b: SavingsBucket) => {
    const n = state.savings.filter((e) => e.bucket === b.id).length;
    setPending({
      message: n
        ? `¿Eliminar el objetivo «${b.label}»? Sus ${n} aportaciones se quedan en «Cuenta de ahorro».`
        : `¿Eliminar el objetivo «${b.label}»?`,
      action: 'Eliminar',
      run: () => {
        setState((s) => ({
          ...s,
          buckets: s.buckets.filter((x) => x.id !== b.id),
          savings: s.savings.map((e) => (e.bucket === b.id ? { ...e, bucket: FALLBACK_BUCKET_ID } : e)),
        }));
        setEditor(null);
      },
    });
  };

  const saveEntry = (e: SavingEntry) => {
    setState((s) => ({ ...s, savings: [...s.savings, e] }));
    setContribute(null);
  };

  const totalTarget = goals.reduce((a, b) => a + (b.goal?.target ?? 0), 0);
  const totalSaved = goals.reduce((a, b) => a + (goalStatus(b, state.savings, now)?.saved ?? 0), 0);

  return (
    <div className="space-y-6">
      <section>
        <p className="hero-num">{goals.length} {goals.length === 1 ? 'objetivo' : 'objetivos'}</p>
        <p className="hero-sub mt-2">
          {goals.length ? `Llevas ${eurRound(totalSaved)} de ${eurRound(totalTarget)}.` : 'Ponle fecha y cifra a lo que quieres.'}
        </p>
      </section>

      {goals.length === 0 && (
        <div className="glass p-6 space-y-3 text-center">
          <p className="display text-xl">¿Un viaje, un ordenador, la entrada de un piso?</p>
          <p className="text-sm text-ink/65">Crea un objetivo con lo que necesitas y para cuándo. Te diré cuánto apartar cada mes y te avisaré si vas por detrás.</p>
          <button onClick={() => setEditor({})} className="btn-3d">Crear mi primer objetivo</button>
        </div>
      )}

      {goals.map((b) => {
        const g = goalStatus(b, state.savings, now)!;
        const st = STATUS[g.status];
        return (
          <article key={b.id} className="slab p-5 space-y-4">
            <div className="flex items-start gap-3">
              <IconTile icon={{ kind: 'emoji', emoji: b.emoji, color: b.color }} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="display text-xl text-paper leading-tight">{b.label}</h2>
                  <span className={`mono text-[9px] px-2 py-[3px] rounded-full ${st.cls}`}>{st.label}</span>
                </div>
                <p className="mono text-[10px] text-mute mt-1">
                  {longDate(g.deadline).toUpperCase()} · {g.daysLeft >= 0 ? `FALTAN ${g.daysLeft} ${g.daysLeft === 1 ? 'DÍA' : 'DÍAS'}` : 'FECHA PASADA'}
                </p>
              </div>
              <button onClick={() => setEditor({ goal: b })} className="w-9 h-9 rounded-full text-mute hover:text-paper hover:bg-[#2E241D] shrink-0" aria-label={`Editar ${b.label}`}>
                ✎
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="display text-2xl text-paper tabular-nums">{eur(g.saved)}</span>
                <span className="mono text-xs text-mute">DE {eur(g.target)} · {Math.round(g.pct * 100)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#2E241D] overflow-hidden" role="progressbar" aria-valuenow={Math.round(g.pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${b.label}: ${Math.round(g.pct * 100)}%`}>
                <div className="h-full holo rounded-full transition-all duration-500" style={{ width: `${g.pct * 100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#2A211A] p-3">
                <p className="mono text-[9px] text-mute">TE FALTAN</p>
                <p className="font-bold tabular-nums">{eur(g.remaining)}</p>
              </div>
              <div className="rounded-2xl bg-[#2A211A] p-3">
                <p className="mono text-[9px] text-mute">{g.status === 'done' ? 'APARTAS AL MES' : 'NECESITAS AL MES'}</p>
                <p className={`font-bold tabular-nums ${g.status === 'behind' ? 'text-[#E3A1AB]' : ''}`}>
                  {eur(g.status === 'done' ? g.monthlyPlanned : g.perMonthNeeded)}
                </p>
              </div>
            </div>

            <p className="text-[13px] text-paper/75 leading-snug">
              {g.status === 'done' && 'Ya lo tienes. Si quieres, sube la cifra o crea el siguiente objetivo.'}
              {g.status === 'ok' && `Con tus ${eur(g.monthlyPlanned)} al mes llegas a tiempo.`}
              {g.status === 'behind' &&
                (g.monthlyPlanned > 0
                  ? `Ahora apartas ${eur(g.monthlyPlanned)} al mes: te faltarían unos ${eur(Math.max(g.remaining - g.monthlyPlanned * Math.max(g.monthsLeft, 1), 0))}. Sube la aportación o mueve la fecha.`
                  : 'Aún no tienes una aportación mensual para este objetivo. Programa una para llegar a tiempo.')}
              {g.status === 'overdue' && 'La fecha ya pasó sin llegar a la cifra. Cambia la fecha o el importe.'}
            </p>

            {g.status !== 'done' && (
              <button onClick={() => setContribute(b.id)} className="w-full py-3 rounded-full bg-paper text-ink font-bold text-sm">
                Aportar a «{b.label}»
              </button>
            )}
          </article>
        );
      })}

      {goals.length > 0 && (
        <button onClick={() => setEditor({})} className="w-full py-3 rounded-2xl border border-dashed border-[#43362C] text-mute hover:text-paper hover:border-mute font-bold text-sm">
          + Nuevo objetivo
        </button>
      )}

      {editor && (
        <GoalSheet initial={editor.goal} onSave={saveGoal} onDelete={editor.goal ? () => deleteGoal(editor.goal!) : undefined} onClose={() => setEditor(null)} />
      )}
      {contribute && (
        <SavingSheet
          buckets={state.buckets}
          defaultBucket={contribute}
          defaultDate={`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`}
          onSave={saveEntry}
          onClose={() => setContribute(null)}
        />
      )}
    </div>
  );
}

function GoalSheet({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: SavingsBucket;
  onSave: (b: SavingsBucket) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const nextYear = new Date().getFullYear() + 1;
  const [label, setLabel] = useState(initial?.label ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🧳');
  const [color, setColor] = useState(initial?.color ?? SWATCHES[1]);
  const [target, setTarget] = useState(initial?.goal ? String(initial.goal.target).replace('.', ',') : '');
  const [date, setDate] = useState(initial?.goal?.date ?? `${nextYear}-01-15`);
  const value = parseFloat(target.replace(',', '.'));
  const valid = label.trim() !== '' && value > 0 && date !== '';

  return (
    <Sheet title={initial ? 'Editar objetivo' : 'Nuevo objetivo'} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!valid) return;
          onSave({
            id: initial?.id ?? `goal_${uid()}`,
            label: label.trim(),
            emoji,
            color,
            invest: false,
            goal: { target: Math.round(value * 100) / 100, date },
          });
        }}
      >
        <div className="flex items-center gap-3">
          <IconTile icon={{ kind: 'emoji', emoji, color }} size={60} />
          <input id="goal-name" className="field flex-1 text-base font-bold" placeholder="Viaje a Roma, portátil nuevo…" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus={!initial} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1" htmlFor="goal-target">
            <span className="mono text-[10px] text-ink/60">CUÁNTO NECESITAS</span>
            <input id="goal-target" className="field w-full tabular-nums font-bold" placeholder="900 €" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          </label>
          <label className="space-y-1" htmlFor="goal-date">
            <span className="mono text-[10px] text-ink/60">PARA CUÁNDO</span>
            <input id="goal-date" type="date" className="field w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <EmojiColorPicker
          emoji={emoji}
          color={color}
          onChange={(em, c) => {
            setEmoji(em);
            setColor(c);
          }}
        />
        <p className="text-xs text-ink/60">Las aportaciones a este objetivo se apuntan en Ahorro (o con el botón «Aportar»). Puedes programar una transferencia mensual.</p>
        <div className="flex gap-3">
          {onDelete && (
            <button type="button" onClick={onDelete} className="px-5 py-3.5 rounded-full bg-burgundy/10 text-burgundy font-extrabold">
              Eliminar
            </button>
          )}
          <button type="submit" disabled={!valid} className="btn-3d flex-1">
            {initial ? 'Guardar cambios' : 'Crear objetivo'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
