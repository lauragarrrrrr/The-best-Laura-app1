'use client';

import React, { useMemo, useState } from 'react';
import {
  EMERGENCY_BUCKET_ID, eur, eurRound, expensesForMonth, normalize, savingsTotals,
  type MoneyState,
} from './data';
import { BOOKS, futureValue } from './advice';
import { CheckMark } from './ui';

/* ------------------------------------------------------------------ */
/* Ruta: el orden clásico para poner tu dinero en marcha               */
/* ------------------------------------------------------------------ */

type Step = { id: string; title: string; text: string; auto?: (s: MoneyState, now: Date) => boolean };

const STEPS: Step[] = [
  {
    id: 'gastos',
    title: 'Sabe en qué se va tu dinero',
    text: 'Apunta tus gastos y recibos un mes entero. Sin esta foto, el resto es adivinar.',
    auto: (s, now) => expensesForMonth(s.expenses, now.getFullYear(), now.getMonth()).length > 0,
  },
  {
    id: 'colchon',
    title: 'Ten un colchón para imprevistos',
    text: 'Entre 3 y 6 meses de gastos fijos en un sitio seguro y disponible.',
    auto: (s, now) => {
      const fixed = expensesForMonth(s.expenses, now.getFullYear(), now.getMonth()).filter((x) => x.e.recurring).reduce((a, x) => a + x.e.amount, 0);
      const em = savingsTotals(s.savings, now.getFullYear(), now.getMonth()).get(EMERGENCY_BUCKET_ID) ?? 0;
      return fixed > 0 && em >= fixed * 3;
    },
  },
  {
    id: 'deudas',
    title: 'Líbrate de las deudas caras',
    text: 'Tarjetas revolving o préstamos al consumo con intereses altos cuestan más de lo que suele rentar una inversión. Primero, fuera.',
  },
  {
    id: 'automatico',
    title: 'Págate primero, en automático',
    text: 'Una transferencia programada el día que cobras, antes de gastar.',
    auto: (s) => s.savings.some((x) => x.recurring),
  },
  {
    id: 'invertir',
    title: 'Invierte lo que no necesitarás en años',
    text: 'Dinero a largo plazo, diversificado y con comisiones bajas.',
    auto: (s) => s.savings.some((x) => s.buckets.find((b) => b.id === x.bucket)?.invest),
  },
  {
    id: 'revisar',
    title: 'Revisa una o dos veces al año',
    text: 'Comprueba objetivos, comisiones y reparto. El resto del tiempo, deja que trabaje.',
  },
];

/* ------------------------------------------------------------------ */
/* Lecciones                                                           */
/* ------------------------------------------------------------------ */

type Lesson = {
  id: string;
  theme: 'Ahorro' | 'Inversión' | 'Riesgo' | 'Impuestos' | 'Psicología';
  emoji: string;
  title: string;
  minutes: number;
  body: (string | React.ReactNode)[];
  key: string;
  calculator?: boolean;
};

const fv = (monthly: number, rate: number, years: number) => Math.round(futureValue(monthly, rate, years));

