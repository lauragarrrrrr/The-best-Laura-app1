'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RECIPES, Recipe } from '../../data/recipesLibrary';

// --- TYPES & CONSTANTS ---
type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const CATEGORIES: Recipe['category'][] = ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];

type WeeklyPlan = Record<DayOfWeek, Record<Recipe['category'], Recipe | null>>;

const normalizeText = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const initialPlan: WeeklyPlan = DAYS.reduce((acc, day) => {
  acc[day] = CATEGORIES.reduce((catAcc, cat) => {
    catAcc[cat] = null;
    return catAcc;
  }, {} as Record<Recipe['category'], Recipe | null>);
  return acc;
}, {} as WeeklyPlan);

const MEAL_COLORS: Record<Recipe['category'], string> = {
  'Desayuno': 'shadow-[0_0_15px_rgba(213,206,163,0.3)] border-[#D5CEA3]/30 bg-[#D5CEA3]/5',
  'Almuerzo': 'shadow-[0_0_15px_rgba(189,170,122,0.3)] border-[#BDAA7A]/30 bg-[#BDAA7A]/5',
  'Comida': 'shadow-[0_0_15px_rgba(57,42,29,0.3)] border-[#392A1D]/30 bg-[#392A1D]/10',
  'Merienda': 'shadow-[0_0_15px_rgba(39,33,27,0.3)] border-[#27211B]/30 bg-[#27211B]/10',
  'Cena': 'shadow-[0_0_15px_rgba(26,18,11,0.3)] border-[#1A120B]/30 bg-[#1A120B]/10',
};

const MEAL_TAG_COLORS: Record<Recipe['category'], string> = {
  'Desayuno': 'text-[#D5CEA3] bg-[#D5CEA3]/10',
  'Almuerzo': 'text-[#BDAA7A] bg-[#BDAA7A]/10',
  'Comida': 'text-[#8B7E5D] bg-[#392A1D]',
  'Merienda': 'text-[#D5CEA3]/60 bg-[#27211B]',
  'Cena': 'text-white/40 bg-black/40',
};

