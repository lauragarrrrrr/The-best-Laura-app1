import { MoneyTracker } from "@/components/MoneyTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-accent mb-2">
          The best Laura
        </h1>
        <p className="text-accent/60 uppercase tracking-widest text-xs font-semibold">
          Control de gastos y suscripciones
        </p>
      </header>

      <main className="w-full max-w-2xl mx-auto">
        <MoneyTracker />
      </main>

      <footer className="mt-16 pt-6 border-t border-accent/10 text-center text-sm text-foreground/40">
        &copy; 2026 The Best Laura
      </footer>
    </div>
  );
}
