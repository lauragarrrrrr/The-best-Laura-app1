'use client';

import React, { useState } from 'react';
import { SWATCHES, eur, uid } from './data';
import { EmojiColorPicker, IconTile } from './icons';

export function CheckMark({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.5l5 5L19.5 7" />
    </svg>
  );
}

/** Botón de "pagado" táctil: cuadrado hundido cuando está marcado. */
export function PaidToggle({ paid, onClick, label }: { paid: boolean; onClick: () => void; label: string }) {
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

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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

export function Donut({
  slices,
  total,
  selected,
  onSelect,
}: {
  slices: { cat: Group; value: number }[];
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
/* Hoja: añadir / editar categoría o destino de ahorro                 */
/* ------------------------------------------------------------------ */

export type Group = { id: string; label: string; emoji: string; color: string };

export function GroupSheet<T extends Group>({
  kind,
  initial,
  toggle,
  onSave,
  onDelete,
  onClose,
}: {
  /** "categoría" o "destino" */
  kind: string;
  initial?: T;
  /** Interruptor opcional (gasto necesario, cuenta como inversión…) */
  toggle?: { label: string; hint: string; value: boolean };
  onSave: (g: Group, toggleValue: boolean) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✨');
  const [color, setColor] = useState(initial?.color ?? SWATCHES[0]);
  const [flag, setFlag] = useState(toggle?.value ?? false);
  const valid = label.trim() !== '';

  return (
    <Sheet title={initial ? `Editar ${kind}` : `Nuevo ${kind === 'categoría' ? 'categoría' : kind}`.replace('Nuevo categoría', 'Nueva categoría')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!valid) return;
          onSave({ id: initial?.id ?? `g_${uid()}`, label: label.trim(), emoji, color }, flag);
        }}
      >
        <div className="flex items-center gap-3">
          <IconTile icon={{ kind: 'emoji', emoji, color }} size={60} />
          <input id="group-name" className="field flex-1 text-base font-bold" placeholder={kind === 'categoría' ? 'Nombre (ej. Mascotas)' : 'Nombre (ej. Cripto)'} value={label} onChange={(e) => setLabel(e.target.value)} autoFocus={!initial} />
        </div>
        <EmojiColorPicker
          emoji={emoji}
          color={color}
          onChange={(em, c) => {
            setEmoji(em);
            setColor(c);
          }}
        />
        {toggle && <ToggleRow label={toggle.label} hint={toggle.hint} value={flag} onChange={setFlag} />}
        <div className="flex gap-3">
          {onDelete && (
            <button type="button" onClick={onDelete} className="px-5 py-3.5 rounded-full bg-[#D93A2E]/10 text-[#B3261E] font-extrabold">
              Eliminar
            </button>
          )}
          <button type="submit" disabled={!valid} className="btn-3d flex-1">
            {initial ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

/** Fila con casilla táctil (se repite cada mes, cuenta como inversión…). */
export function ToggleRow({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-ink/10 text-left"
      aria-pressed={value}
    >
      <span className={`w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 ${value ? 'bg-ink text-paper' : 'border-2 border-ink/70'}`}>
        {value && <CheckMark size={14} />}
      </span>
      <span className="text-sm">
        <b>{label}</b>
        <span className="block text-ink/60 text-xs">{hint}</span>
      </span>
    </button>
  );
}

/** Confirmación dentro de la página (window.confirm está bloqueado en algunos visores). */
export type PendingConfirm = { message: string; action: string; run: () => void };

export function ConfirmDialog({ pending, onClose }: { pending: PendingConfirm; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={onClose} role="alertdialog" aria-modal="true">
      <div className="w-full max-w-sm bg-paper text-ink rounded-[28px] p-5 space-y-4 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <p className="font-bold leading-snug">{pending.message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full bg-ink/8 font-bold" autoFocus>
            Cancelar
          </button>
          <button
            onClick={() => {
              pending.run();
              onClose();
            }}
            className="flex-1 py-3 rounded-full bg-[#D93A2E] text-white font-extrabold"
          >
            {pending.action}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Pestañas tipo píldora sobre losa negra. */
export function Segmented<T extends string>({ options, value, onChange, size = 'md' }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; size?: 'md' | 'sm' }) {
  return (
    <div className="grid gap-1 p-1 rounded-full bg-slab backdrop-blur-xl border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`${size === 'sm' ? 'py-2 text-xs' : 'py-3 text-sm'} rounded-full font-extrabold transition-all ${value === o.id ? 'bg-paper text-ink' : 'text-mute hover:text-paper'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Curva de ritmo: gasto por día suavizado, con pico y "hoy"           */
/* ------------------------------------------------------------------ */

export function RhythmCurve({ values, today }: { values: number[]; today?: number }) {
  const n = values.length;
  const W = 340;
  const H = 170;
  const padX = 10;
  const top = 44;
  const bottom = H - 26;

  // suavizado gaussiano para que el ritmo se lea como olas, no como picos sueltos
  const sigma = 2.1;
  const smooth = values.map((_, i) => {
    let acc = 0;
    let wsum = 0;
    for (let j = Math.max(0, i - 7); j <= Math.min(n - 1, i + 7); j++) {
      const w = Math.exp(-((i - j) ** 2) / (2 * sigma * sigma));
      acc += values[j] * w;
      wsum += w;
    }
    return acc / wsum;
  });
  const max = Math.max(...smooth, 1);
  const x = (i: number) => padX + (i / Math.max(n - 1, 1)) * (W - padX * 2);
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const pts = smooth.map((v, i) => [x(i), y(v)] as const);

  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    line += ` C ${c1[0]} ${Math.min(c1[1], bottom)} ${c2[0]} ${Math.min(c2[1], bottom)} ${p2[0]} ${p2[1]}`;
  }
  const area = `${line} L ${pts[n - 1][0]} ${bottom} L ${pts[0][0]} ${bottom} Z`;

  // el pico se marca en el día real de más gasto
  const peak = values.reduce((best, v, i) => (v > values[best] ? i : best), 0);
  const peakX = x(peak);
  const peakY = y(smooth[peak]);
  const labelX = Math.min(Math.max(peakX, 44), W - 44);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Pico de gasto el día ${peak + 1}: ${eur(values[peak])}`}>
      <defs>
        <linearGradient id="rhythm-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD15C" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#EAA7E2" stopOpacity="0.85" />
          <stop offset="85%" stopColor="#6A3BFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#6A3BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={padX} x2={W - padX} y1={bottom} y2={bottom} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d={area} fill="url(#rhythm-fill)" />
      <path d={line} fill="none" stroke="#F4F1EC" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={peakX} x2={peakX} y1={peakY} y2={bottom} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
      <text x={labelX} y={peakY - 22} textAnchor="middle" fill="#9A9A9A" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.6">PICO</text>
      <text x={labelX} y={peakY - 9} textAnchor="middle" fill="#F4F1EC" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
        DÍA {peak + 1} · {eur(values[peak]).replace(/,\d\d/, '')}
      </text>
      {today !== undefined && today >= 1 && today <= n && (
        <g>
          <line x1={x(today - 1)} x2={x(today - 1)} y1={top - 6} y2={bottom} stroke="#F5B13D" strokeWidth="1" strokeDasharray="3 3" />
          <text x={x(today - 1)} y={bottom + 16} textAnchor="middle" fill="#F5B13D" fontSize="9" fontFamily="var(--font-mono)">HOY</text>
        </g>
      )}
      <text x={padX} y={bottom + 16} fill="#9A9A9A" fontSize="9" fontFamily="var(--font-mono)">1</text>
      <text x={W - padX} y={bottom + 16} textAnchor="end" fill="#9A9A9A" fontSize="9" fontFamily="var(--font-mono)">{n}</text>
    </svg>
  );
}

/** Escenas de fondo: una por pestaña, con fundido entre ellas. */
export function Scenes({ active }: { active: string }) {
  return (
    <div className="scenes" aria-hidden="true">
      {['gastos', 'ahorro', 'consejos', 'aprende'].map((s) => (
        <div key={s} className={`scene scene-${s}`} style={{ opacity: active === s ? 1 : 0 }} />
      ))}
    </div>
  );
}
