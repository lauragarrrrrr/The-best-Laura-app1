'use client';

import React, { useState } from 'react';
import { GymEngine } from "@/components/GymEngine";
import { LazyChef } from "@/components/LazyChef";
import { PhraseOfTheDay } from "@/components/PhraseOfTheDay";
import { FeedbackPlaceholder } from "@/components/FeedbackPlaceholder";

export default function Home() {
  const [activeTab, setActiveTab] = useState('Trainings');

  const tabs = ['Trainings', 'Food', 'Feedback'];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-accent mb-2">
          The best Laura
        </h1>
        <p className="text-accent/60 uppercase tracking-widest text-sm font-semibold">Espresso Edition | Premium Fitness Logic</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <PhraseOfTheDay />

        {/* Navigation Premium */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 bg-card/30 p-2 rounded-xl border border-accent/10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-2 rounded-lg font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-accent text-background shadow-[0_0_20px_rgba(213,206,163,0.3)] scale-[1.02]' 
                  : 'bg-transparent text-foreground/60 hover:bg-card hover:text-accent border border-transparent hover:border-accent/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'Trainings' && (
            <div className="space-y-8">
              <GymEngine />
            </div>
          )}

          {activeTab === 'Food' && (
            <div className="flex flex-col gap-10 items-center justify-center">
              <div className="w-full max-w-4xl">
                <LazyChef />
              </div>
            </div>
          )}


          {activeTab === 'Feedback' && (
            <div className="space-y-8">
              <FeedbackPlaceholder />
            </div>
          )}
        </section>
      </main>

      <footer className="mt-20 pt-8 border-t border-accent/10 text-center text-sm text-foreground/40">
        &copy; 2026 The Best Laura - Lujo Orgánico & Alto Rendimiento
      </footer>
    </div>
  );
}