const LESSONS: Lesson[] = [
  {
    id: 'cuanto',
    theme: 'Ahorro',
    emoji: '🪙',
    title: '¿Cuánto debería ahorrar?',
    minutes: 2,
    body: [
      'La referencia más usada es la regla 50/30/20: la mitad de tus ingresos netos para necesidades, un 30% para caprichos y un 20% para ahorro o para pagar deudas.',
      'Si el 20% te parece imposible, empieza con un 10% y súbelo un punto cada vez que te suban el sueldo. Lo que cuenta es el porcentaje y la constancia, no la cantidad del primer mes.',
    ],
    key: 'Mejor un 10% automático todos los meses que un 30% un mes y nada el siguiente.',
  },
  {
    id: 'emergencia',
    theme: 'Ahorro',
    emoji: '🛟',
    title: 'El fondo de emergencia',
    minutes: 2,
    body: [
      'Es dinero para lo inesperado: una avería, quedarte sin trabajo, un dentista. Se suele recomendar entre 3 y 6 meses de gastos fijos; más si tus ingresos son variables.',
      'Tiene que estar disponible al momento y sin riesgo: una cuenta remunerada o un fondo monetario, no en bolsa. En España, el Fondo de Garantía de Depósitos cubre las cuentas hasta 100.000 € por titular y entidad.',
    ],
    key: 'Es un seguro, no una inversión: su trabajo es estar ahí, no rentar.',
  },
  {
    id: 'inflacion',
    theme: 'Ahorro',
    emoji: '🎈',
    title: 'Inflación: por qué el dinero parado pierde',
    minutes: 2,
    body: [
      `La inflación es la subida general de precios. Con una inflación media del 3%, lo que hoy compras con 10.000 € en diez años costará unos ${eur(Math.round(10000 * Math.pow(1.03, 10)))}. Dicho al revés: tus 10.000 € parados comprarán lo que hoy compran ${eur(Math.round(10000 / Math.pow(1.03, 10)))}.`,
      'Por eso el ahorro a largo plazo necesita crecer al menos al ritmo de la inflación. El dinero del día a día y el colchón sí pueden estar quietos; el de dentro de 10 o 20 años, no.',
    ],
    key: 'Guardar no es lo mismo que proteger: a largo plazo, el dinero quieto encoge.',
  },
  {
    id: 'compuesto',
    theme: 'Inversión',
    emoji: '⏳',
    title: 'El interés compuesto',
    minutes: 3,
    body: [
      'Cuando tu inversión genera rentabilidad y esa rentabilidad se reinvierte, la siguiente vez ganas también sobre lo ganado. Al principio apenas se nota; con los años se convierte en la parte más grande.',
      'Un atajo para calcularlo de cabeza es la regla del 72: divide 72 entre la rentabilidad anual y sabrás en cuántos años se duplica tu dinero. Al 6%, unos 12 años; al 3%, unos 24.',
    ],
    key: 'El ingrediente principal es el tiempo: empezar pronto vale más que aportar mucho tarde.',
    calculator: true,
  },
  {
    id: 'activos',
    theme: 'Inversión',
    emoji: '⚖️',
    title: 'Renta fija y renta variable',
    minutes: 3,
    body: [
      'Con la renta fija prestas tu dinero (a un Estado o a una empresa) a cambio de un interés: Letras del Tesoro, bonos, depósitos. Suele moverse poco y rentar menos.',
      'Con la renta variable compras un trozo de empresas (acciones). Sube y baja mucho más, pero históricamente ha sido lo que más ha rentado a largo plazo, aunque el pasado no garantiza el futuro.',
      'Una cartera suele mezclar ambas según tu horizonte: el dinero que vas a necesitar en menos de 3 a 5 años no debería estar en renta variable.',
    ],
    key: 'Cuanto más lejos esté el día en que necesitas el dinero, más renta variable puedes aguantar.',
  },
  {
    id: 'indexados',
    theme: 'Inversión',
    emoji: '🌍',
    title: 'Fondos indexados y ETF',
    minutes: 3,
    body: [
      'Un fondo indexado no intenta elegir las mejores empresas: copia un índice entero. Por ejemplo, el MSCI World reúne más de mil grandes empresas de países desarrollados, y el S&P 500 las 500 mayores de Estados Unidos. Así diversificas con una sola compra y con comisiones muy bajas (a menudo entre el 0,1% y el 0,3% al año).',
      'Un ETF es parecido, pero cotiza en bolsa como una acción. En España hay una diferencia fiscal importante: puedes traspasar dinero de un fondo de inversión a otro sin pagar impuestos hasta que lo retiras; con los ETF, cada venta tributa.',
    ],
    key: 'Para la mayoría de personas, un indexado global y barato es la base más sencilla.',
  },
  {
    id: 'comisiones',
    theme: 'Inversión',
    emoji: '🧾',
    title: 'Comisiones: el enemigo silencioso',
    minutes: 2,
    body: [
      `Un 1,5% al año parece poco, pero se descuenta año tras año. Si inviertes 200 € al mes durante 30 años con un 6% bruto, acabarías con unos ${eur(fv(200, 0.06, 30))}. Si las comisiones te dejan en un 4,5%, serían unos ${eur(fv(200, 0.045, 30))}.`,
      'Mira siempre los gastos corrientes (TER) de un fondo, las comisiones de custodia del bróker y las de compraventa.',
    ],
    key: 'La rentabilidad no la controlas; las comisiones, sí.',
  },
  {
    id: 'dca',
    theme: 'Inversión',
    emoji: '📆',
    title: 'Aportar cada mes',
    minutes: 2,
    body: [
      'Invertir la misma cantidad todos los meses, pase lo que pase, se llama aportaciones periódicas (o DCA, por sus siglas en inglés). Cuando el mercado baja, tu cuota compra más participaciones; cuando sube, menos.',
      'No asegura ganar, pero evita el error de meterlo todo justo antes de una caída y quita la tentación de intentar adivinar el momento.',
    ],
    key: 'Automatiza la aportación y olvídate de acertar el día.',
  },
  {
    id: 'riesgo',
    theme: 'Riesgo',
    emoji: '🎢',
    title: 'Riesgo, volatilidad y horizonte',
    minutes: 3,
    body: [
      'La volatilidad es cuánto sube y baja una inversión. Las bolsas han tenido caídas del 30% al 50% (en 2008, o en pocas semanas en 2020) y con los años se han recuperado, pero no hay garantía de que siempre sea así ni de cuánto tardará.',
      'Tu perfil de riesgo depende de tu horizonte y de cómo duermes cuando ves números en rojo. Si una caída del 30% te haría vender, tu cartera tiene demasiado riesgo para ti.',
    ],
    key: 'Invierte solo el dinero que podrías no tocar durante años, aunque baje.',
  },
  {
    id: 'diversificar',
    theme: 'Riesgo',
    emoji: '🧺',
    title: 'Diversificar',
    minutes: 2,
    body: [
      'Repartir el dinero entre muchos países, sectores y tipos de activo hace que un mal resultado no hunda todo. Una sola empresa puede quebrar; un índice de mil empresas difícilmente.',
      'Las criptomonedas son muy volátiles y especulativas. Si te interesan, que sea un porcentaje pequeño que puedas permitirte perder entero.',
    ],
    key: 'No pongas todos los huevos en la misma cesta, ni en la cesta de moda.',
  },
  {
    id: 'impuestos',
    theme: 'Impuestos',
    emoji: '🏛️',
    title: 'Cómo tributan tus ahorros en España',
    minutes: 3,
    body: [
      'Los intereses de cuentas y depósitos, los dividendos y lo que ganas al vender una inversión se declaran en la base del ahorro del IRPF, con tipos que empiezan en el 19% y suben por tramos. Solo pagas por la ganancia, no por todo lo invertido.',
      'Los fondos de inversión permiten traspasar el dinero de uno a otro sin tributar hasta que lo retiras. Los planes de pensiones reducen tu base imponible al aportar (con un límite anual), pero tributan como sueldo al rescatarlos y el dinero queda, en general, bloqueado hasta la jubilación.',
      'Estos datos son orientativos y la normativa cambia: compruébalos o consulta a un asesor antes de decidir.',
    ],
    key: 'Ten en cuenta los impuestos al elegir producto, pero no inviertas solo para ahorrártelos.',
  },
  {
    id: 'sesgos',
    theme: 'Psicología',
    emoji: '🧠',
    title: 'Los sesgos que nos hacen perder dinero',
    minutes: 2,
    body: [
      'Aversión a la pérdida: perder 100 € duele más de lo que alegra ganarlos, y eso empuja a vender en las caídas. Miedo a quedarse fuera (FOMO): comprar lo que está de moda cuando ya ha subido. Exceso de confianza: creer que puedes adivinar el mercado.',
      'La defensa es tener un plan escrito, automatizar las aportaciones y mirar la inversión pocas veces al año.',
    ],
    key: 'El mayor riesgo de tu cartera suele ser tu propio comportamiento.',
  },
];

