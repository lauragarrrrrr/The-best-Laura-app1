# The best Laura · Control de gastos

App personal para controlar gastos y suscripciones, hecha con Next.js.

## Qué hace

- **Resumen del mes:** total gastado, % frente al mes anterior, gastos fijos y lo que queda pendiente de pagar.
- **Calendario:** cada cobro aparece en su día; los pagos recurrentes se marcan como *Pagado* / *Pendiente* cada mes.
- **Categorías:** gráfico circular y lista con el porcentaje de cada categoría (Hogar, Alimentación, Ocio y viajes…).
- **Añadir gastos:** puntuales o mensuales (suscripciones, recibos, alquiler).

Los datos se guardan en el navegador (`localStorage`), así que no se comparten entre dispositivos.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

El código principal está en `src/components/MoneyTracker/index.tsx`.
