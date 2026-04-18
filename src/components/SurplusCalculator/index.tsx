import React from 'react';

export const SurplusCalculator = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-xl border border-accent/20">
      <h2 className="text-accent text-2xl font-bold mb-4">SURPLUS CALCULATOR</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm opacity-60">Edad</label>
          <input type="number" defaultValue={22} className="w-full bg-background border border-accent/20 p-2 rounded" />
        </div>
        <p className="text-sm italic text-accent/80">Calculadora pre-configurada para mujer de 22 años.</p>
      </div>
    </div>
  );
};
