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
    <div className="grid gap-1 p-1 rounded-full bg-slab shadow-[0_8px_24px_rgba(0,0,0,0.25)]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="tablist">
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
