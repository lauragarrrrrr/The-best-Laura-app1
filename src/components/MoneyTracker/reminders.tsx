'use client';

import React, { useEffect, useState } from 'react';
import { daysInMonth, dayInMonth, eur, goalStatus, monthKey, pad, parseDate, type MoneyState } from './data';

/* ------------------------------------------------------------------ */
/* Avisos del día (dentro de la app)                                   */
/* ------------------------------------------------------------------ */

export type Notice = { id: string; tone: 'hoy' | 'manana' | 'objetivo' | 'logro'; emoji: string; title: string; text: string };

export function todayNotices(state: MoneyState, now = new Date()): Notice[] {
  const out: Notice[] = [];
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const tomorrow = new Date(y, m, d + 1);
  const mk = monthKey(y, m);

  for (const e of state.expenses.filter((x) => x.recurring)) {
    if (dayInMonth(e, y, m) === d) {
      const paid = !!state.paid[`${e.id}:${mk}`];
      out.push({
        id: `hoy-${e.id}`, tone: 'hoy', emoji: '💳',
        title: paid ? `${e.name} cobrado` : `Hoy se cobra ${e.name}`,
        text: paid ? `${eur(e.amount)} · ya lo has marcado como pagado.` : `${eur(e.amount)}. Cuando lo veas en el banco, márcalo como pagado.`,
      });
    }
    if (dayInMonth(e, tomorrow.getFullYear(), tomorrow.getMonth()) === tomorrow.getDate()) {
      out.push({ id: `man-${e.id}`, tone: 'manana', emoji: '⏰', title: `Mañana se cobra ${e.name}`, text: `${eur(e.amount)}. Revisa que tienes saldo.` });
    }
  }

  for (const b of state.buckets) {
    const g = goalStatus(b, state.savings, now);
    if (!g) continue;
    if (g.status === 'done') {
      out.push({ id: `goal-${b.id}`, tone: 'logro', emoji: b.emoji, title: `¡${b.label}: conseguido!`, text: `Tienes ${eur(g.saved)} de ${eur(g.target)}.` });
    } else if (g.status === 'overdue') {
      out.push({ id: `goal-${b.id}`, tone: 'objetivo', emoji: b.emoji, title: `${b.label}: la fecha ya pasó`, text: `Te faltaron ${eur(g.remaining)}. Puedes cambiar la fecha o el importe.` });
    } else if (g.daysLeft <= 30) {
      out.push({ id: `goal-${b.id}`, tone: 'objetivo', emoji: b.emoji, title: `${b.label} en ${g.daysLeft} ${g.daysLeft === 1 ? 'día' : 'días'}`, text: `Te faltan ${eur(g.remaining)} para llegar a ${eur(g.target)}.` });
    } else if (g.status === 'behind') {
      out.push({ id: `goal-${b.id}`, tone: 'objetivo', emoji: b.emoji, title: `${b.label}: vas por detrás`, text: `Necesitas apartar ${eur(g.perMonthNeeded)} al mes y ahora apartas ${eur(g.monthlyPlanned)}.` });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Eventos de calendario con recordatorios                             */
/* ------------------------------------------------------------------ */

export type CalEvent = {
  key: string;
  summary: string;
  description: string;
  /** Hora local, sin zona: YYYY-MM-DDTHH:MM:SS */
  start: string;
  end: string;
  rrule?: string;
  /** Minutos de antelación de cada aviso */
  reminders: number[];
};

const at = (dt: Date, h: number, min = 0) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(h)}:${pad(min)}:00`;

export function calendarEvents(state: MoneyState, now = new Date()): CalEvent[] {
  const events: CalEvent[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const e of state.expenses.filter((x) => x.recurring)) {
    const day = parseDate(e.date).d;
    // primera fecha de cobro a partir de mañana (para que el aviso del día antes llegue)
    let first = new Date(today.getFullYear(), today.getMonth(), Math.min(day, daysInMonth(today.getFullYear(), today.getMonth())));
    if (first <= today) {
      const nm = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      first = new Date(nm.getFullYear(), nm.getMonth(), Math.min(day, daysInMonth(nm.getFullYear(), nm.getMonth())));
    }
    events.push({
      key: `exp:${e.id}`,
      summary: `💳 ${e.name} · ${eur(e.amount)}`,
      description: `Hoy se cobra ${e.name} (${eur(e.amount)}). Recordatorio creado desde The best Laura.`,
      start: at(first, 9),
      end: at(first, 9, 15),
      // los días 29-31 no existen todos los meses: entonces el último día del mes
      rrule: day > 28 ? 'RRULE:FREQ=MONTHLY;BYMONTHDAY=-1' : `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`,
      reminders: [24 * 60, 0],
    });
  }

  for (const b of state.buckets) {
    const g = goalStatus(b, state.savings, now);
    if (!g || g.status === 'done' || g.daysLeft < 1) continue;
    events.push({
      key: `goal:${b.id}`,
      summary: `${b.emoji} ${b.label}: fecha objetivo (${eur(g.target)})`,
      description: `Tu objetivo «${b.label}» es reunir ${eur(g.target)} para hoy. Recordatorio creado desde The best Laura.`,
      start: at(g.deadline, 10),
      end: at(g.deadline, 10, 30),
      reminders: [30 * 24 * 60, 7 * 24 * 60, 24 * 60].filter((mins) => mins < g.daysLeft * 24 * 60),
    });
    if (g.monthsLeft >= 1 && g.perMonthNeeded > 0) {
      const firstOfNext = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const until = new Date(g.deadline.getFullYear(), g.deadline.getMonth(), g.deadline.getDate());
      events.push({
        key: `goalm:${b.id}`,
        summary: `${b.emoji} Aparta ${eur(Math.ceil(g.perMonthNeeded))} para ${b.label}`,
        description: `Para llegar a ${eur(g.target)} el ${until.toLocaleDateString('es-ES')}. Recordatorio creado desde The best Laura.`,
        start: at(firstOfNext, 9),
        end: at(firstOfNext, 9, 15),
        rrule: `RRULE:FREQ=MONTHLY;BYMONTHDAY=1;UNTIL=${until.getFullYear()}${pad(until.getMonth() + 1)}${pad(until.getDate())}T235959`,
        reminders: [0],
      });
    }
  }
  return events;
}

export const eventSignature = (e: CalEvent) => JSON.stringify([e.summary, e.start, e.rrule ?? '', e.reminders]);

/** Archivo .ics (iPhone, Google Calendar, Outlook) con los mismos eventos y avisos. */
export function buildIcs(events: CalEvent[]): string {
  const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const stamp = (iso: string) => iso.replace(/[-:]/g, '');
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The best Laura//Gastos//ES', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:The best Laura · Recordatorios'];
  for (const e of events) {
    lines.push('BEGIN:VEVENT', `UID:${e.key.replace(/[^a-z0-9]/gi, '-')}@thebestlaura`, `DTSTAMP:${dtstamp}`, `DTSTART:${stamp(e.start)}`, `DTEND:${stamp(e.end)}`, `SUMMARY:${esc(e.summary)}`, `DESCRIPTION:${esc(e.description)}`);
    if (e.rrule) lines.push(e.rrule);
    for (const mins of e.reminders) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.summary)}`, `TRIGGER:${mins === 0 ? 'PT0M' : `-PT${mins}M`}`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/* ------------------------------------------------------------------ */
/* Tarjeta "Avisos en tu móvil"                                         */
/* ------------------------------------------------------------------ */

type McpLike = { callTool: (server: string, tool: string, input?: unknown) => Promise<unknown> };
type ClaudeLike = { use?: (name: string) => Promise<unknown> };

const SERVER = 'Google Calendar';

function errorText(code: string | undefined, message?: string) {
  switch (code) {
    case 'server_not_connected':
    case 'server_not_found':
      return 'No tienes Google Calendar conectado. Añádelo en claude.ai → Ajustes → Conectores y vuelve a pulsar.';
    case 'needs_reauth':
      return 'Tu conexión con Google Calendar ha caducado. Vuelve a conectarlo en claude.ai → Ajustes → Conectores.';
    case 'selection_required':
      return 'Tienes más de un Google Calendar conectado: elige cuál usar en el aviso de claude.ai y vuelve a pulsar.';
    case 'not_in_manifest':
    case 'approval_required':
    case 'consent_required':
      return 'Hace falta tu permiso para usar Google Calendar. Vuelve a pulsar y acepta el aviso.';
    case 'blocked_by_policy':
      return 'Tu organización no permite usar Google Calendar desde aquí.';
    case 'server_unavailable':
    case 'upstream_error':
      return 'Google Calendar no ha respondido. Puede que el último recordatorio se haya creado: revisa tu calendario antes de volver a pulsar.';
    case 'tool_error':
      return `Google Calendar no ha podido crear un recordatorio${message ? `: ${message}` : '.'}`;
    default:
      return 'No se han podido crear los recordatorios en esta vista.';
  }
}

export function CalendarSync({ state, setState }: { state: MoneyState; setState: React.Dispatch<React.SetStateAction<MoneyState>> }) {
  // 'checking' → buscando el conector; 'mcp' → enlace de claude.ai; 'ics' → app normal; 'none' → nada disponible
  const [mode, setMode] = useState<'checking' | 'mcp' | 'ics' | 'none'>('checking');
  const [mcp, setMcp] = useState<McpLike | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const claude = (window as unknown as { claude?: ClaudeLike }).claude;
    if (!claude?.use) {
      setTimeout(() => setMode('ics'), 0);
      return;
    }
    let alive = true;
    claude
      .use('mcp')
      .then((ns) => {
        if (!alive) return;
        if (ns) {
          setMcp(ns as McpLike);
          setMode('mcp');
        } else setMode('none');
      })
      .catch(() => alive && setMode('none'));
    return () => {
      alive = false;
    };
  }, []);

  const events = calendarEvents(state);
  const pending = events.filter((e) => state.calendarSynced[e.key] !== eventSignature(e));
  const bills = events.filter((e) => e.key.startsWith('exp:')).length;
  const goals = events.filter((e) => e.key.startsWith('goal:')).length;

  const syncGoogle = async () => {
    if (!mcp || busy || pending.length === 0) return;
    setBusy(true);
    setMessage(null);
    setProgress({ done: 0, total: pending.length });
    let done = 0;
    for (const e of pending) {
      try {
        await mcp.callTool(SERVER, 'create_event', {
          summary: e.summary,
          description: e.description,
          startTime: e.start,
          endTime: e.end,
          ...(e.rrule ? { recurrenceData: [e.rrule] } : {}),
          useDefaultReminders: false,
          overrideReminders: e.reminders.map((minutes) => ({ method: 'popup', minutes })),
        });
        done += 1;
        setProgress({ done, total: pending.length });
        setState((s) => ({ ...s, calendarSynced: { ...s.calendarSynced, [e.key]: eventSignature(e) } }));
      } catch (err) {
        const er = err as { code?: string; message?: string };
        setMessage({ kind: 'error', text: `${done ? `Se crearon ${done} de ${pending.length}. ` : ''}${errorText(er.code, er.code === 'tool_error' ? er.message : undefined)}` });
        setBusy(false);
        return;
      }
    }
    setBusy(false);
    setMessage({ kind: 'ok', text: `Listo: ${done} ${done === 1 ? 'recordatorio añadido' : 'recordatorios añadidos'} a tu Google Calendar. Te avisará en el móvil.` });
  };

  const downloadIcs = () => {
    const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recordatorios-the-best-laura.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setState((s) => ({ ...s, calendarSynced: Object.fromEntries(events.map((e) => [e.key, eventSignature(e)])) }));
    setMessage({ kind: 'ok', text: 'Ábrelo para añadir los recordatorios a tu calendario (en iPhone, pulsa «Añadir todo»).' });
  };

  return (
    <section className="slab p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 rounded-2xl bg-amber/15 text-amber flex items-center justify-center text-xl shrink-0" aria-hidden="true">🔔</span>
        <div className="min-w-0">
          <h2 className="display text-lg text-paper">Avisos en tu móvil</h2>
          <p className="text-[13px] text-mute leading-snug">
            Un evento por cada recibo con aviso <b className="text-paper/90 font-semibold">el día antes</b> y <b className="text-paper/90 font-semibold">el mismo día</b> a las 9:00, y recordatorios de tus objetivos.
          </p>
        </div>
      </div>
      <p className="mono text-[10px] text-mute">
        {bills} RECIBOS · {goals} {goals === 1 ? 'OBJETIVO' : 'OBJETIVOS'} · {pending.length === 0 ? 'TODO AÑADIDO' : `${pending.length} POR AÑADIR`}
      </p>

      {mode === 'mcp' && (
        <button onClick={syncGoogle} disabled={busy || pending.length === 0} className="btn-3d w-full disabled:opacity-50">
          {busy && progress ? `Añadiendo ${progress.done + 1} de ${progress.total}…` : pending.length === 0 ? 'Tus recordatorios están al día' : `Añadir ${pending.length} a Google Calendar`}
        </button>
      )}
      {mode === 'ics' && (
        <button onClick={downloadIcs} className="btn-3d w-full">Descargar recordatorios (.ics)</button>
      )}
      {mode === 'none' && <p className="text-[13px] text-mute">Los recordatorios de calendario no están disponibles en esta vista.</p>}
      {mode === 'checking' && <p className="text-[13px] text-mute">Comprobando tu calendario…</p>}

      {message && (
        <p className={`text-[13px] leading-snug rounded-xl px-3 py-2 ${message.kind === 'ok' ? 'bg-amber/10 text-paper' : 'bg-burgundy/30 text-[#F0C9CF]'}`} role="status">
          {message.text}
        </p>
      )}
      {mode === 'mcp' && (
        <p className="text-[11px] text-mute leading-snug">
          La primera vez claude.ai te pedirá permiso para usar tu Google Calendar. Si cambias o borras un recibo, borra también su evento antiguo en el calendario.
        </p>
      )}
    </section>
  );
}
