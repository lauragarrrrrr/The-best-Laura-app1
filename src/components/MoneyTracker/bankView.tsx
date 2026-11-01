'use client';

import React, { useMemo, useState } from 'react';
import { eur, eurRound, expensesForMonth, monthLong, monthShort, type MoneyState } from './data';
import { IconTile, resolveIcon } from './icons';
import {
  applyImport, buildMovements, convertToRecurring, detectMapping, detectRecurring, incomeByMonth, parseCsv, readBankFile, sampleStatement,
  type Cell, type Mapping, type Movement,
} from './bank';

type Props = {
  state: MoneyState;
  setState: React.Dispatch<React.SetStateAction<MoneyState>>;
  y: number;
  m: number;
};

const STATUS_LABEL: Record<Movement['status'], { label: string; cls: string }> = {
  nuevo: { label: 'NUEVO', cls: 'bg-amber text-ink' },
  recibo: { label: 'RECIBO', cls: 'bg-[#4A3B31] text-paper' },
  duplicado: { label: 'YA ESTABA', cls: 'bg-ink/10 text-ink/60' },
  ingreso: { label: 'INGRESO', cls: 'bg-[#7A4B2A] text-paper' },
};

export function BankView({ state, setState, y, m }: Props) {
  const [rows, setRows] = useState<Cell[][] | null>(null);
  const [map, setMap] = useState<Mapping | null>(null);
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [lastImport, setLastImport] = useState<{ count: number; bills: number; income: [string, number][] } | null>(null);
  const [query, setQuery] = useState('');

  const catOptions = state.categories;

  const start = (data: Cell[][], name: string) => {
    setError(null);
    setLastImport(null);
    const mp = detectMapping(data);
    if (!mp) {
      setError('No encuentro las columnas de fecha e importe en este archivo. Comprueba que es el extracto de movimientos (Excel o CSV) que descarga tu banco.');
      return;
    }
    const mv = buildMovements(data, mp, state);
    if (!mv.length) {
      setError('He leído el archivo pero no he encontrado movimientos con fecha e importe.');
      return;
    }
    setRows(data);
    setMap(mp);
    setMovements(mv);
    setFileName(name);
    setShowAll(false);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    try {
      start(await readBankFile(file), file.name);
    } catch {
      setError('No he podido leer el archivo. Prueba a descargarlo de nuevo en formato CSV o Excel (.xlsx).');
    } finally {
      setLoading(false);
    }
  };

  const remap = (patch: Partial<Mapping>) => {
    if (!rows || !map) return;
    const next = { ...map, ...patch };
    setMap(next);
    setMovements(buildMovements(rows, next, state));
  };

  const doImport = () => {
    if (!movements) return;
    const count = movements.filter((x) => x.include && x.amount < 0 && x.status !== 'duplicado').length;
    const bills = movements.filter((x) => x.status === 'recibo').length;
    setState((s) => applyImport(s, movements));
    setLastImport({ count, bills, income: incomeByMonth(movements) });
    setRows(null);
    setMap(null);
    setMovements(null);
  };

  const suggestions = useMemo(() => detectRecurring(state), [state]);

  // análisis del mes
  const monthItems = expensesForMonth(state.expenses, y, m);
  const oneOff = monthItems.filter((x) => !x.e.recurring);
  const byMerchant = new Map<string, { name: string; total: number; count: number; sample: (typeof monthItems)[number]['e'] }>();
  for (const { e } of monthItems) {
    const k = e.merchant ?? e.name.toUpperCase();
    const cur = byMerchant.get(k) ?? { name: e.name, total: 0, count: 0, sample: e };
    cur.total += e.amount;
    cur.count += 1;
    byMerchant.set(k, cur);
  }
  const top = [...byMerchant.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  const topMax = top[0]?.total ?? 1;
  const small = oneOff.filter((x) => x.e.amount < 6);
  const smallSum = small.reduce((a, x) => a + x.e.amount, 0);
  const now = new Date();
  const isCurrent = now.getFullYear() === y && now.getMonth() === m;
  const daysElapsed = isCurrent ? now.getDate() : new Date(y, m + 1, 0).getDate();
  const oneOffSum = oneOff.reduce((a, x) => a + x.e.amount, 0);
  const biggest = [...oneOff].sort((a, b) => b.e.amount - a.e.amount)[0];

  const bankMonth = monthItems
    .filter((x) => x.e.source === 'banco')
    .filter((x) => !query || x.e.name.toLowerCase().includes(query.toLowerCase()) || (x.e.merchant ?? '').toLowerCase().includes(query.toLowerCase()));

  const recategorize = (id: string, category: string) =>
    setState((s) => {
      const target = s.expenses.find((e) => e.id === id);
      if (!target) return s;
      const merchant = target.merchant;
      return {
        ...s,
        bankRules: merchant ? { ...s.bankRules, [merchant]: category } : s.bankRules,
        // se aplica a todos los movimientos importados del mismo comercio
        expenses: s.expenses.map((e) => (e.id === id || (merchant && e.source === 'banco' && e.merchant === merchant) ? { ...e, category } : e)),
      };
    });

  const headerCells = rows && map ? rows[map.header].map((c, i) => ({ i, label: String(c || `Columna ${i + 1}`) })) : [];
  const visible = movements ? (showAll ? movements : movements.slice(0, 25)) : [];
  const counts = movements
    ? {
        nuevo: movements.filter((x) => x.status === 'nuevo').length,
        recibo: movements.filter((x) => x.status === 'recibo').length,
        duplicado: movements.filter((x) => x.status === 'duplicado').length,
        ingreso: movements.filter((x) => x.status === 'ingreso').length,
        include: movements.filter((x) => x.include && x.amount < 0 && x.status !== 'duplicado').length,
      }
    : null;

  return (
    <div className="space-y-6">
      <section>
        <p className="hero-num">Banco.</p>
        <p className="hero-sub mt-2">Importa tus movimientos y los ordeno por ti.</p>
      </section>

      {/* ---------- Importar ---------- */}
      {!movements && (
        <section className="slab p-5 space-y-4">
          <h2 className="display text-lg text-paper">Importar el extracto</h2>
          <ol className="space-y-2 text-[13px] text-paper/80 leading-snug list-decimal pl-5">
            <li>En la web o app de tu banco, entra en los movimientos de tu cuenta o tarjeta.</li>
            <li>Busca «Descargar» o «Exportar» y elige Excel o CSV.</li>
            <li>Súbelo aquí. Detecto las columnas, categorizo cada movimiento y marco tus recibos como pagados.</li>
          </ol>
          <label className="btn-3d w-full flex items-center justify-center cursor-pointer">
            <input
              type="file"
              id="bank-file"
              accept=".csv,.txt,.xls,.xlsx,.ods"
              className="sr-only"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {loading ? 'Leyendo…' : 'Elegir archivo del banco'}
          </label>
          <button onClick={() => start(parseCsv(sampleStatement()), 'extracto-ejemplo.csv')} className="w-full text-center mono text-[11px] text-mute underline underline-offset-4 hover:text-paper">
            PROBAR CON UN EXTRACTO DE EJEMPLO
          </button>
          {error && <p className="text-[13px] rounded-xl px-3 py-2 bg-burgundy/30 text-[#F0C9CF]" role="alert">{error}</p>}
          <p className="text-[11px] text-mute leading-snug">El archivo se lee en tu navegador: no se envía a ningún sitio.</p>
        </section>
      )}

      {/* ---------- Revisar ---------- */}
      {movements && counts && map && (
        <section className="space-y-3">
          <div className="slab p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="display text-lg text-paper">Revisa antes de importar</h2>
              <span className="mono text-[10px] text-mute truncate">{fileName.toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="chip">{counts.nuevo} NUEVOS</span>
              {counts.recibo > 0 && <span className="chip">{counts.recibo} RECIBOS → PAGADOS</span>}
              {counts.duplicado > 0 && <span className="chip">{counts.duplicado} YA IMPORTADOS</span>}
              {counts.ingreso > 0 && <span className="chip">{counts.ingreso} INGRESOS</span>}
            </div>
            <details className="text-[13px] text-paper/80">
              <summary className="cursor-pointer mono text-[11px] text-mute">¿COLUMNAS MAL LEÍDAS? CAMBIARLAS</summary>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {([
                  ['date', 'Fecha'],
                  ['concept', 'Concepto'],
                  ['amount', 'Importe'],
                  ['debit', 'Cargo (si va aparte)'],
                  ['credit', 'Abono (si va aparte)'],
                ] as const).map(([k, label]) => (
                  <label key={k} className="space-y-1" htmlFor={`map-${k}`}>
                    <span className="mono text-[10px] text-mute block">{label.toUpperCase()}</span>
                    <select id={`map-${k}`} value={map[k]} onChange={(e) => remap({ [k]: +e.target.value } as Partial<Mapping>)} className="w-full rounded-xl bg-[#2A211A] border border-white/10 px-2 py-2 text-paper text-sm">
                      <option value={-1}>—</option>
                      {headerCells.map((h) => (
                        <option key={h.i} value={h.i}>{h.label}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </details>
          </div>

          {visible.map((mv) => (
            <div key={mv.key} className={`glass flex items-center gap-3 p-3 ${mv.include || mv.status !== 'nuevo' ? '' : 'opacity-55'}`}>
              {mv.status === 'nuevo' ? (
                <input
                  type="checkbox"
                  checked={mv.include}
                  onChange={(e) => setMovements((list) => list!.map((x) => (x.key === mv.key ? { ...x, include: e.target.checked } : x)))}
                  className="w-5 h-5 accent-[#241A13] shrink-0"
                  aria-label={`Importar ${mv.name}`}
                />
              ) : (
                <span className="w-5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-bold truncate">{mv.name}</p>
                  <p className={`font-bold tabular-nums shrink-0 ${mv.amount > 0 ? 'text-[#7A4B2A]' : ''}`}>{mv.amount > 0 ? '+' : ''}{eur(mv.amount)}</p>
                </div>
                <p className="mono text-[9px] text-ink/50 truncate">{mv.date.split('-').reverse().join('/')} · {mv.concept.toUpperCase()}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`mono text-[9px] px-1.5 py-[2px] rounded-full ${STATUS_LABEL[mv.status].cls}`}>{STATUS_LABEL[mv.status].label}</span>
                  {mv.status === 'nuevo' && (
                    <select
                      aria-label={`Categoría de ${mv.name}`}
                      value={mv.category}
                      onChange={(e) => setMovements((list) => list!.map((x) => (x.merchant === mv.merchant && x.status === 'nuevo' ? { ...x, category: e.target.value } : x)))}
                      className="text-xs rounded-lg bg-white/70 border border-ink/15 px-1.5 py-1 min-w-0"
                    >
                      {catOptions.map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!showAll && movements.length > 25 && (
            <button onClick={() => setShowAll(true)} className="w-full py-3 rounded-full bg-white/10 border border-white/15 text-paper font-bold text-sm">
              Ver los {movements.length} movimientos
            </button>
          )}
          <div className="flex gap-3 sticky bottom-24 z-30">
            <button onClick={() => setMovements(null)} className="px-5 py-3.5 rounded-full bg-[#2E241D] text-paper font-bold">Cancelar</button>
            <button onClick={doImport} className="btn-3d flex-1">
              Importar {counts.include} {counts.include === 1 ? 'gasto' : 'gastos'}
            </button>
          </div>
        </section>
      )}

      {/* ---------- Resultado de la importación ---------- */}
      {lastImport && (
        <section className="slab p-5 space-y-3" role="status">
          <h2 className="display text-lg text-paper">Importado</h2>
          <p className="text-[13px] text-paper/80">
            {lastImport.count} gastos nuevos{lastImport.bills ? ` y ${lastImport.bills} recibos marcados como pagados` : ''}. Ya aparecen en Gastos, Consejos y el análisis de abajo.
          </p>
          {lastImport.income.length > 0 && (
            <div className="space-y-2">
              <p className="mono text-[10px] text-mute">INGRESOS ENCONTRADOS</p>
              {lastImport.income.map(([mk, amount]) => {
                const [yy, mm] = mk.split('-').map(Number);
                const applied = state.income[mk] === Math.round(amount * 100) / 100;
                return (
                  <div key={mk} className="flex items-center justify-between gap-2 rounded-xl bg-[#2A211A] px-3 py-2">
                    <span className="text-sm">
                      {monthLong(yy, mm - 1)}: <b className="tabular-nums">{eur(amount)}</b>
                    </span>
                    <button
                      disabled={applied}
                      onClick={() => setState((s) => ({ ...s, income: { ...s.income, [mk]: Math.round(amount * 100) / 100 } }))}
                      className="mono text-[10px] px-3 py-1.5 rounded-full bg-amber text-ink disabled:bg-transparent disabled:text-amber disabled:border disabled:border-amber/50"
                    >
                      {applied ? 'USADO ✓' : 'USAR COMO INGRESOS'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ---------- Recibos detectados ---------- */}
      {suggestions.length > 0 && !movements && (
        <section className="slab p-5 space-y-3">
          <div>
            <h2 className="display text-lg text-paper">Parecen recibos mensuales</h2>
            <p className="text-[13px] text-mute">Se repiten cada mes con un importe parecido. Conviértelos en recibo y te avisaré antes de cada cobro.</p>
          </div>
          {suggestions.map((s) => (
            <div key={s.merchant} className="flex items-center gap-3">
              <IconTile icon={resolveIcon({ name: s.name, category: s.category }, state.categories)} size={40} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-paper truncate">{s.name}</p>
                <p className="mono text-[10px] text-mute">≈ {eur(s.amount)} · DÍA {s.day} · {s.months} MESES</p>
              </div>
              <button onClick={() => setState((st) => convertToRecurring(st, s))} className="mono text-[10px] px-3 py-2 rounded-full bg-amber text-ink shrink-0">
                HACER RECIBO
              </button>
            </div>
          ))}
        </section>
      )}

      {/* ---------- Análisis del mes ---------- */}
      {!movements && (
        <section className="slab p-5 space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-lg text-paper">Análisis de {monthLong(y, m)}</h2>
            <span className="mono text-[10px] text-mute">{monthShort(y, m)}</span>
          </div>
          {monthItems.length === 0 ? (
            <p className="text-sm text-mute">Sin movimientos este mes. Importa un extracto o cambia de mes.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#2A211A] p-3">
                  <p className="mono text-[9px] text-mute">MEDIA DIARIA</p>
                  <p className="font-bold tabular-nums">{eur(oneOffSum / Math.max(daysElapsed, 1))}</p>
                  <p className="text-[11px] text-mute">sin contar recibos</p>
                </div>
                <div className="rounded-2xl bg-[#2A211A] p-3">
                  <p className="mono text-[9px] text-mute">MAYOR GASTO</p>
                  <p className="font-bold tabular-nums">{biggest ? eur(biggest.e.amount) : '—'}</p>
                  <p className="text-[11px] text-mute truncate">{biggest?.e.name ?? ''}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="mono text-[10px] text-mute">DÓNDE GASTAS MÁS</p>
                {top.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <IconTile icon={resolveIcon(t.sample, state.categories)} size={34} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm text-paper truncate">{t.name} <span className="text-mute text-xs">· {t.count}×</span></span>
                        <span className="text-sm font-bold tabular-nums shrink-0">{eur(t.total)}</span>
                      </div>
                      <div className="h-[5px] rounded-full bg-[#2E241D] mt-1 overflow-hidden">
                        <div className="h-full holo rounded-full" style={{ width: `${(t.total / topMax) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-amber/30 p-3 space-y-1">
                <p className="mono text-[10px] text-amber">GASTOS HORMIGA (MENOS DE 6 €)</p>
                {small.length ? (
                  <p className="text-[13px] text-paper/85 leading-snug">
                    {small.length} compras pequeñas suman <b>{eur(smallSum)}</b> este mes. A este ritmo son unos <b>{eurRound(smallSum * 12)}</b> al año.
                  </p>
                ) : (
                  <p className="text-[13px] text-paper/70">Este mes no hay compras pequeñas repetidas.</p>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* ---------- Movimientos importados ---------- */}
      {!movements && monthItems.some((x) => x.e.source === 'banco') && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="page-h2">Movimientos del banco</h2>
            <span className="page-meta">{bankMonth.length}</span>
          </div>
          <input id="bank-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar comercio…" className="field w-full !bg-widget" />
          <p className="page-meta text-[10px] px-1">SI CAMBIAS UNA CATEGORÍA, LA APRENDO PARA ESE COMERCIO.</p>
          {bankMonth.map(({ e, day }) => (
            <div key={e.id} className="glass flex items-center gap-3 p-3">
              <IconTile icon={resolveIcon(e, state.categories)} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-bold truncate">{e.name}</p>
                  <p className="font-bold tabular-nums shrink-0">{eur(e.amount)}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="mono text-[9px] text-ink/50">DÍA {day}</span>
                  <select
                    aria-label={`Categoría de ${e.name}`}
                    value={e.category}
                    onChange={(ev) => recategorize(e.id, ev.target.value)}
                    className="text-xs rounded-lg bg-white/70 border border-ink/15 px-1.5 py-1 min-w-0"
                  >
                    {catOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {!movements && (
        <section className="rounded-3xl border border-white/10 p-4 space-y-1">
          <p className="mono text-[10px] text-mute">¿Y CONECTAR EL BANCO DIRECTAMENTE?</p>
          <p className="text-[13px] text-paper/70 leading-snug">
            Apps como las de agregación bancaria usan un proveedor autorizado de open banking (PSD2) y un servidor propio. Se puede añadir más adelante; mientras, importar el extracto una vez al mes te da el mismo análisis.
          </p>
        </section>
      )}
    </div>
  );
}
