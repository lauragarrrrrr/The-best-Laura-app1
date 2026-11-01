'use client';

import React, { useMemo } from 'react';
import {
  EMERGENCY_BUCKET_ID, detectBrand, eur, expensesForMonth, incomeFor, monthKey, monthLong, monthShort, savingsTotals,
  type MoneyState,
} from './data';

/* ------------------------------------------------------------------ */
/* Biblioteca: ideas resumidas de libros clásicos                      */
/* ------------------------------------------------------------------ */

export type Book = {
  id: string;
  title: string;
  original?: string;
  author: string;
  year: number;
  idea: string;
  summary: string;
  apply: string;
  cover: string;
};

export const BOOKS: Book[] = [
  {
    id: 'babilonia',
    title: 'El hombre más rico de Babilonia',
    author: 'George S. Clason',
    year: 1926,
    idea: 'Págate primero',
    summary: 'Una parte de todo lo que ganas es tuya: apártala antes de pagar nada más. El libro propone guardar al menos una décima parte de cada ingreso.',
    apply: 'Programa una transferencia automática del 10% el mismo día que cobras.',
    cover: '#B4643C',
  },
  {
    id: 'warren',
    title: 'All Your Worth',
    author: 'Elizabeth Warren y Amelia Warren Tyagi',
    year: 2005,
    idea: 'La regla 50/30/20',
    summary: 'Reparte tus ingresos netos en tres cubos: en torno a un 50% para necesidades, un 30% para caprichos y un 20% para ahorro o deudas.',
    apply: 'Mira tu reparto real en la tarjeta 50/30/20 de arriba y ajusta el cubo que se pasa.',
    cover: '#3E7BFA',
  },
  {
    id: 'housel',
    title: 'La psicología del dinero',
    author: 'Morgan Housel',
    year: 2020,
    idea: 'El tiempo hace el trabajo',
    summary: 'El interés compuesto premia la constancia durante muchos años más que acertar el mejor momento. Y conviene saber qué es «suficiente»: si el gasto sube con el sueldo, el ahorro nunca crece.',
    apply: 'Cuando te suban el sueldo, sube primero tu aportación y después tu gasto.',
    cover: '#4CC38A',
  },
  {
    id: 'bogle',
    title: 'El pequeño libro para invertir con sentido común',
    author: 'John C. Bogle',
    year: 2007,
    idea: 'Compra todo el mercado, y barato',
    summary: 'En vez de buscar la acción ganadora, un fondo indexado diversificado y con comisiones bajas suele superar a la mayoría de gestores a largo plazo. Los costes se comen la rentabilidad año tras año.',
    apply: 'Revisa la comisión anual (TER) de tus fondos: un 1% de diferencia pesa mucho en 20 años.',
    cover: '#F5A300',
  },
  {
    id: 'malkiel',
    title: 'Un paseo aleatorio por Wall Street',
    author: 'Burton G. Malkiel',
    year: 1973,
    idea: 'Diversifica y aporta cada mes',
    summary: 'Nadie predice el mercado de forma constante. Invertir la misma cantidad cada mes reparte el riesgo de entrar todo en un mal momento.',
    apply: 'Deja una aportación fija y automática a inversión, aunque sea pequeña.',
    cover: '#8E7CF0',
  },
  {
    id: 'graham',
    title: 'El inversor inteligente',
    author: 'Benjamin Graham',
    year: 1949,
    idea: 'Que el «señor Mercado» no te mande',
    summary: 'El mercado es como un socio de humor cambiante: unos días eufórico y otros hundido. El inversor defensivo no vende por pánico y busca siempre un margen de seguridad.',
    apply: 'No mires tu inversión a diario: revísala una o dos veces al año.',
    cover: '#2B2B2B',
  },
  {
    id: 'sethi',
    title: 'Te enseñaré a ser rico',
    original: 'I Will Teach You to Be Rich',
    author: 'Ramit Sethi',
    year: 2009,
    idea: 'Gasto consciente',
    summary: 'Gasta sin culpa en lo que te encanta y recorta sin piedad lo que no te importa. Automatiza ahorro y recibos para no depender de la fuerza de voluntad.',
    apply: 'Repasa tus suscripciones y cancela las que no hayas usado este mes.',
    cover: '#E5484D',
  },
  {
    id: 'stanley',
    title: 'El millonario de la puerta de al lado',
    original: 'The Millionaire Next Door',
    author: 'Thomas J. Stanley y William D. Danko',
    year: 1996,
    idea: 'Vive por debajo de tus posibilidades',
    summary: 'Muchas personas con patrimonio alto tienen ingresos normales. La diferencia está en gastar bastante menos de lo que ganan, no en parecer ricas.',
    apply: 'Cuando entre un dinero extra, inviértelo antes de subir tu nivel de vida.',
    cover: '#5EC8E5',
  },
];

