import React from 'react';

export const MuscleHeatmap = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-xl border border-accent/20">
      <h2 className="text-accent text-2xl font-bold mb-4">MUSCLE HEATMAP</h2>
      <div className="flex gap-2">
        <div className="w-12 h-12 bg-accent rounded-full border border-background" title="Activo (Bronce)"></div>
        <div className="w-12 h-12 bg-[#392A1D] rounded-full border border-background" title="Descanso"></div>
      </div>
      <p className="mt-4 text-foreground/80">Mapa de calor de músculos entrenados.</p>
    </div>
  );
};