const THEMES = ['Todas', 'Ahorro', 'Inversión', 'Riesgo', 'Impuestos', 'Psicología'] as const;

const MISTAKES = [
  ['Invertir dinero que vas a necesitar pronto', 'Si lo necesitas en 1 o 2 años y el mercado cae, tendrás que vender en pérdidas.'],
  ['Empezar sin colchón', 'Sin fondo de emergencia, cualquier imprevisto te obliga a deshacer la inversión.'],
  ['Vender cuando todo cae', 'Convierte una bajada temporal en una pérdida real.'],
  ['Pagar comisiones altas sin saberlo', 'Un 1% o 2% al año se come una parte enorme del resultado final.'],
  ['Ponerlo todo en una empresa o una cripto', 'Mucho riesgo concentrado en una sola apuesta.'],
  ['Esperar el momento perfecto', 'Nadie lo acierta de forma constante; mientras esperas, pierdes tiempo de interés compuesto.'],
];

const GLOSSARY: [string, string][] = [
  ['Acción', 'Una parte de la propiedad de una empresa. Si a la empresa le va bien, su valor suele subir y puede repartir dividendos.'],
  ['Bono', 'Un préstamo que haces a un Estado o una empresa a cambio de un interés y de recuperar el dinero en una fecha.'],
  ['Base del ahorro', 'Parte del IRPF donde tributan intereses, dividendos y ganancias de inversiones.'],
  ['Comisión de custodia', 'Lo que te cobra un banco o bróker por guardar tus valores.'],
  ['Cuenta remunerada', 'Cuenta bancaria que paga intereses por el saldo. Útil para el colchón.'],
  ['DCA (aportaciones periódicas)', 'Invertir la misma cantidad cada cierto tiempo, sin intentar adivinar el momento.'],
  ['Diversificación', 'Repartir el dinero entre muchas inversiones distintas para reducir el riesgo.'],
  ['Dividendo', 'Parte del beneficio que una empresa reparte entre sus accionistas.'],
  ['ETF', 'Fondo que cotiza en bolsa como una acción. Muchos replican un índice.'],
  ['Fondo de emergencia', 'Ahorro disponible para imprevistos, normalmente de 3 a 6 meses de gastos fijos.'],
  ['Fondo de Garantía de Depósitos', 'Organismo que protege en España los depósitos hasta 100.000 € por titular y entidad.'],
  ['Fondo indexado', 'Fondo que copia un índice (como el MSCI World) en lugar de elegir empresas, con comisiones bajas.'],
  ['Fondo monetario', 'Fondo que invierte en deuda a muy corto plazo. Poco riesgo y poca rentabilidad.'],
  ['Horizonte temporal', 'Cuánto tiempo falta hasta que necesitarás el dinero.'],
  ['Índice', 'Lista de empresas que representa un mercado, como el IBEX 35, el S&P 500 o el MSCI World.'],
  ['Inflación', 'Subida general de los precios: con el mismo dinero compras menos.'],
  ['Interés compuesto', 'Ganar rentabilidad también sobre la rentabilidad ya obtenida.'],
  ['Letras del Tesoro', 'Deuda del Estado español a corto plazo (hasta 12 meses).'],
  ['Liquidez', 'La facilidad para convertir una inversión en dinero disponible sin perder valor.'],
  ['MSCI World', 'Índice con más de mil grandes empresas de países desarrollados.'],
  ['Perfil de riesgo', 'Cuánta caída puedes soportar, económica y emocionalmente.'],
  ['Plan de pensiones', 'Producto para la jubilación que desgrava al aportar, pero tributa al rescatar y suele estar bloqueado hasta entonces.'],
  ['Rebalancear', 'Volver al reparto que te habías marcado (por ejemplo 80% acciones, 20% bonos) cuando el mercado lo desvía.'],
  ['Renta fija', 'Inversiones que pagan un interés pactado: bonos, letras, depósitos.'],
  ['Renta variable', 'Inversiones cuyo resultado no está pactado, como las acciones.'],
  ['Roboadvisor', 'Gestora automática que invierte por ti en fondos indexados según tu perfil.'],
  ['S&P 500', 'Índice con las 500 mayores empresas cotizadas de Estados Unidos.'],
  ['TAE', 'Tasa Anual Equivalente: permite comparar lo que rinde o cuesta un producto en un año.'],
  ['TER', 'Gastos corrientes anuales de un fondo, en porcentaje. Cuanto más bajo, mejor.'],
  ['Traspaso', 'Mover dinero de un fondo de inversión a otro. En España no tributa hasta el reembolso.'],
  ['Volatilidad', 'Cuánto y con qué rapidez sube y baja el valor de una inversión.'],
];