export const LazyChef = () => {
  const [activeTab, setActiveTab] = useState<'recetario' | 'planificador'>('recetario');
  const [selectedCategory, setSelectedCategory] = useState<Recipe['category']>('Comida');
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(initialPlan);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Suggestion randomness
  const [suggestionSeeds, setSuggestionSeeds] = useState<Record<string, number>>(
    CATEGORIES.reduce((acc, cat) => ({...acc, [cat]: 0}), {})
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [lastRecipeId, setLastRecipeId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('avantis_lazychef_plan_v2');
    if (saved) {
      try {
        setWeeklyPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading plan", e);
      }
    }
    setIsHydrated(true);
  }, []);

  const savePlan = (plan: WeeklyPlan) => {
    setWeeklyPlan(plan);
    localStorage.setItem('avantis_lazychef_plan_v2', JSON.stringify(plan));
  };

  // Recipe Selection & Assignment logic
  const [isAssigning, setIsAssigning] = useState<Recipe | null>(null);
  
  const assignRecipe = (day: DayOfWeek, category: Recipe['category'], recipe: Recipe) => {
    const next = { ...weeklyPlan, [day]: { ...weeklyPlan[day], [category]: recipe } };
    savePlan(next);
    setIsAssigning(null);
  };

  const removeRecipe = (day: DayOfWeek, category: Recipe['category']) => {
    const next = { ...weeklyPlan, [day]: { ...weeklyPlan[day], [category]: null } };
    savePlan(next);
  };

  // MOVE LOGIC
  const [isMoving, setIsMoving] = useState<{day: DayOfWeek, category: Recipe['category'], recipe: Recipe} | null>(null);

  const moveRecipeTo = (newDay: DayOfWeek, newCat: Recipe['category']) => {
    if (!isMoving) return;
    const { day: oldDay, category: oldCat, recipe } = isMoving;
    
    const next = { ...weeklyPlan };
    next[oldDay] = { ...next[oldDay], [oldCat]: null };
    next[newDay] = { ...next[newDay], [newCat]: recipe };
    
    savePlan(next);
    setIsMoving(null);
  };

  // SHUFFLE & SMART FILTER LOGIC
  const currentRecipes = useMemo(() => {
    const q = searchTerm.trim() ? normalizeText(searchTerm) : '';
    
    // Global search if query exists, otherwise filtered by category
    let pool = q 
      ? RECIPES.filter(r => 
          normalizeText(r.name).includes(q) || 
          r.tags.some(t => normalizeText(t).includes(q)) ||
          r.ingredients.some(i => normalizeText(i.item).includes(q))
        )
      : RECIPES.filter(r => r.category === selectedCategory);

    // Use the seed to "shuffle"
    const seed = suggestionSeeds[selectedCategory] || 0;
    const shuffled = [...pool].sort((a, b) => {
       const hashA = (a.id.length * (seed + 1)) % (pool.length || 1);
       const hashB = (b.id.length * (seed + 1)) % (pool.length || 1);
       return hashA - hashB;
    });

    // If searching, show more results, otherwise slice for suggestions
    const results = q ? shuffled : shuffled.slice(0, 6);
    return results;
  }, [selectedCategory, suggestionSeeds, searchTerm]);

  const handleShuffle = () => {
    setSuggestionSeeds(p => ({ ...p, [selectedCategory]: (p[selectedCategory] || 0) + 1 }));
    
    // Feature: Pick a new active recipe index that isn't the current one
    if (currentRecipes.length > 1) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * currentRecipes.length);
      } while (currentRecipes[newIndex]?.id === lastRecipeId);
      
      setActiveRecipeIndex(newIndex);
      setLastRecipeId(currentRecipes[newIndex]?.id);
    }
  };

  const featuredRecipe = useMemo(() => {
    return currentRecipes[activeRecipeIndex] || currentRecipes[0];
  }, [currentRecipes, activeRecipeIndex]);

  // SHOPPING LIST LOGIC
  const shoppingList = useMemo(() => {
    const items: Record<string, { amount: string; category: string; price: number; count: number }> = {};
    let totalBudget = 0;

    Object.values(weeklyPlan).forEach(day => {
      Object.values(day).forEach(recipe => {
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            const key = ing.item;
            if (!items[key]) {
              items[key] = { amount: ing.amount, category: ing.category, price: ing.price, count: 1 };
            } else {
              items[key].count += 1;
            }
            totalBudget += ing.price;
          });
        }
      });
    });

    return { 
      list: Object.entries(items).map(([name, data]) => ({ name, ...data })), 
      totalBudget 
    };
  }, [weeklyPlan]);

  if (!isHydrated) return null;

  return (
    <div className="bg-[#1A120B] text-[#F5F5F5] font-sans p-2 sm:p-6 rounded-3xl border border-[#D5CEA3]/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col items-center mb-10 gap-8">
        <div className="text-center group">
          <h2 className="text-5xl font-black tracking-tighter text-[#D5CEA3] flex items-center gap-3 justify-center mb-2 group-hover:drop-shadow-[0_0_15px_rgba(213,206,163,0.4)] transition-all">
            <span className="opacity-30">LAZY</span> CHEF
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-[#D5CEA3]/20"></div>
            <p className="text-[11px] tracking-[0.4em] font-black text-[#D5CEA3]/50 uppercase">Espresso Nutrition Hub</p>
            <div className="h-[1px] w-8 bg-[#D5CEA3]/20"></div>
          </div>
        </div>

        <div className="flex gap-1 p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full max-w-sm">
          <button 
            onClick={() => setActiveTab('recetario')}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'recetario' ? 'bg-[#D5CEA3] text-[#1A120B] shadow-[0_0_25px_rgba(213,206,163,0.3)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Recetario
          </button>
          <button 
            onClick={() => setActiveTab('planificador')}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'planificador' ? 'bg-[#D5CEA3] text-[#1A120B] shadow-[0_0_25px_rgba(213,206,163,0.3)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Planificador
          </button>
        </div>
      </div>

      {/* --- ASSISTANT: SMART SEARCH --- */}
      {activeTab === 'recetario' && (
        <div className="max-w-xl mx-auto mb-16 px-4 animate-in fade-in zoom-in duration-700">
           <div className="relative group">
              {/* Glassmorphism Input Container */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#D5CEA3]/20 via-[#BDAA7A]/20 to-[#392A1D]/20 rounded-[30px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[28px] p-1.5 flex items-center shadow-2xl overflow-hidden hover:border-[#D5CEA3]/30 transition-all">
                 <div className="pl-6 text-[#D5CEA3]/40">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="¿Qué te apetece hoy? (ej: salmon, proteica, salmorejo)"
                   className="w-full bg-transparent border-none focus:ring-0 text-lg py-5 px-6 placeholder-white/20 text-[#D5CEA3] font-medium selection:bg-[#D5CEA3]/30"
                 />
                 {searchTerm && (
                   <button onClick={() => setSearchTerm('')} className="pr-6 text-white/20 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 )}
              </div>
              
              {/* Search Badge Counter */}
              {searchTerm && currentRecipes.length > 0 && (
                <div className="absolute -bottom-3 right-8 bg-[#D5CEA3] text-[#1A120B] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {currentRecipes.length} resultados
                </div>
              )}
           </div>
        </div>
      )}

      {/* --- CONTENT: RECETARIO --- */}
      {activeTab === 'recetario' && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
            <div className="flex gap-2 p-1 bg-black/20 rounded-2xl border border-white/5">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${selectedCategory === cat ? 'bg-[#D5CEA3] text-[#1A120B] shadow-md' : 'text-white/40 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button 
              onClick={handleShuffle}
              className="bg-[#D5CEA3]/10 hover:bg-[#D5CEA3] hover:text-[#1A120B] border border-[#D5CEA3]/20 px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all group active:scale-95"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span> Sugerencias
            </button>
          </div>
          
          {/* FEATURED RECIPE SECTION */}
          {!searchTerm && featuredRecipe && (
            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D5CEA3]/20"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D5CEA3]">Sugerencia de hoy</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D5CEA3]/20"></div>
              </div>
              <div className="max-w-2xl mx-auto">
                <RecipeCard 
                  recipe={featuredRecipe} 
                  onAssign={() => setIsAssigning(featuredRecipe)} 
                  featured
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentRecipes.filter(r => !featuredRecipe || r.id !== featuredRecipe.id || searchTerm).map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onAssign={() => setIsAssigning(recipe)} 
              />
            ))}
          </div>

          {currentRecipes.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] animate-in fade-in zoom-in duration-500">
               <div className="text-4xl mb-4">👨‍🍳🔎</div>
               <p className="text-xl font-bold text-[#D5CEA3] mb-2">¡Vaya! Parece que el chef aún no tiene esa receta</p>
               <p className="text-sm text-white/30 uppercase tracking-[0.2em]">¿Quieres probar con otra cosa?</p>
            </div>
          )}
        </div>
      )}

      {/* --- CONTENT: PLANIFICADOR --- */}
      {activeTab === 'planificador' && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-12">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#D5CEA3]/30">Weekly Structure</h3>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Interactive Grid</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {DAYS.map(day => (
                <div key={day} className="bg-[#27211B] border border-white/5 rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#D5CEA3]/10 group-hover:bg-[#D5CEA3]/40 transition-all"></div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-24 shrink-0">
                      <span className="text-xl font-black text-[#D5CEA3] tracking-tighter uppercase block">{day}</span>
                      <div className="h-0.5 w-8 bg-[#D5CEA3]/20 mt-1"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 flex-1 w-full overflow-x-auto no-scrollbar pb-2">
                      {CATEGORIES.map(cat => {
                        const recipe = weeklyPlan[day][cat];
                        return (
                          <div key={cat} className="flex-1 min-w-[140px] group/slot">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2 px-1">{cat}</span>
                            {recipe ? (
                              <div className={`p-4 rounded-2xl relative transition-all duration-300 flex flex-col justify-center min-h-[85px] border ${MEAL_COLORS[cat]}`}>
                                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/slot:opacity-100 transition-all z-10">
                                  <button 
                                    onClick={() => setIsMoving({day, category: cat, recipe})}
                                    className="bg-[#D5CEA3] text-[#1A120B] w-6 h-6 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-90"
                                    title="Mover de lugar"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h8m-8 4h8m-8 4h8" /></svg>
                                  </button>
                                  <button 
                                    onClick={() => removeRecipe(day, cat)}
                                    className="bg-red-500 text-white w-6 h-6 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-90"
                                    title="Eliminar"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                                <span className={`text-[12px] font-bold leading-tight line-clamp-2 ${MEAL_TAG_COLORS[cat].split(' ')[0]}`}>{recipe.name}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] opacity-40 mt-1.5">{recipe.time}</span>
                              </div>
                            ) : (
                              <div 
                                className="bg-black/10 border border-dashed border-white/5 h-[85px] rounded-2xl flex items-center justify-center group/add hover:bg-white/5 transition-all cursor-pointer"
                                onClick={() => setActiveTab('recetario')}
                              >
                                <span className="text-[24px] text-white/5 group-hover/add:text-[#D5CEA3]/40 transition-all">+</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHOPPING LIST */}
          <div className="bg-gradient-to-br from-[#27211B] to-[#1A120B] border border-[#D5CEA3]/20 rounded-[40px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
             {/* Glow overlay */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D5CEA3]/5 blur-[100px] rounded-full"></div>
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 relative z-10">
               <div className="space-y-4">
                 <h3 className="text-4xl sm:text-5xl font-black text-[#D5CEA3] tracking-tighter uppercase italic">Cesta de la Compra</h3>
                 <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D5CEA3] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D5CEA3]"></span>
                    </span>
                    <p className="text-[11px] font-black text-[#D5CEA3]/60 uppercase tracking-[0.3em]">Precios Actualizados Lidl Madrid</p>
                 </div>
               </div>
               
               <div className="bg-[#15120F] px-8 py-7 rounded-[30px] border border-[#D5CEA3]/30 shadow-inner flex flex-col items-center min-w-[240px]">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D5CEA3]/30 mb-2">Presupuesto Estimado</span>
                  <div className="text-5xl font-mono font-black text-[#D5CEA3] tracking-tighter">
                    {shoppingList.totalBudget.toFixed(2)}<span className="text-2xl ml-1 font-sans">€</span>
                  </div>
               </div>
             </div>

             {shoppingList.list.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 relative z-10">
                 {(['Protein', 'Veggie', 'Carb', 'Other'] as const).map(cat => {
                   const filtered = shoppingList.list.filter(i => i.category === cat);
                   if (filtered.length === 0) return null;
                   
                   return (
                     <div key={cat} className="space-y-5">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D5CEA3]/20 px-4 border-l border-[#D5CEA3]/10">
                         {cat === 'Protein' ? 'Proteínas' : cat === 'Veggie' ? 'Vegetales' : cat === 'Carb' ? 'Hidratos' : 'Varios'}
                       </h4>
                       <div className="space-y-2.5">
                         {filtered.map((item, idx) => (
                           <div key={idx} className="bg-white/5 border border-white/5 py-3.5 px-5 rounded-2xl flex items-center justify-between group hover:border-[#D5CEA3]/20 transition-all">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[14px] font-bold text-white group-hover:text-[#D5CEA3] transition-colors">{item.name}</span>
                                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Cant. {item.count}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-mono font-black text-[#D5CEA3]">{(item.price * item.count).toFixed(2)}€</span>
                              </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[30px] group cursor-pointer hover:bg-white/5 transition-all" onClick={() => setActiveTab('recetario')}>
                 <p className="text-xs font-black text-white/10 uppercase tracking-[0.5em] group-hover:text-[#D5CEA3]/40 transition-all">Completa tu plan para generar la lista</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- OVERLAYS: ASSIGNMENT MODAL --- */}
      {isAssigning && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-[#27211B] border border-[#D5CEA3]/30 w-full max-w-sm rounded-[40px] p-8 shadow-2xl scale-in-center overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D5CEA3]/10 blur-3xl"></div>
              
              <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">¿Dónde añadir?</h3>
              <p className="text-[11px] text-[#D5CEA3]/50 font-bold uppercase tracking-widest mb-8">{isAssigning.name}</p>
              
              <div className="space-y-8">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block mb-3">Día de la semana</span>
                   <div className="grid grid-cols-4 gap-2">
                     {DAYS.map(day => (
                       <button 
                         key={day} 
                         onClick={() => assignRecipe(day, isAssigning.category, isAssigning)}
                         className="bg-white/5 hover:bg-[#D5CEA3] hover:text-[#1A120B] border border-white/5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all"
                       >
                         {day.slice(0, 2)}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <button 
                     onClick={() => setIsAssigning(null)}
                     className="w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] text-red-500/60 hover:text-red-400"
                   >
                     Cancelar
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* --- OVERLAYS: MOVE MODAL --- */}
      {isMoving && (
        <div className="fixed inset-0 z-[100] bg-[#1A120B]/90 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-[#27211B] border border-[#D5CEA3]/50 w-full max-w-md rounded-[40px] p-10 shadow-3xl">
              <h3 className="text-2xl font-black text-[#D5CEA3] mb-8 uppercase tracking-tighter">Relocalizar Comida</h3>
              
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2 block">Nuevo Día</span>
                      <div className="flex flex-col gap-1.5">
                        {DAYS.map(day => (
                          <button key={day} onClick={() => moveRecipeTo(day, isMoving.category)} className="text-left px-4 py-3 bg-white/5 hover:bg-[#D5CEA3] hover:text-[#1A120B] rounded-xl text-[11px] font-black uppercase transition-all">
                             {day}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2 block">Nueva Toma</span>
                      <div className="flex flex-col gap-1.5">
                        {CATEGORIES.map(cat => (
                          <button key={cat} onClick={() => moveRecipeTo(isMoving.day, cat)} className="text-left px-4 py-3 bg-white/5 hover:bg-[#D5CEA3] hover:text-[#1A120B] rounded-xl text-[11px] font-black uppercase transition-all">
                             {cat}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                <button onClick={() => setIsMoving(null)} className="w-full py-2 text-white/20 font-black uppercase tracking-widest text-xs">Cerrar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const RecipeCard = ({ recipe, onAssign, featured }: { recipe: Recipe, onAssign: () => void, featured?: boolean }) => {
  const [showSteps, setShowSteps] = useState(false);

  const categoryLabel = recipe.category.toUpperCase();

  return (
    <div className={`bg-[#27211B] border border-white/5 p-6 rounded-[35px] hover:border-[#D5CEA3]/30 transition-all duration-300 relative overflow-hidden group flex flex-col h-full ${showSteps ? 'ring-2 ring-[#D5CEA3]/20' : ''} ${featured ? 'border-[#D5CEA3]/40 shadow-[0_0_40px_rgba(213,206,163,0.1)]' : ''}`}>
      
      {/* Top Bar: Category & Time */}
      <div className="flex justify-between items-start mb-6">
        <div className={`px-2.5 py-1 rounded-lg border border-white/5 bg-white/5 text-[8px] font-black tracking-[0.2em] text-[#D5CEA3]/60`}>
          {categoryLabel}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 ${featured ? 'bg-[#D5CEA3] text-[#1A120B]' : 'bg-black/40'}`}>
          <span className={`text-[9px] font-black uppercase tracking-widest ${featured ? 'text-[#1A120B]' : 'text-[#D5CEA3]/60'}`}>{recipe.time}</span>
        </div>
      </div>

      {featured && (
        <div className="absolute -left-12 top-10 -rotate-45 bg-[#D5CEA3] text-[#1A120B] py-1 px-12 text-[8px] font-black uppercase tracking-widest shadow-xl">
          Destacado
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-black text-white group-hover:text-[#D5CEA3] transition-colors leading-tight mb-3">{recipe.name}</h3>
        
        {/* PILLS / TAGS */}
        <div className="flex flex-wrap gap-1.5 mb-1">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border border-white/5 px-2 py-1 rounded-md">0% Pescado</span>
          {recipe.tags?.map(tag => (
            <span key={tag} className="text-[8px] font-black uppercase tracking-[0.15em] text-[#D5CEA3] bg-[#D5CEA3]/5 border border-[#D5CEA3]/10 px-2 py-1 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div>
           <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D5CEA3]/40">
               {showSteps ? 'Escuela de Cocina' : 'Ingredientes'}
             </h4>
             <button onClick={() => setShowSteps(!showSteps)} className="text-[9px] font-black uppercase text-[#D5CEA3] hover:scale-105 transition-transform flex items-center gap-2">
               {showSteps ? (
                 <>
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                   Ingredientes
                 </>
               ) : (
                 <>
                   Ver Receta
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                 </>
               )}
             </button>
           </div>
           
           {!showSteps ? (
             <div className="flex flex-wrap gap-2 animate-in fade-in duration-500">
               {recipe.ingredients.map((ing, i) => (
                 <div key={i} className="text-[11px] font-bold bg-black/20 border border-white/5 px-3 py-2 rounded-xl text-white/70 hover:border-[#D5CEA3]/20 transition-all">
                   {ing.item} <span className="text-[#D5CEA3]/50 ml-1 font-mono">{ing.amount}</span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start group/step">
                      <div className="w-6 h-6 rounded-lg bg-[#D5CEA3]/10 text-[#D5CEA3] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-[#D5CEA3]/20 group-hover/step:bg-[#D5CEA3] group-hover/step:text-[#1A120B] transition-all">
                        {i + 1}
                      </div>
                      <p className="text-[13px] font-medium text-white/80 leading-relaxed italic">{step.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>

                {/* CHEF TIP */}
                {recipe.chefTip && (
                  <div className="mt-8 p-4 bg-[#D5CEA3]/5 border-l-2 border-[#D5CEA3] rounded-r-2xl relative overflow-hidden group/tip">
                    <div className="absolute -right-4 -top-4 text-4xl opacity-5 group-hover/tip:scale-110 transition-transform">👨‍🍳</div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D5CEA3] block mb-2">Chef Tip</span>
                    <p className="text-[12px] text-[#D5CEA3]/80 italic leading-relaxed">"{recipe.chefTip}"</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <button 
          onClick={onAssign}
          className="w-full bg-[#D5CEA3] text-[#1A120B] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all hover:scale-[1.03] active:scale-95 shadow-[0_10px_30px_rgba(213,206,163,0.1)] hover:shadow-[0_15px_40px_rgba(213,206,163,0.3)]"
        >
          Añadir al Plan
        </button>
      </div>
    </div>
  );
};