const BOOK_BY_ID = new Map(BOOKS.map((b) => [b.id, b]));

/* ------------------------------------------------------------------ */
/* Avisos y sugerencias calculados con tus datos                       */
/* ------------------------------------------------------------------ */

type Tone = 'alerta' | 'aviso' | 'idea' | 'bien';
export type Insight = { id: string; tone: Tone; emoji: string; title: string; text: string; book?: string; tab?: 'gastos' | 'ahorro' };

const TONE_ORDER: Record<Tone, number> = { alerta: 0, aviso: 1, idea: 2, bien: 3 };
const TONE_STYLE: Record<Tone, { label: string; cls: string }> = {
  alerta: { label: 'ALERTA', cls: 'bg-[#D93A2E] text-white' },
  aviso: { label: 'AVISO', cls: 'bg-amber text-ink' },
  idea: { label: 'IDEA', cls: 'bg-[#3E7BFA] text-white' },
  bien: { label: 'BIEN', cls: 'bg-[#1F7A4D] text-white' },
};

/** Valor futuro de aportar `monthly` € al mes durante `years` años a un `annual` % anual. */
export function futureValue(monthly: number, annual: number, years: number) {
  const r = annual / 12;
  const n = years * 12;
  return r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r);
}

export function computeInsights(state: MoneyState, y: number, m: number, now = new Date()): Insight[] {
  const out: Insight[] = [];
  const mk = monthKey(y, m);
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() === m;
  const today = now.getDate();
  const items = expensesForMonth(state.expenses, y, m);
  const prevD = new Date(y, m - 1, 1);
  const prevItems = expensesForMonth(state.expenses, prevD.getFullYear(), prevD.getMonth());
  const isPaid = (id: string) => !!state.paid[`${id}:${mk}`];
  const catLabel = (id: string) => state.categories.find((c) => c.id === id)?.label ?? 'Otros';

  // Recibos sin marcar y próximos cobros
  if (isCurrentMonth) {
    const overdue = items.filter((x) => x.e.recurring && x.day < today && !isPaid(x.e.id));
    if (overdue.length) {
      out.push({
        id: 'overdue', tone: 'alerta', emoji: '⏰', tab: 'gastos',
        title: `${overdue.length} ${overdue.length === 1 ? 'recibo pasado sin marcar' : 'recibos pasados sin marcar'}`,
        text: `${overdue.map((x) => `${x.e.name} (día ${x.day})`).join(', ')}. Comprueba que se han cobrado y márcalos como pagados.`,
      });
    }
    const soon = items.filter((x) => x.e.recurring && x.day >= today && x.day <= today + 3 && !isPaid(x.e.id));
    if (soon.length) {
      const when = (d: number) => (d === today ? 'hoy' : d === today + 1 ? 'mañana' : `en ${d - today} días`);
      out.push({
        id: 'soon', tone: 'aviso', emoji: '📅', tab: 'gastos',
        title: `Próximos cobros: ${eur(soon.reduce((s, x) => s + x.e.amount, 0))}`,
        text: soon.map((x) => `${x.e.name} ${when(x.day)} (${eur(x.e.amount)})`).join(' · ') + '. Ten saldo en la cuenta.',
      });
    }
  }

  // Tasa de ahorro
  const income = incomeFor(state.income, y, m);
  const savingsItems = expensesForMonth(state.savings, y, m);
  const saved = savingsItems.reduce((s, x) => s + x.e.amount, 0);
  if (income === null) {
    out.push({
      id: 'income', tone: 'idea', emoji: '💶', tab: 'ahorro',
      title: 'Añade tus ingresos',
      text: 'Con lo que cobras al mes puedo calcular tu tasa de ahorro y tu reparto 50/30/20. Lo encontrarás en la pestaña Ahorro.',
    });
  } else {
    const rate = (saved / income) * 100;
    if (rate < 10) {
      out.push({
        id: 'rate', tone: 'alerta', emoji: '🪙', book: 'babilonia', tab: 'ahorro',
        title: `Este mes apartas un ${rate.toFixed(0)}% de lo que ganas`,
        text: `Para llegar al 10% te faltan ${eur(Math.max(income * 0.1 - saved, 0))}. Prueba a programar la transferencia el día de cobro, antes de gastar.`,
      });
    } else if (rate < 20) {
      out.push({
        id: 'rate', tone: 'aviso', emoji: '🪙', book: 'warren', tab: 'ahorro',
        title: `Ahorras un ${rate.toFixed(0)}%: vas bien, el objetivo clásico es el 20%`,
        text: `Te faltan ${eur(income * 0.2 - saved)} al mes para el 20%. Mira qué categoría de caprichos podrías recortar.`,
      });
    } else {
      out.push({
        id: 'rate', tone: 'bien', emoji: '🪙', book: 'housel', tab: 'ahorro',
        title: `Ahorras un ${rate.toFixed(0)}% de tus ingresos`,
        text: 'Por encima del 20% de referencia. Lo importante ahora es mantenerlo muchos meses seguidos.',
      });
    }
  }

  // Suscripciones
  const subs = items.filter((x) => x.e.recurring && (x.e.category === 'suscripciones' || (x.e.icon?.kind === 'brand') || (!x.e.icon && detectBrand(x.e.name))));
  if (subs.length) {
    const monthly = subs.reduce((s, x) => s + x.e.amount, 0);
    out.push({
      id: 'subs', tone: 'idea', emoji: '📺', book: 'sethi', tab: 'gastos',
      title: `${subs.length} suscripciones: ${eur(monthly * 12)} al año`,
      text: `Son ${eur(monthly)} al mes (${subs.map((x) => x.e.name).join(', ')}). Quédate con las que de verdad usas y cancela el resto.`,
    });
  }

  // Categoría que más sube respecto al mes anterior
  const sumBy = (list: typeof items) => {
    const map = new Map<string, number>();
    for (const { e } of list) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return map;
  };
  const cur = sumBy(items);
  const prev = sumBy(prevItems);
  let worst: { id: string; diff: number; pct: number } | null = null;
  for (const [id, v] of cur) {
    const p = prev.get(id) ?? 0;
    if (p > 0 && v - p > 30 && v / p > 1.25 && (!worst || v - p > worst.diff)) worst = { id, diff: v - p, pct: (v / p - 1) * 100 };
  }
  if (worst) {
    out.push({
      id: 'up', tone: 'aviso', emoji: '📈', tab: 'gastos',
      title: `${catLabel(worst.id)} sube un ${worst.pct.toFixed(0)}%`,
      text: `Llevas ${eur(worst.diff)} más que en ${monthLong(prevD.getFullYear(), prevD.getMonth())}. ¿Ha sido algo puntual o se está convirtiendo en costumbre?`,
    });
  }

  // Fondo de emergencia
  const totals = savingsTotals(state.savings, y, m);
  const fixed = items.filter((x) => x.e.recurring).reduce((s, x) => s + x.e.amount, 0);
  const emergency = totals.get(EMERGENCY_BUCKET_ID) ?? 0;
  if (fixed > 0 && state.buckets.some((b) => b.id === EMERGENCY_BUCKET_ID)) {
    const months = emergency / fixed;
    if (months < 3) {
      out.push({
        id: 'emergency', tone: 'aviso', emoji: '🛟', tab: 'ahorro',
        title: `Tu fondo de emergencia cubre ${months.toFixed(1)} meses`,
        text: `Lo habitual es tener entre 3 y 6 meses de gastos fijos (${eur(fixed)}/mes) para imprevistos. Te faltan ${eur(fixed * 3 - emergency)} para los 3 meses.`,
      });
    } else if (months >= 6) {
      out.push({
        id: 'emergency', tone: 'idea', emoji: '🛟', book: 'bogle', tab: 'ahorro',
        title: `Colchón de ${months.toFixed(1)} meses: más que suficiente`,
        text: 'Lo que pase de 6 meses de gastos puede trabajar invertido a largo plazo en vez de estar parado.',
      });
    } else {
      out.push({
        id: 'emergency', tone: 'bien', emoji: '🛟', tab: 'ahorro',
        title: `Fondo de emergencia: ${months.toFixed(1)} meses cubiertos`,
        text: 'Estás en la franja recomendada de 3 a 6 meses de gastos fijos.',
      });
    }
  }

  // Inversión
  const investIds = new Set(state.buckets.filter((b) => b.invest).map((b) => b.id));
  const investMonthly = savingsItems.filter((x) => investIds.has(x.e.bucket)).reduce((s, x) => s + x.e.amount, 0);
  if (investMonthly > 0) {
    const fv = futureValue(investMonthly, 0.05, 20);
    out.push({
      id: 'invest', tone: 'bien', emoji: '🌱', book: 'malkiel', tab: 'ahorro',
      title: `Inviertes ${eur(investMonthly)} este mes`,
      text: 'Aportar cada mes, pase lo que pase en el mercado, reparte el riesgo de entrar en un mal momento.',
    });
    out.push({
      id: 'compound', tone: 'idea', emoji: '⏳', book: 'housel', tab: 'ahorro',
      title: `${eur(investMonthly)}/mes durante 20 años ≈ ${eur(Math.round(fv / 100) * 100)}`,
      text: `Habrías puesto ${eur(investMonthly * 240)}; el resto sería interés compuesto con una rentabilidad media hipotética del 5% anual. Es una estimación, no una promesa: los mercados suben y bajan.`,
    });
  } else if (state.savings.length && fixed > 0 && emergency / fixed >= 3) {
    out.push({
      id: 'invest', tone: 'idea', emoji: '🌱', book: 'bogle', tab: 'ahorro',
      title: 'Con el colchón cubierto, puedes empezar a invertir',
      text: 'Una cantidad fija al mes en un fondo indexado diversificado y barato es la opción más sencilla para el largo plazo.',
    });
  }

  if (!state.savings.length) {
    out.push({
      id: 'first', tone: 'idea', emoji: '🐷', book: 'babilonia', tab: 'ahorro',
      title: 'Págate primero',
      text: 'Apunta tu primera aportación en Ahorro. Aunque sea poco, lo importante es el hábito.',
    });
  }

  return out.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone]);
}

