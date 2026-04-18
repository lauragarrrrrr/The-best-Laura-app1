'use client';

import React, { useState } from 'react';

// Base de datos mock de ingredientes
const ingredients = {
  proteins: [
    'Pechuga de Pollo',
    'Huevos (Media Docena)',
    'Carne Picada Magra (Vacuno)',
    'Tiras de Pavo Asado',
    'Queso Cottage',
    'Lomo de Cerdo Magro',
    // 'Atún', // Pescado bloqueado mentalmente pero el código abajo filtra doblemente
  ],
  carbs: [
    'Arroz Basmati (Microondas)',
    'Pasta Integral',
    'Patata',
    'Avena en Copos',
    'Pan Integral 100%',
    'Fideos de Arroz'
  ],
  vegetables: [
    'Espinacas Baby',
    'Brócoli en Arbolitos',
    'Pimientos Mixtos',
    'Zanahorias Ralladas',
    'Cebolla Roja',
    'Champiñones Laminados'
  ]
};

// Palabras clave bloqueadas (Hard-filter para asegurar 0% pescado)
const forbiddenKeywords = ['pescado', 'atún', 'salmón', 'merluza', 'bacalao', 'sardina', 'tilapia', 'marisco'];

export const LazyChefShopping = () => {
  const [weeklyList, setWeeklyList] = useState<{
    proteins: string[];
    vegetables: string[];
    carbs: string[];
  } | null>(null);

  const generateList = () => {
    // Función auxiliar para obtener N elementos aleatorios
    const getRandom = (arr: string[], n: number) => {
      // Doble comprobación: filtrar todo lo que coincida con palabras prohibidas
      const safeItems = arr.filter(item => 
        !forbiddenKeywords.some(forbidden => item.toLowerCase().includes(forbidden))
      );
      
      const shuffled = [...safeItems].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    setWeeklyList({
      proteins: getRandom(ingredients.proteins, 3), // 3 fuentes de proteina
      vegetables: getRandom(ingredients.vegetables, 4), // 4 vegetales
      carbs: getRandom(ingredients.carbs, 2) // 2 fuentes de carbohidratos
    });
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-xl border border-accent/20 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-accent text-2xl font-bold tracking-tight">LAZY CHEF</h2>
        <div className="text-[10px] sm:text-xs font-bold px-2 py-1 bg-red-900/30 text-red-400 rounded border border-red-500/20 uppercase tracking-widest flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          0% Pescado
        </div>
      </div>
      
      <p className="text-foreground/70 text-sm mb-6 leading-relaxed">
        Generador de lista de la compra "Anti-Fatiga". Basado en <span className="text-accent font-semibold">15 min prep-time</span>.
      </p>

      <button 
        onClick={generateList}
        className="w-full bg-accent text-background py-3 rounded-md font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(213,206,163,0.15)] hover:shadow-[0_0_20px_rgba(213,206,163,0.3)] mb-6 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        Generar Lista Semanal
      </button>

      {weeklyList ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Categoría: Proteínas */}
          <div className="bg-background/40 p-4 rounded-lg border border-white/5">
            <h3 className="text-accent/90 text-sm uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
              🥩 Proteínas Clave
            </h3>
            <ul className="space-y-2">
              {weeklyList.proteins.map((item, idx) => (
                <li key={idx} className="text-foreground/90 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Categoría: Vegetales */}
          <div className="bg-background/40 p-4 rounded-lg border border-white/5">
            <h3 className="text-emerald-400/90 text-sm uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
              🥦 Vegetales Express (Micros)
            </h3>
            <ul className="space-y-2">
              {weeklyList.vegetables.map((item, idx) => (
                <li key={idx} className="text-foreground/90 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Categoría: Carbohidratos */}
          <div className="bg-background/40 p-4 rounded-lg border border-white/5">
            <h3 className="text-amber-600/90 text-sm uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
              🍚 Hidratos Base (Energía)
            </h3>
            <ul className="space-y-2">
              {weeklyList.carbs.map((item, idx) => (
                <li key={idx} className="text-foreground/90 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="h-40 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center text-foreground/30 text-sm flex-col gap-2 transition-all">
          <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <p>Tu cesta inteligente está vacía</p>
        </div>
      )}
    </div>
  );
};
