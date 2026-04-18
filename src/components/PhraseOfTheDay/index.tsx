'use client';
import React, { useState, useEffect } from 'react';

const phrases = [
  "Tu cuerpo es tu templo, biohackea su potencial.",
  "Hoy no entrenas, hoy construyes la mejor versión de ti.",
  "La disciplina es el puente entre tus metas y tus logros.",
  "Optimiza tu energía, conquista tu día.",
  "El descanso y la nutrición son el origen de tu fuerza.",
  "No cuentes los días, haz que los días cuenten.",
  "Excelencia no es un acto, es un hábito."
];

export const PhraseOfTheDay = () => {
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    // Calculamos el índice basado en el día del año para rotarla automáticamente
    const date = new Date();
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const index = dayOfYear % phrases.length;
    setPhrase(phrases[index]);
  }, []);

  if (!phrase) return null;

  return (
    <div className="bg-card/40 border-l-4 border-accent p-5 rounded-r-lg mb-8 shadow-md transition-all hover:bg-card/60">
      <p className="italic text-foreground/90 font-medium text-lg leading-relaxed">
        "{phrase}"
      </p>
    </div>
  );
};