/* ------------------------------------------------------------------ */
/* Vista                                                               */
/* ------------------------------------------------------------------ */

export function AdviceView({ state, y, m, onGo }: { state: MoneyState; y: number; m: number; onGo: (tab: 'gastos' | 'ahorro' | 'aprende', anchor?: string) => void }) {
  const insights = useMemo(() => computeInsights(state, y, m), [state, y, m]);
  const alerts = insights.filter((i) => i.tone === 'alerta' || i.tone === 'aviso').length;

  // Reparto 50/30/20
  const items = expensesForMonth(state.expenses, y, m);
  const essentialIds = new Set(state.categories.filter((c) => c.essential).map((c) => c.id));
  const needs = items.filter((x) => essentialIds.has(x.e.category)).reduce((s, x) => s + x.e.amount, 0);
  const wants = items.filter((x) => !essentialIds.has(x.e.category)).reduce((s, x) => s + x.e.amount, 0);
  const saved = expensesForMonth(state.savings, y, m).reduce((s, x) => s + x.e.amount, 0);
  const income = incomeFor(state.income, y, m);
  const base = income ?? needs + wants + saved;
  const rows = [
    { label: 'Necesidades', hint: 'Hogar, comida, transporte, salud', value: needs, target: 50, color: '#5EC8E5', over: true },
    { label: 'Caprichos', hint: 'Ocio, compras, suscripciones', value: wants, target: 30, color: '#E26AC1', over: true },
    { label: 'Ahorro', hint: 'Inversión y otros ahorros', value: saved, target: 20, color: '#F5A300', over: false },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="display text-[clamp(3rem,15vw,4.75rem)] leading-[0.9] text-ink">
          {alerts} {alerts === 1 ? 'aviso' : 'avisos'}
        </p>
        <p className="display text-2xl text-ink/80 mt-1">
          y {insights.length - alerts} {insights.length - alerts === 1 ? 'idea' : 'ideas'} para {monthLong(y, m)}.
        </p>
      </section>

      {/* ---------- 50/30/20 ---------- */}
      <section className="slab p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="display text-xl text-paper">Tu 50/30/20</h2>
          <span className="mono text-[10px] text-mute">{income ? `SOBRE ${eur(income)}` : 'SOBRE LO GASTADO + AHORRADO'}</span>
        </div>
        {base > 0 ? (
          rows.map((r) => {
            const pct = (r.value / base) * 100;
            const bad = r.over ? pct > r.target + 5 : pct < r.target - 5;
            return (
              <div key={r.label} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0">
                    <span className="text-paper font-bold text-sm block">{r.label}</span>
                    <span className="mono text-[10px] text-mute block">{r.hint.toUpperCase()}</span>
                  </span>
                  <span className={`mono text-xs shrink-0 ${bad ? 'text-[#FF8A80]' : 'text-paper'}`}>
                    {pct.toFixed(0)}% <span className="text-mute">/ {r.target}%</span>
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-[#2A2A2A]">
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: r.color }} />
                  <div className="absolute -top-1 -bottom-1 w-[2px] bg-paper rounded" style={{ left: `${r.target}%` }} title={`Objetivo ${r.target}%`} />
                </div>
                <p className="mono text-[10px] text-mute">{eur(r.value)}</p>
              </div>
            );
          })
        ) : (
          <p className="text-mute text-sm">Aún no hay datos este mes.</p>
        )}
        <p className="text-[11px] text-mute leading-relaxed">
          La línea blanca marca el objetivo. Puedes decidir qué categorías son necesarias editándolas en Gastos → Categorías.
        </p>
      </section>

      {/* ---------- Avisos y sugerencias ---------- */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="display text-2xl text-ink">Avisos y sugerencias</h2>
          <span className="mono text-xs text-ink/60">{monthShort(y, m)}</span>
        </div>
        {insights.map((i) => {
          const tone = TONE_STYLE[i.tone];
          const book = i.book ? BOOK_BY_ID.get(i.book) : undefined;
          return (
            <article key={i.id} className="glass p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`mono text-[10px] font-medium px-2 py-[3px] rounded-full ${tone.cls}`}>{tone.label}</span>
                {i.tab && (
                  <button onClick={() => onGo(i.tab!)} className="ml-auto mono text-[10px] text-ink/55 underline underline-offset-2">
                    VER EN {i.tab === 'gastos' ? 'GASTOS' : 'AHORRO'} →
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <span className="text-2xl leading-none pt-0.5" aria-hidden="true">{i.emoji}</span>
                <div className="min-w-0 space-y-1">
                  <h3 className="font-extrabold leading-snug">{i.title}</h3>
                  <p className="text-sm text-ink/70 leading-relaxed">{i.text}</p>
                  {book && (
                    <button onClick={() => onGo('aprende', `libro-${book.id}`)} className="block text-left mono text-[10px] text-ink/60 pt-1 underline-offset-2 hover:underline">
                      📖 {book.idea.toUpperCase()} · {book.author.split(' y ')[0].toUpperCase()}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <button onClick={() => onGo('aprende', 'biblioteca')} className="slab w-full p-5 flex items-center gap-4 text-left">
        <span className="text-3xl" aria-hidden="true">📚</span>
        <span className="flex-1 min-w-0">
          <span className="display text-xl text-paper block">¿Quieres entender el porqué?</span>
          <span className="text-sm text-mute block">Lecciones, glosario, calculadora y la biblioteca de libros están en Aprende.</span>
        </span>
        <span className="text-amber text-2xl" aria-hidden="true">→</span>
      </button>
    </div>
  );
}
