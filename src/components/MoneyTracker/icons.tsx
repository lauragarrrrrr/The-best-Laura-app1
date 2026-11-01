'use client';

import React, { useState } from 'react';
import {
  BRANDS, BRANDS_BY_SLUG, EMOJI_CHOICES, SWATCHES, detectBrand, inkOn, normalize,
  type Category, type Expense, type ExpenseIcon,
} from './data';

/** Icono efectivo de un gasto: el elegido, o el logo detectado por el nombre, o el de su categoría. */
export function resolveIcon(e: Pick<Expense, 'name' | 'icon' | 'category'>, categories: Category[]): ExpenseIcon {
  if (e.icon) return e.icon;
  const b = detectBrand(e.name);
  if (b) return { kind: 'brand', slug: b.slug };
  const cat = categories.find((c) => c.id === e.category);
  return { kind: 'emoji', emoji: cat?.emoji ?? '📦', color: cat?.color ?? '#9A958E' };
}

/** Baldosa cuadrada redondeada con el logo de la app o el emoji. */
export function IconTile({
  icon,
  size = 44,
  round = false,
  className = '',
}: {
  icon: ExpenseIcon;
  size?: number;
  round?: boolean;
  className?: string;
}) {
  const radius = round ? size / 2 : size * 0.3;
  if (icon.kind === 'brand') {
    const b = BRANDS_BY_SLUG.get(icon.slug);
    if (b) {
      const ink = inkOn(b.hex);
      return (
        <span
          className={`inline-flex items-center justify-center shrink-0 ring-1 ring-white/15 ${className}`}
          style={{ width: size, height: size, borderRadius: radius, background: b.hex }}
          title={b.title}
        >
          <svg viewBox="0 0 24 24" width={size * 0.52} height={size * 0.52} fill={ink} aria-hidden="true">
            <path d={b.path} />
          </svg>
        </span>
      );
    }
  }
  const e = icon.kind === 'emoji' ? icon : { emoji: '📦', color: '#9A958E' };
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: e.color,
        fontSize: size * 0.5,
        lineHeight: 1,
        boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
      aria-hidden="true"
    >
      {e.emoji}
    </span>
  );
}

/** Selector de emoji + color (lo usan gastos y categorías). */
export function EmojiColorPicker({
  emoji,
  color,
  onChange,
}: {
  emoji: string;
  color: string;
  onChange: (emoji: string, color: string) => void;
}) {
  const [custom, setCustom] = useState('');
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-1.5">
        {EMOJI_CHOICES.map((em) => (
          <button
            key={em}
            type="button"
            onClick={() => onChange(em, color)}
            className={`aspect-square rounded-xl text-xl flex items-center justify-center transition ${
              em === emoji ? 'bg-ink text-paper ring-2 ring-amber' : 'bg-ink/5 hover:bg-ink/10'
            }`}
            aria-label={`Emoji ${em}`}
          >
            {em}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2" htmlFor="custom-emoji">
        <span className="mono text-[11px] text-ink/60 shrink-0">OTRO EMOJI</span>
        <input
          id="custom-emoji"
          value={custom}
          onChange={(ev) => {
            const v = ev.target.value;
            setCustom(v);
            const first = Array.from(v.trim())[0];
            if (first) onChange(Array.from(v.trim()).slice(0, 2).join(''), color);
          }}
          placeholder="Pega o escribe uno 🦄"
          className="field flex-1"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(emoji, c)}
            className={`w-8 h-8 rounded-full border border-ink/15 transition ${c === color ? 'ring-2 ring-offset-2 ring-ink scale-110' : ''}`}
            style={{ background: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Selector completo del icono de un gasto: logo de app o emoji personalizado. */
export function IconPicker({
  name,
  value,
  fallback,
  onChange,
}: {
  name: string;
  /** Icono elegido explícitamente (undefined = automático) */
  value: ExpenseIcon | undefined;
  /** Icono automático si no se elige nada */
  fallback: ExpenseIcon;
  onChange: (icon: ExpenseIcon | undefined) => void;
}) {
  const current = value ?? fallback;
  const [tab, setTab] = useState<'logo' | 'emoji'>(current.kind === 'brand' ? 'logo' : 'emoji');
  const [query, setQuery] = useState('');
  const detected = detectBrand(name);

  const q = normalize(query);
  const brands = q ? BRANDS.filter((b) => b.aliases.some((a) => normalize(a).includes(q))) : BRANDS;
  const emojiState = current.kind === 'emoji' ? current : { emoji: '✨', color: '#F5A300' };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <IconTile icon={current} size={52} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm leading-tight">
            {current.kind === 'brand' ? BRANDS_BY_SLUG.get(current.slug)?.title : 'Emoji personalizado'}
          </p>
          <p className="mono text-[11px] text-ink/55">
            {value === undefined
              ? detected
                ? 'LOGO DETECTADO AUTOMÁTICAMENTE'
                : 'ICONO DE LA CATEGORÍA'
              : 'ELEGIDO POR TI'}
          </p>
        </div>
        {value !== undefined && (
          <button type="button" onClick={() => onChange(undefined)} className="mono text-[11px] underline text-ink/60">
            AUTO
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-ink/8">
        {(['logo', 'emoji'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`py-2 rounded-full text-xs font-bold transition ${tab === t ? 'bg-ink text-paper' : 'text-ink/60'}`}
          >
            {t === 'logo' ? 'Logo de app' : 'Emoji'}
          </button>
        ))}
      </div>

      {tab === 'logo' ? (
        <div className="space-y-2">
          <input
            id="brand-search"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Buscar app: Netflix, Glovo, Ryanair…"
            className="field w-full"
          />
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
            {brands.map((b) => {
              const active = current.kind === 'brand' && current.slug === b.slug;
              return (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => onChange({ kind: 'brand', slug: b.slug })}
                  className={`flex flex-col items-center gap-1 rounded-xl p-1 ${active ? 'bg-amber/25' : ''}`}
                  title={b.title}
                >
                  <IconTile icon={{ kind: 'brand', slug: b.slug }} size={38} />
                  <span className="text-[9px] leading-tight text-ink/70 truncate w-full text-center">{b.title}</span>
                </button>
              );
            })}
          </div>
          {brands.length === 0 && (
            <p className="text-xs text-ink/60 py-2">
              No tenemos el logo de esa app. Ponle un emoji desde la pestaña <b>Emoji</b>.
            </p>
          )}
        </div>
      ) : (
        <EmojiColorPicker
          emoji={emojiState.emoji}
          color={emojiState.color}
          onChange={(em, c) => onChange({ kind: 'emoji', emoji: em, color: c })}
        />
      )}
    </div>
  );
}
