'use client';

import React from 'react';
import { eur, eurRound, expensesForMonth, goalStatus, type MoneyState } from './data';
import { computeInsights } from './advice';
import { routeProgress } from './knowledge';
import { CalendarSync, todayNotices } from './reminders';

export type Section = 'gastos' | 'ahorro' | 'objetivos' | 'consejos' | 'aprende';

const TONE: Record<string, string> = {
  hoy: 'bg-amber text-ink',
  manana: 'bg-[#4A3B31] text-paper',
  objetivo: 'bg-burgundy text-paper',
  logro: 'bg-amber text-ink',
};
const TONE_LABEL: Record<string, string> = { hoy: 'HOY', manana: 'MAÑANA', objetivo: 'OBJETIVO', logro: 'LOGRO' };

export function HomeView({ state, setState, onOpen }: { state: MoneyState; setState: React.Dispatch<React.SetStateAction<MoneyState>>; onOpen: (s: Section) => void }) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const notices = todayNotices(state, now);

  const items = expensesForMonth(state.expenses, y, m);
  const spent = items.reduce((a, x) => a + x.e.amount, 0);
  const pendingBills = items.filter((x) => x.e.recurring && !state.paid[`${x.e.id}:${y}-${String(m + 1).padStart(2, '0')}`]).length;
  const saved = expensesForMonth(state.savings, y, m).reduce((a, x) => a + x.e.amount, 0);
  const goals = state.buckets.filter((b) => b.goal).map((b) => goalStatus(b, state.savings, now)!);
  const goalsDone = goals.filter((g) => g.status === 'done').length;
  const insights = computeInsights(state, y, m, now);
  const alerts = insights.filter((i) => i.tone === 'alerta' || i.tone === 'aviso').length;
  const route = routeProgress(state, now);

  const tiles: { id: Section; emoji: string; title: string; stat: string; wide?: boolean }[] = [
    { id: 'gastos', emoji: '💳', title: 'Gastos', stat: `${eur(spent)} este mes · ${pendingBills ? `${pendingBills} ${pendingBills === 1 ? 'recibo' : 'recibos'} por cobrar` : 'todo pagado'}`, wide: true },
    { id: 'ahorro', emoji: '🏦', title: 'Ahorro', stat: `${eurRound(saved)} este mes` },
    { id: 'objetivos', emoji: '🎯', title: 'Objetivos', stat: goals.length ? `${goalsDone} de ${goals.length} conseguidos` : 'Crea el primero' },
    { id: 'consejos', emoji: '💡', title: 'Consejos', stat: alerts ? `${alerts} ${alerts === 1 ? 'aviso' : 'avisos'}` : 'Todo en orden' },
    { id: 'aprende', emoji: '📚', title: 'Aprende', stat: `Nivel ${route.done} de ${route.total}` },
  ];

  return (
    <div className="space-y-7">
      <section>
        <p className="page-meta">{now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p>
        <p className="hero-num mt-2">Hola, Laura.</p>
        <p className="hero-sub mt-2">
          {notices.length ? `Tienes ${notices.length} ${notices.length === 1 ? 'aviso' : 'avisos'} para hoy.` : 'Hoy no hay nada pendiente.'}
        </p>
      </section>

      {notices.length > 0 && (
        <section className="space-y-2" aria-label="Avisos de hoy">
          {notices.map((n) => (
            <div key={n.id} className="glass flex items-center gap-3 p-3">
              <span className="w-10 h-10 rounded-[13px] bg-ink/5 flex items-center justify-center text-xl shrink-0" aria-hidden="true">{n.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`mono text-[9px] px-1.5 py-[2px] rounded-full ${TONE[n.tone]}`}>{TONE_LABEL[n.tone]}</span>
                  <p className="font-bold text-sm truncate">{n.title}</p>
                </div>
                <p className="text-[12px] text-ink/65 leading-snug mt-0.5">{n.text}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <nav className="grid grid-cols-2 gap-3" aria-label="Secciones">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpen(t.id)}
            className={`slab text-left p-4 flex flex-col gap-3 hover:border-[#F6F1EA]/20 transition ${t.wide ? 'col-span-2 flex-row items-center' : ''}`}
          >
            <span className="w-11 h-11 rounded-2xl bg-[#2E241D] flex items-center justify-center text-xl shrink-0" aria-hidden="true">{t.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="display text-lg text-paper block">{t.title}</span>
              <span className="mono text-[10px] text-mute block mt-0.5 leading-snug">{t.stat.toUpperCase()}</span>
            </span>
            {t.wide && <span className="text-amber text-xl" aria-hidden="true">→</span>}
          </button>
        ))}
      </nav>

      <CalendarSync state={state} setState={setState} />
    </div>
  );
}