/* ------------------------------------------------------------------ */
/* Calculadora de interés compuesto                                    */
/* ------------------------------------------------------------------ */

function CompoundCalculator({ defaultMonthly }: { defaultMonthly: number }) {
  const [monthly, setMonthly] = useState(String(defaultMonthly || 150));
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(5);
  const p = Math.max(parseFloat(monthly.replace(',', '.')) || 0, 0);
  const final = futureValue(p, rate / 100, years);
  const contributed = p * years * 12;
  const steps = Math.min(years, 8);
  const marks = Array.from({ length: steps }, (_, i) => Math.round(((i + 1) * years) / steps));
  const max = Math.max(final, 1);

  return (
    <div className="rounded-3xl bg-ink text-paper p-4 space-y-4">
      <p className="mono text-[10px] text-amber">CALCULADORA</p>
      <div className="grid grid-cols-3 gap-2">
        <label className="space-y-1" htmlFor="calc-monthly">
          <span className="mono text-[10px] text-mute block">AL MES</span>
          <input id="calc-monthly" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="w-full rounded-xl bg-[#262626] px-3 py-2 font-bold tabular-nums text-paper" />
        </label>
        <label className="space-y-1" htmlFor="calc-years">
          <span className="mono text-[10px] text-mute block">AÑOS · {years}</span>
          <input id="calc-years" type="range" min={1} max={40} value={years} onChange={(e) => setYears(+e.target.value)} className="w-full accent-[#F5A300] mt-2" />
        </label>
        <label className="space-y-1" htmlFor="calc-rate">
          <span className="mono text-[10px] text-mute block">ANUAL · {rate}%</span>
          <input id="calc-rate" type="range" min={0} max={10} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full accent-[#F5A300] mt-2" />
        </label>
      </div>
      <div className="flex items-end gap-1.5 h-28" role="img" aria-label={`Evolución hasta ${eurRound(final)}`}>
        {marks.map((yr) => {
          const total = futureValue(p, rate / 100, yr);
          const put = p * yr * 12;
          return (
            <div key={yr} className="flex-1 flex flex-col justify-end h-full gap-1">
              <div className="w-full flex flex-col justify-end rounded-lg overflow-hidden" style={{ height: `${(total / max) * 100}%`, minHeight: 3 }}>
                <div className="bg-amber" style={{ height: `${total ? ((total - put) / total) * 100 : 0}%` }} />
                <div className="bg-paper/80 flex-1" />
              </div>
              <span className="mono text-[9px] text-mute text-center">{yr}A</span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="mono text-[9px] text-mute">TOTAL</p>
          <p className="font-black text-sm tabular-nums">{eurRound(final)}</p>
        </div>
        <div>
          <p className="mono text-[9px] text-paper/70">PONES TÚ</p>
          <p className="font-bold text-sm tabular-nums">{eurRound(contributed)}</p>
        </div>
        <div>
          <p className="mono text-[9px] text-amber">INTERESES</p>
          <p className="font-bold text-sm tabular-nums text-amber">{eurRound(final - contributed)}</p>
        </div>
      </div>
      <p className="text-[11px] text-mute">Simulación con rentabilidad constante y sin impuestos ni comisiones. La realidad sube y baja.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vista                                                               */
/* ------------------------------------------------------------------ */

export function KnowledgeView({ state, setState, y, m }: { state: MoneyState; setState: React.Dispatch<React.SetStateAction<MoneyState>>; y: number; m: number }) {
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('Todas');
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [allTerms, setAllTerms] = useState(false);

  const now = useMemo(() => new Date(), []);
  const steps = STEPS.map((s) => {
    const auto = s.auto ? s.auto(state, now) : undefined;
    return { ...s, done: auto ?? !!state.checks[s.id], manual: !s.auto };
  });
  const doneCount = steps.filter((s) => s.done).length;

  const investMonthly = expensesForMonth(state.savings, y, m)
    .filter((x) => state.buckets.find((b) => b.id === x.e.bucket)?.invest)
    .reduce((s, x) => s + x.e.amount, 0);

  const lessons = theme === 'Todas' ? LESSONS : LESSONS.filter((l) => l.theme === theme);
  const q = normalize(query);
  // Primero los términos cuyo nombre coincide, después los que lo mencionan en la definición
  const terms = q
    ? [
        ...GLOSSARY.filter(([t]) => normalize(t).includes(q)),
        ...GLOSSARY.filter(([t, d]) => !normalize(t).includes(q) && normalize(d).includes(q)),
      ]
    : GLOSSARY;
  const shownTerms = q || allTerms ? terms : terms.slice(0, 8);

  return (
    <div className="space-y-8">
      <section>
        <p className="display text-[clamp(3rem,15vw,4.75rem)] leading-[0.9] text-ink">Aprende.</p>
        <p className="display text-2xl text-ink/80 mt-1">Lo básico para ahorrar e invertir con cabeza.</p>
      </section>

      {/* ---------- Ruta ---------- */}
      <section className="slab p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="display text-xl text-paper">Tu ruta</h2>
          <span className="mono text-xs text-paper">{doneCount} / {steps.length}</span>
        </div>
        <div className="h-[3px] rounded-full bg-[#2A2A2A] overflow-hidden">
          <div className="h-full bg-amber rounded-full transition-all duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.id} className="flex gap-3">
              <button
                type="button"
                disabled={!s.manual}
                onClick={() => setState((st) => ({ ...st, checks: { ...st.checks, [s.id]: !st.checks[s.id] } }))}
                className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center mono text-sm transition ${
                  s.done ? 'bg-paper text-ink' : 'bg-[#0B0B0B] text-paper border border-[#333]'
                } ${s.manual ? 'cursor-pointer hover:ring-2 hover:ring-amber' : 'cursor-default'}`}
                aria-label={s.manual ? `${s.done ? 'Desmarcar' : 'Marcar'} «${s.title}»` : `${s.title}: ${s.done ? 'hecho' : 'pendiente'}`}
                aria-pressed={s.manual ? s.done : undefined}
              >
                {s.done ? <CheckMark size={16} /> : i + 1}
              </button>
              <div className="min-w-0 pt-1">
                <p className={`font-bold text-sm ${s.done ? 'text-paper' : 'text-paper/90'}`}>{s.title}</p>
                <p className="text-[13px] text-mute leading-snug">{s.text}</p>
                <p className="mono text-[9px] text-[#6E6E6E] mt-1">{s.manual ? 'MÁRCALO TÚ' : 'SE COMPRUEBA CON TUS DATOS'}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Lecciones ---------- */}
      <section className="space-y-3">
        <div className="px-1">
          <h2 className="display text-2xl text-ink">Lecciones</h2>
          <p className="text-sm text-ink/65">{LESSONS.length} lecturas de 2 o 3 minutos.</p>
        </div>
        <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-extrabold border transition ${theme === t ? 'bg-ink text-paper border-ink' : 'bg-paper/60 border-ink/10 text-ink/70'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {lessons.map((l) => {
          const isOpen = open === l.id;
          return (
            <article key={l.id} className="glass overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : l.id)} className="w-full flex items-center gap-3 p-4 text-left" aria-expanded={isOpen}>
                <span className="w-11 h-11 rounded-[14px] bg-ink flex items-center justify-center text-xl shrink-0" aria-hidden="true">{l.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="mono text-[10px] text-ink/50 block">{l.theme.toUpperCase()} · {l.minutes} MIN</span>
                  <span className="font-extrabold leading-snug block">{l.title}</span>
                </span>
                <span className={`text-xl text-ink/50 transition-transform ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {l.body.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-ink/80">{p}</p>
                  ))}
                  {l.calculator && <CompoundCalculator defaultMonthly={investMonthly} />}
                  <p className="rounded-2xl bg-amber/25 border border-amber/50 p-3 text-sm font-bold leading-snug">
                    <span className="mono text-[10px] block text-ink/60 font-normal">LA CLAVE</span>
                    {l.key}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* ---------- Errores comunes ---------- */}
      <section className="slab p-5 space-y-3">
        <h2 className="display text-xl text-paper">Errores comunes</h2>
        <ul className="space-y-3">
          {MISTAKES.map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[#D93A2E] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5" aria-hidden="true">✕</span>
              <span className="min-w-0">
                <span className="font-bold text-paper text-sm block">{t}</span>
                <span className="text-[13px] text-mute leading-snug block">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Glosario ---------- */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="display text-2xl text-ink">Glosario</h2>
          <span className="mono text-xs text-ink/60">{terms.length} TÉRMINOS</span>
        </div>
        <input id="glossary-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar: TER, ETF, inflación…" className="field w-full" />
        <dl className="glass divide-y divide-ink/10">
          {shownTerms.map(([t, d]) => (
            <div key={t} className="px-4 py-3">
              <dt className="font-extrabold text-sm">{t}</dt>
              <dd className="text-[13px] text-ink/70 leading-snug mt-0.5">{d}</dd>
            </div>
          ))}
          {terms.length === 0 && <p className="px-4 py-4 text-sm text-ink/60">No encuentro ese término. Prueba con otra palabra.</p>}
        </dl>
        {!q && !allTerms && (
          <button onClick={() => setAllTerms(true)} className="w-full py-3 rounded-full bg-ink text-paper font-bold text-sm">
            Ver los {GLOSSARY.length} términos
          </button>
        )}
      </section>

      {/* ---------- Biblioteca ---------- */}
      <section className="space-y-3" id="biblioteca">
        <div className="px-1">
          <h2 className="display text-2xl text-ink">Biblioteca</h2>
          <p className="text-sm text-ink/65">La idea principal de ocho libros clásicos sobre dinero, en dos frases y un paso práctico.</p>
        </div>
        <div className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory flex gap-3 pb-2" style={{ scrollbarWidth: 'none' }}>
          {BOOKS.map((b) => {
            const ink = b.cover === '#2B2B2B' ? '#F4F1EC' : '#111111';
            return (
              <article id={`libro-${b.id}`} key={b.id} className="snap-start shrink-0 w-[78%] max-w-[300px] slab p-0 overflow-hidden flex flex-col scroll-mt-24">
                <div className="p-4 pb-3 flex flex-col gap-2 min-h-[132px] justify-between" style={{ background: b.cover }}>
                  <span className="mono text-[10px] opacity-80" style={{ color: ink }}>{b.author.toUpperCase()} · {b.year}</span>
                  <h3 className="display text-[1.35rem] leading-[1.02]" style={{ color: ink }}>{b.title}</h3>
                  {b.original && <span className="mono text-[9px] opacity-70" style={{ color: ink }}>{b.original.toUpperCase()}</span>}
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <p className="display text-lg text-amber leading-tight">{b.idea}</p>
                  <p className="text-[13px] text-paper/80 leading-relaxed flex-1">{b.summary}</p>
                  <p className="text-[13px] text-paper leading-relaxed border-t border-[#2A2A2A] pt-2">
                    <span className="mono text-[10px] text-amber block">PRUÉBALO</span>
                    {b.apply}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <p className="mono text-[10px] text-ink/50 px-1 leading-relaxed">
        CONTENIDO EDUCATIVO Y GENERAL, RESUMIDO CON PALABRAS PROPIAS. NO ES ASESORAMIENTO FINANCIERO NI FISCAL PERSONALIZADO. LAS RENTABILIDADES PASADAS NO GARANTIZAN LAS FUTURAS. ANTES DE INVERTIR, INFÓRMATE O CONSULTA A UN PROFESIONAL.
      </p>
    </div>
  );
}
