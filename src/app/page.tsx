import { MoneyTracker } from "@/components/MoneyTracker";

export default function Home() {
  return (
    <div className="min-h-screen px-4 pt-6 sm:pt-10">
      <div className="w-full max-w-md mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="display text-[1.35rem] leading-none text-paper">The best Laura</h1>
          <span className="page-meta text-[10px]">GASTOS · AHORRO · CONSEJOS</span>
        </header>
        <main>
          <MoneyTracker />
        </main>
      </div>
    </div>
  );
}
