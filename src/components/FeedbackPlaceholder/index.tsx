import React from 'react';

export const FeedbackPlaceholder = () => {
  return (
    <div className="bg-card/30 p-12 rounded-lg shadow-xl border-2 border-dashed border-accent/30 text-center flex flex-col items-center justify-center space-y-6">
      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-2">
        <svg className="w-10 h-10 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      
      <div>
        <h2 className="text-accent text-3xl font-bold mb-1 tracking-tight">VISION FEEDBACK</h2>
        <p className="text-foreground/70 text-lg">Inteligencia Artificial para análisis de técnica</p>
      </div>

      <div className="px-5 py-2 bg-accent/10 rounded-full text-sm font-bold uppercase tracking-widest text-accent border border-accent/20">
        Módulo en Construcción
      </div>

      <p className="text-foreground/50 text-sm max-w-md mt-4">
        Sube un video de tu levantamiento y la IA analizará tu biomecánica, recorrido y cadencia para optimizar la hipertrofia y prevenir lesiones.
      </p>
    </div>
  );
};
