'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { GLOBAL_LIBRARY, ExerciseGuide, MuscleFilter, ExerciseCategory } from '../../data/exercisesLibrary';
import { supabase } from '../../lib/supabaseClient';

// --- TYPES ---
type MetricType = 'kg_reps' | 'time' | 'reps_only';

type SetData = { id: string; type: 'W' | 'normal'; kg: string; reps: string; isCompleted: boolean; };
type ExerciseData = { id: string; name: string; restTimeSecs: number; metricType: MetricType; sets: SetData[]; };
type RoutineData = { id: number; name: string; exercises: ExerciseData[]; };

// --- HELPERS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultSets = (metric: MetricType, numSets = 3): SetData[] => {
  const sets: SetData[] = [{ id: `s_${generateId()}`, type: 'W' as const, kg: '', reps: '', isCompleted: false }];
  for(let i=1; i<=numSets; i++) sets.push({ id: `s_${generateId()}`, type: 'normal' as const, kg: '', reps: '', isCompleted: false });
  return sets;
};

// --- BASE ROUTINES (V4 - New order and names) ---
const DB_ROUTINES: RoutineData[] = [
  {
    id: 1, name: 'E+B',
    exercises: [
      { id: '1-1', name: 'Jalón al Pecho', restTimeSecs: 120, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '1-2', name: 'Remo en Punta (T-Bar)', restTimeSecs: 150, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '1-3', name: 'Jalón Remo 1 Brazo (Cable)', restTimeSecs: 90, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '1-4', name: 'Dorsal con brazos rectos', restTimeSecs: 90, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '1-5', name: 'Curl predicador (máquina)', restTimeSecs: 60, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
    ]
  },
  {
    id: 2, name: 'P+H+T',
    exercises: [
      { id: '2-1', name: 'Press Inclinado Mancuerna', restTimeSecs: 120, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '2-2', name: 'Arnold Press', restTimeSecs: 110, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '2-3', name: 'Fondos Asistidos', restTimeSecs: 120, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '2-4', name: 'Elevación Lateral Cable', restTimeSecs: 75, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '2-5', name: 'Extensión Tríceps Polea / Cuerda', restTimeSecs: 90, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '2-6', name: 'Mariposa / Pec Deck', restTimeSecs: 85, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '2-7', name: 'Press Hombro Máquina', restTimeSecs: 90, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
    ]
  },
  {
    id: 3, name: 'C+G',
    exercises: [
      { id: '4-1', name: 'Sentadilla con Cinturón (Belt Squat)', restTimeSecs: 165, metricType: 'kg_reps', sets: defaultSets('kg_reps', 4) },
      { id: '4-2', name: 'Sentadilla Búlgara', restTimeSecs: 165, metricType: 'kg_reps', sets: defaultSets('kg_reps', 4) },
      { id: '4-3', name: 'Prensa de Piernas', restTimeSecs: 180, metricType: 'kg_reps', sets: defaultSets('kg_reps', 4) },
    ]
  },
  {
    id: 4, name: 'I+G',
    exercises: [
      { id: '3-1', name: 'Hip Thrust Smith', restTimeSecs: 120, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '3-2', name: 'Peso Muerto Rumano (Mancuerna)', restTimeSecs: 100, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '3-3', name: 'Curl Pierna Sentado', restTimeSecs: 100, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '3-4', name: 'Hiperextensión con peso', restTimeSecs: 100, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
      { id: '3-5', name: 'Patada Glúteo Cable', restTimeSecs: 100, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
    ]
  },
  {
    id: 5, name: 'Core',
    exercises: [
      { id: '5-1', name: 'Crunch Lateral', restTimeSecs: 45, metricType: 'reps_only', sets: defaultSets('reps_only') },
      { id: '5-2', name: 'Russian Twist', restTimeSecs: 60, metricType: 'reps_only', sets: defaultSets('reps_only') },
      { id: '5-3', name: 'Plancha', restTimeSecs: 60, metricType: 'time', sets: defaultSets('time') },
      { id: '5-4', name: 'Single Dead Bug', restTimeSecs: 60, metricType: 'reps_only', sets: defaultSets('reps_only') },
      { id: '5-5', name: 'Escalador (Mountain)', restTimeSecs: 45, metricType: 'time', sets: defaultSets('time') },
      { id: '5-6', name: 'Curl Pierna Acostado', restTimeSecs: 75, metricType: 'kg_reps', sets: defaultSets('kg_reps') },
    ]
  }
];

// --- MOCK HISTORY MACHINE ---
const getMockHistory = (ex: string) => [
  { date: 'Hace 3 días', data: '12x 100 kg / Ok' },
  { date: 'Hace 1 sem', data: '10x 95 kg / PR' },
  { date: 'Hace 2 sem', data: '8x 90 kg / Pesado' },
  { date: 'Hace 3 sem', data: '12x 80 kg / Cal.' },
];

const formatSecs = (sec: number) => { const m = Math.floor(sec / 60); const s = sec % 60; return m > 0 ? `${m}m ${s}s` : `${s}s`; };
const formatStopwatch = (total: number) => { 
  const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = total % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const getRoutineShortName = (name: string) => {
  if (name === 'E+B') return 'E+B';
  if (name === 'P+H+T') return 'P+H+T';
  if (name === 'C+G') return 'C+G';
  if (name === 'I+G') return 'I+G';
  return 'Core';
};

const getRoutineGradient = (id: number) => {
  switch (id) {
    case 1: return 'from-emerald-900/60 via-emerald-800/10 to-transparent'; 
    case 2: return 'from-blue-900/60 via-blue-800/10 to-transparent';
    case 3: return 'from-[#D5CEA3]/40 via-[#D5CEA3]/10 to-transparent'; 
    case 4: return 'from-purple-900/60 via-purple-800/10 to-transparent';
    case 5: return 'from-teal-900/60 via-teal-800/10 to-transparent';
    default: return 'from-accent/30 to-transparent';
  }
};

const getRoutineThemeColor = (id: number) => {
  switch(id) {
     case 1: return 'text-emerald-400';
     case 2: return 'text-blue-400';
     case 3: return 'text-[#D5CEA3]';
     case 4: return 'text-purple-400';
     case 5: return 'text-teal-400';
     default: return 'text-accent';
  }
};

export const GymEngine = () => {
  // STATE SYNC
  const [routines, setRoutines] = useState<RoutineData[]>([]);
  const [selectedDayId, setSelectedDayId] = useState(1);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [restTimer, setRestTimer] = useState({ active: false, remaining: 0, total: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // EXPANDED UI
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});
  const [guideTabs, setGuideTabs] = useState<Record<string, 'how' | 'history'>>({});

  // LIBRARY MODAL
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<MuscleFilter | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryPreview, setLibraryPreview] = useState<string | null>(null);

  // INIT & SYNC LOCALSTORAGE (v4 for forced re-order update)
  useEffect(() => {
    const saved = localStorage.getItem('avantis_routines_v5');
    if (saved) {
      setRoutines(JSON.parse(saved));
    } else {
      setRoutines(DB_ROUTINES);
      localStorage.setItem('avantis_routines_v5', JSON.stringify(DB_ROUTINES));
    }
  }, []);

  // Save changes hook
  const saveToLS = (updated: RoutineData[]) => {
    setRoutines(updated);
    localStorage.setItem('avantis_routines_v5', JSON.stringify(updated));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrainingStarted) interval = setInterval(() => setSessionSecs(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isTrainingStarted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer.active && restTimer.remaining > 0) {
      interval = setInterval(() => setRestTimer(p => p.remaining <= 1 ? { ...p, active: false, remaining: 0 } : { ...p, remaining: p.remaining - 1 }), 1000);
    } else if (restTimer.remaining === 0) setRestTimer(p => ({ ...p, active: false }));
    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.remaining]);

  const activeRoutine = useMemo(() => routines.find(r => r.id === selectedDayId) || null, [routines, selectedDayId]);
  
  const totalVolume = useMemo(() => {
    if (!activeRoutine) return 0;
    return activeRoutine.exercises.reduce((acc, ex) => {
      if (ex.metricType === 'kg_reps') acc += ex.sets.reduce((vACC, s) => s.isCompleted ? vACC + ((parseFloat(s.kg)||0) * (parseInt(s.reps)||0)) : vACC, 0);
      return acc;
    }, 0);
  }, [activeRoutine]);
  
  const allSetsCompleted = useMemo(() => {
    if (!activeRoutine) return false;
    const sets = activeRoutine.exercises.flatMap(e => e.sets);
    return sets.length > 0 && sets.every(s => s.isCompleted);
  }, [activeRoutine]);

  if (routines.length === 0 || !activeRoutine) return null; // Hydration guard

  // DATA HANDLERS
  const handleUpdateSet = (rId: number, exId: string, setId: string, field: 'kg' | 'reps', val: string) => {
    const next = routines.map(ro => ro.id !== rId ? ro : { ...ro, exercises: ro.exercises.map(ex => ex.id !== exId ? ex : { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: val } : s) }) });
    setRoutines(next); // Not saving to LS character by character typing to avoid lag
  };

  const toggleSetComplete = (rId: number, exId: string, setId: string, rSecs: number) => {
    const next = routines.map(ro => ro.id !== rId ? ro : { ...ro, exercises: ro.exercises.map(ex => ex.id !== exId ? ex : { ...ex, sets: ex.sets.map(s => {
      if (s.id !== setId) return s;
      const willBe = !s.isCompleted;
      if (willBe && isTrainingStarted) setRestTimer({ active: true, total: rSecs, remaining: rSecs });
      return { ...s, isCompleted: willBe };
    })})});
    setRoutines(next);
  };

  const addSet = (rId: number, exId: string) => {
    const next = routines.map(ro => ro.id !== rId ? ro : { ...ro, exercises: ro.exercises.map(ex => ex.id !== exId ? ex : { ...ex, sets: [...ex.sets, { id: `s_${generateId()}`, type: 'normal' as const, kg: '', reps: '', isCompleted: false }] }) });
    saveToLS(next);
  };

  // ROUTINE EDITOR HANDLERS
  const removeExercise = (rId: number, exId: string) => {
    const next = routines.map(ro => ro.id !== rId ? ro : { ...ro, exercises: ro.exercises.filter(ex => ex.id !== exId) });
    saveToLS(next);
  };

  const moveExercise = (rId: number, exId: string, direction: 'up' | 'down') => {
    const next = routines.map(ro => {
      if (ro.id !== rId) return ro;
      const exIndex = ro.exercises.findIndex(e => e.id === exId);
      if (exIndex === -1) return ro;
      if (direction === 'up' && exIndex === 0) return ro;
      if (direction === 'down' && exIndex === ro.exercises.length - 1) return ro;
      
      const newExes = [...ro.exercises];
      const swapIndex = direction === 'up' ? exIndex - 1 : exIndex + 1;
      const temp = newExes[exIndex];
      newExes[exIndex] = newExes[swapIndex];
      newExes[swapIndex] = temp;
      
      return { ...ro, exercises: newExes };
    });
    saveToLS(next);
  };

  const insertExerciseFromLibrary = (exerciseName: string) => {
    const guide = GLOBAL_LIBRARY[exerciseName];
    const metricType: MetricType = guide.category === 'core' ? (exerciseName.includes('Plancha') || exerciseName.includes('Escalador') ? 'time' : 'reps_only') : 'kg_reps';
    const restTime = guide.category === 'core' ? 60 : 120;
    const newEx: ExerciseData = { id: `gen_${generateId()}`, name: exerciseName, restTimeSecs: restTime, metricType, sets: defaultSets(metricType, 3) };
    
    const next = routines.map(ro => ro.id !== selectedDayId ? ro : { ...ro, exercises: [...ro.exercises, newEx] });
    saveToLS(next);
    setIsLibraryOpen(false);
    setLibraryPreview(null);
  };

  const toggleGuide = (exId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button.editor-trash') || (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('button.editor-arrow')) return;
    setExpandedGuides(p => ({ ...p, [exId]: !p[exId] }));
    if (!expandedGuides[exId]) setGuideTabs(p => ({ ...p, [exId]: 'how' }));
  };

  const handleFinishTraining = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus('saving');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRestTimer({ active: false, remaining: 0, total: 0 });

    // Build the workout record to save
    const workoutRecord = {
      id: `workout_${Date.now()}`,
      routine_name: activeRoutine?.name || 'Sesión',
      duration: formatStopwatch(sessionSecs),
      exercises: activeRoutine?.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets
          .filter(s => s.isCompleted)
          .map(s => ({ kg: s.kg, reps: s.reps, type: s.type }))
      })) || [],
    };

    try {
      const { error } = await supabase.from('workouts').insert(workoutRecord);
      if (error) throw error;
      setSaveStatus('success');
      console.log('💪 Entrenamiento guardado en Supabase:', workoutRecord.routine_name);
    } catch (err) {
      console.error('❌ Error guardando entrenamiento:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setIsTrainingStarted(false);
        setSessionSecs(0);
        setSaveStatus('idle');
      }, 5000);
    }
  };

  // LIBRERÍA DE BÚSQUEDA DINÁMICA
  const libraryEntries = Object.entries(GLOBAL_LIBRARY).filter(([name, guide]) => {
     const matchesFilter = libraryFilter === 'Todos' || guide.muscle === libraryFilter;
     const matchesSearch = searchQuery === '' || name.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesFilter && matchesSearch;
  });
  const FILTERS = ['Todos', 'Espalda', 'Pecho', 'Hombro', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquios', 'Glúteo', 'Core'];

  return (
    <div className="bg-[#1A120B] md:p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] md:border border-accent/20 relative overflow-hidden font-sans">
      
      {/* NAVBAR: VOLVER AL MENU */}
      {isTrainingStarted ? (
        <div className="bg-[#15100B] p-4 flex flex-col gap-4 border-b border-white/5 mb-6 sticky top-0 z-40 shadow-md transition-all">
          <button onClick={() => setIsTrainingStarted(false)} className="mx-auto bg-[#392A1D]/50 hover:bg-[#392A1D] border border-accent/20 w-full sm:w-auto px-6 py-2.5 rounded-xl flex items-center justify-center text-accent font-black text-xs tracking-widest transition-all hover:scale-105">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            VOLVER AL MENÚ DE EDICIÓN
          </button>
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold tracking-wider text-accent shrink-0">
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-foreground/50 text-[10px]">TIEMPO</span>
              <span className="font-mono text-base">{formatStopwatch(sessionSecs)}</span>
            </div>
            <div className="text-center font-bold text-[15px] sm:text-lg tracking-[0.2em] px-2 leading-tight flex-1">{activeRoutine.name}</div>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-foreground/50 text-[10px]">VOLUMEN</span>
              <span className="font-mono text-base">{totalVolume}<span className="text-[10px]">kg</span></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col items-center text-center">
           <h2 className="text-accent text-3xl font-extrabold tracking-widest uppercase mb-1">The best Laura</h2>
           <p className="text-foreground/40 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">ARCHIT. ROUTINE EDITOR</p>
           <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-2 max-w-2xl px-2">
             {routines.map((d) => {
               const shortName = getRoutineShortName(d.name);
               const isSelected = selectedDayId === d.id;
               return (
                 <button key={d.id} onClick={() => setSelectedDayId(d.id)} className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all tracking-[0.15em] flex items-center shadow-sm ${
                   isSelected ? 'bg-accent text-[#15100B] scale-110 shadow-[0_0_15px_rgba(213,206,163,0.4)]' : 'bg-[#27211B] text-foreground/70 hover:bg-[#392A1D] hover:text-accent border border-white/5'
                 }`}>
                   {shortName}
                 </button>
               );
             })}
           </div>
        </div>
      )}

      {/* DASHBOARD PREVIO (ESTADO DE EDICIÓN / DESCANSO) */}
      {!isTrainingStarted ? (
        <div className="flex flex-col py-6 space-y-6 px-4 pb-20 max-w-3xl mx-auto">
          {/* HEADER VISUAL GLOW */}
          <div className={`w-full rounded-2xl p-0 shadow-xl flex flex-col mb-4 overflow-hidden border border-white/10 bg-[#27211B]`}>
            <div className={`h-36 sm:h-44 w-full relative flex flex-col justify-end p-6 bg-gradient-to-t ${getRoutineGradient(activeRoutine.id)}`}>
               <h3 className={`text-3xl sm:text-4xl font-black ${getRoutineThemeColor(activeRoutine.id)} tracking-tighter uppercase leading-none drop-shadow-md mb-2`}>
                 {activeRoutine.name}
               </h3>
               <p className="text-white/70 text-xs sm:text-sm font-semibold tracking-widest uppercase">{activeRoutine.exercises.length} movimientos focalizados</p>
            </div>
            <div className="p-5 bg-background/50 border-t border-white/5">
              <button 
                onClick={() => setIsTrainingStarted(true)} 
                className="bg-blue-600/90 text-white w-full py-4 rounded-xl font-black text-base sm:text-lg hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-[0_5px_30px_rgba(37,99,235,0.3)] tracking-widest uppercase border border-blue-400/30"
              >
                COMENZAR RUTINA
              </button>
            </div>
          </div>

          {/* LISTA DE EJERCICIOS PARA EDICIÓN ANIMADA */}
          <div className="space-y-3 sm:space-y-4">
             <div className="flex items-center justify-between px-2 mb-2">
                <h4 className="text-xs font-black tracking-widest text-[#EAE4C4] uppercase">Estructura Actual</h4>
                <span className="text-[10px] uppercase font-bold text-foreground/40 bg-white/5 px-2 py-1 rounded tracking-widest">Modo Editor</span>
             </div>
             
             {activeRoutine.exercises.map((ex, index) => (
                <div key={ex.id} className="bg-[#27211B] border border-white/5 p-4 rounded-xl flex items-center justify-between transition-all duration-300 transform hover:-translate-y-1 hover:border-accent/30 shadow-sm group">
                   <div className="flex items-center gap-4 relative z-10 w-full">
                      <div className="flex-1 min-w-0 pr-4">
                        <h5 className="font-extrabold text-sm sm:text-[15px] text-white/90 truncate max-w-full leading-tight">{ex.name}</h5>
                        <p className="text-[10px] text-accent/80 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                           <span className="bg-background/80 px-1.5 py-0.5 rounded">{index + 1}º</span>
                           <span>{ex.sets.length} SERIES</span>
                        </p>
                      </div>
                   </div>
                   
                   {/* ACTIONS: FLECHAS Y ELIMINAR */}
                   <div className="flex gap-2 isolate relative z-10 opacity-70 group-hover:opacity-100 transition-opacity pl-2 shrink-0 border-l border-white/10">
                       <div className="flex flex-col gap-1 items-center">
                         <button onClick={() => moveExercise(activeRoutine.id, ex.id, 'up')} disabled={index === 0} className="editor-arrow w-8 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 hover:text-accent hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8l6 6H6z" /></svg>
                         </button>
                         <button onClick={() => moveExercise(activeRoutine.id, ex.id, 'down')} disabled={index === activeRoutine.exercises.length - 1} className="editor-arrow w-8 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 hover:text-accent hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-6-6h12z" /></svg>
                         </button>
                       </div>
                       <button 
                         onClick={() => removeExercise(activeRoutine.id, ex.id)}
                         className="editor-trash w-10 sm:w-12 h-auto rounded-lg flex items-center justify-center text-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors ml-1"
                         title="Eliminar de la Rutina"
                       >
                         <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                   </div>
                </div>
             ))}

             {/* BOTON + AÑADIR */}
             <button 
               onClick={() => setIsLibraryOpen(true)}
               className="w-full border border-dashed border-accent/20 text-accent/80 hover:text-accent hover:border-accent hover:bg-accent/5 font-black text-sm tracking-[0.2em] uppercase p-5 rounded-xl transition-all flex items-center justify-center gap-3 mt-4"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Añadir Ejercicio 
             </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-40 px-2 sm:px-6"> 
          {/* VISTA DURANTE EL ENTRENAMIENTO */}
          {activeRoutine.exercises.map((exercise, index) => {
             const guide = GLOBAL_LIBRARY[exercise.name];
             const isExpanded = expandedGuides[exercise.id];
             const currentTab = guideTabs[exercise.id] || 'how';
             const historyMocks = getMockHistory(exercise.name);

             return (
              <div key={exercise.id} className="bg-[#27211B] rounded-2xl overflow-hidden shadow-xl border border-white/5 transition-all">
                {/* HEAD (CLICK GUIDE) */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-background/40 to-background/5 cursor-pointer group hover:bg-background/60 transition-colors" onClick={(e) => toggleGuide(exercise.id, e)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 w-full">
                       <div className="w-8 h-8 rounded-lg bg-[#392A1D] flex items-center justify-center border border-accent/30 text-accent font-black shadow-inner shrink-0 text-sm">
                          {index + 1}
                       </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-white/95 font-extrabold text-[15px] sm:text-lg flex items-center gap-2 truncate leading-tight tracking-wide">
                          <span className="truncate">{exercise.name}</span>
                          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30 group-hover:bg-accent group-hover:text-black transition-colors shrink-0">
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M13 9h-2V7h2v2zm0 8h-2v-6h2v6zm-1-15a10 10 0 100 20 10 10 0 000-20z" /></svg>
                          </div>
                        </h3>
                        <div className="text-[10px] sm:text-[11px] font-bold text-accent/60 uppercase tracking-[0.2em] mt-1.5 flex gap-2 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/40 block"></span> ANTERIOR: {historyMocks[0].data}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL EXPANDIDO (SIN IMAGENES, PURO TEXTO) */}
                {isExpanded && (
                  <div className="bg-[#1A120B] border-y border-white/5 flex flex-col animate-in slide-in-from-top-1">
                    <div className="flex border-b border-white/5 bg-[#27211B]/50">
                      <button onClick={(e) => { e.stopPropagation(); setGuideTabs(p=>({...p, [exercise.id]:'how'})); }} className={`flex-1 py-4 text-[11px] sm:text-xs uppercase font-black tracking-[0.25em] ${currentTab === 'how' ? 'text-accent border-b-2 border-accent bg-[#392A1D]/20' : 'text-foreground/30 hover:text-accent/50 transition-colors'}`}>Técnica</button>
                      <button onClick={(e) => { e.stopPropagation(); setGuideTabs(p=>({...p, [exercise.id]:'history'})); }} className={`flex-1 py-4 text-[11px] sm:text-xs uppercase font-black tracking-[0.25em] ${currentTab === 'history' ? 'text-accent border-b-2 border-accent bg-[#392A1D]/20' : 'text-foreground/30 hover:text-accent/50 transition-colors'}`}>Mi Historia</button>
                    </div>

                    {/* TIPS ELEGANTES */}
                    {currentTab === 'how' && (
                      <div className="p-6 sm:p-8 bg-[#392A1D]/10">
                        {guide ? (
                           <ul className="space-y-5">
                             {guide.indications.map((ind, i) => (
                               <li key={i} className="flex gap-4 items-start text-sm sm:text-[15px] font-medium text-white/80">
                                 <div className="w-6 h-6 rounded-full bg-[#392A1D] border border-accent/20 flex items-center justify-center text-accent font-bold text-[10px] shrink-0 mt-0.5 shadow-sm">
                                   {i + 1}
                                 </div>
                                 <span className="leading-relaxed tracking-wide opacity-90">{ind.replace(/^\d+\.\s*/, '')}</span>
                               </li>
                             ))}
                           </ul>
                        ) : (
                           <p className="text-foreground/30 text-xs text-center uppercase tracking-widest py-8">Buscando documentos de técnica...</p>
                        )}
                      </div>
                    )}
                    
                    {/* HISTORIA */}
                    {currentTab === 'history' && (
                      <div className="p-6 bg-[#392A1D]/10">
                        <div className="space-y-4 max-w-md mx-auto">
                           {historyMocks.map((h, i) => (
                             <div key={i} className="flex items-center gap-5 bg-black/10 p-4 rounded-xl border border-white/5 hover:border-accent/10 transition-colors">
                               <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-accent shadow-[0_0_8px_currentColor] animate-pulse' : 'bg-white/20'}`}></div>
                               <div>
                                  <time className="text-[10px] font-black text-accent/60 uppercase tracking-widest block mb-1">{h.date}</time>
                                  <div className="text-[15px] font-bold text-white/90 leading-none">{h.data}</div>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TABLA HEVY ESTRUCTURADA */}
                <div className="p-3 sm:p-5 bg-background">
                  <div className="grid grid-cols-[1fr_2.5fr_2.5fr_1fr] md:grid-cols-[1fr_3.5fr_3.5fr_1fr] gap-3 mb-3 px-2 text-[10px] font-black text-foreground/30 text-center uppercase tracking-[0.2em] border-b border-white/5 pb-3">
                    <div>SET</div>
                    <div>{exercise.metricType === 'time' ? 'T. (s)' : exercise.metricType === 'reps_only' ? '' : 'KGS'}</div>
                    <div>{exercise.metricType === 'time' ? '' : 'REPS'}</div>
                    <svg className="w-4 h-4 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="space-y-2.5">
                    {exercise.sets.map((set) => {
                      const realIndex = exercise.sets.filter(s => s.type === 'normal').findIndex(s => s.id === set.id) + 1;
                      return (
                        <div key={set.id} className={`grid grid-cols-[1fr_2.5fr_2.5fr_1fr] md:grid-cols-[1fr_3.5fr_3.5fr_1fr] gap-2 items-center px-2 py-2 rounded-xl transition-all duration-300 ${set.isCompleted ? 'bg-[#064e3b]/30 border border-emerald-500/20' : 'bg-[#1A120B] border border-white/5 hover:border-white/10'}`}>
                          <div className="text-center font-bold text-xs sm:text-sm">
                            {set.type === 'W' ? <span className="text-accent">W</span> : <span className="text-white/50">{realIndex}</span>}
                          </div>
                          <div className="flex justify-center px-1 max-w-[120px] mx-auto w-full">
                            {exercise.metricType !== 'reps_only' ? (
                              <input type="text" inputMode="numeric" value={set.kg} onChange={(e) => handleUpdateSet(activeRoutine.id, exercise.id, set.id, 'kg', e.target.value)} disabled={set.isCompleted} placeholder="-" className="w-full text-center font-mono py-2 sm:py-2.5 text-[14px] sm:text-base rounded-lg bg-black/40 focus:bg-[#392A1D] border border-transparent focus:border-accent/30 outline-none text-white font-bold transition-all" />
                            ) : <div className="text-white/10">-</div>}
                          </div>
                          <div className="flex justify-center px-1 max-w-[120px] mx-auto w-full">
                            {exercise.metricType !== 'time' ? (
                              <input type="text" inputMode="numeric" value={set.reps} onChange={(e) => handleUpdateSet(activeRoutine.id, exercise.id, set.id, 'reps', e.target.value)} disabled={set.isCompleted} placeholder="-" className="w-full text-center font-mono py-2 sm:py-2.5 text-[14px] sm:text-base rounded-lg bg-black/40 focus:bg-[#392A1D] border border-transparent focus:border-accent/30 outline-none text-white font-bold transition-all" />
                            ) : <div className="text-white/10">-</div>}
                          </div>
                          <div className="flex justify-center">
                            <button onClick={() => toggleSetComplete(activeRoutine.id, exercise.id, set.id, exercise.restTimeSecs)} className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all ${set.isCompleted ? 'bg-[#10b981] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.05]' : 'bg-transparent border-2 border-white/10 text-transparent hover:border-white/20 hover:bg-white/5'}`}>
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => addSet(activeRoutine.id, exercise.id)} className="w-[calc(100%-1rem)] mx-auto block text-[9px] font-black uppercase tracking-[0.2em] text-accent/50 py-3 mt-4 bg-transparent rounded-lg border border-dashed border-white/10 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all">
                    + AÑADIR SERIES
                  </button>
                </div>
              </div>
             );
          })}
        </div>
      )}

      {/* OVERLAY THE LIBRARY MODAL (SIN IMAGENES, ESTETICA MINIMAL) */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#1A120B] md:bg-black/95 md:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm">
           <div className="bg-[#1A120B] md:rounded-[30px] md:border border-white/5 w-full h-full max-w-4xl mx-auto flex flex-col shadow-2xl relative overflow-hidden">
              
              {/* Toolbar & Search Bar */}
              <div className="space-y-5 p-6 border-b border-white/5 bg-[#27211B]/80">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black tracking-[0.2em] text-white uppercase"><span className="text-accent">Global</span> Library</h3>
                  <button onClick={() => {setIsLibraryOpen(false); setLibraryPreview(null);}} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Escribe el movimiento que buscas..." 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 border border-white/5 rounded-2xl leading-5 bg-black/60 text-white placeholder-foreground/20 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-sm sm:text-base font-semibold transition tracking-wide"
                  />
                </div>
              </div>

              {/* Categorías Carousel */}
              <div className="w-full overflow-x-auto whitespace-nowrap p-4 border-b border-white/5 bg-background shrink-0">
                <div className="flex gap-3 px-2">
                   {FILTERS.map(f => (
                     <button key={f} onClick={() => {setLibraryFilter(f as MuscleFilter | 'Todos'); setLibraryPreview(null);}} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-sm border ${libraryFilter === f ? 'bg-accent border-accent text-black scale-105' : 'bg-[#27211B] border-white/5 hover:bg-[#392A1D] text-foreground/50'}`}>
                       {f}
                     </button>
                   ))}
                </div>
              </div>

              {/* Lista o Vista Previa Inteligente (SIN IMÁGENES) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll pb-32 relative bg-[#1A120B]">
                 {libraryPreview ? (
                   <div className="animate-in slide-in-from-right-4 duration-300 relative h-full flex flex-col max-w-2xl mx-auto">
                      <button onClick={() => setLibraryPreview(null)} className="absolute top-0 right-0 z-20 text-foreground/40 p-2 hover:text-accent transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      
                      <div className="mt-4 mb-6">
                        <h2 className="text-3xl font-black text-white leading-tight tracking-tight">{libraryPreview}</h2>
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-accent/80 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-lg inline-block mt-4">
                          Grupo Muscular: {GLOBAL_LIBRARY[libraryPreview].muscle}
                        </span>
                      </div>
                      
                      <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-[0.2em] mb-4 pl-1">Instrucciones de Ejecución</h4>
                      <div className="overflow-y-auto pr-2 space-y-4 mb-24 flex-1">
                          <ul className="space-y-4 sm:space-y-5 p-5 sm:p-6 bg-[#27211B]/60 rounded-2xl border border-white/5">
                            {GLOBAL_LIBRARY[libraryPreview].indications.map((ind, i) => (
                               <li key={i} className="flex gap-4 items-start text-[14px] sm:text-[15px] font-medium text-white/80">
                                 <div className="w-6 h-6 rounded-full bg-background border border-white/10 flex items-center justify-center text-accent font-bold text-[10px] shrink-0 mt-0.5 opacity-80">
                                   {i + 1}
                                 </div>
                                 <span className="leading-relaxed">{ind.replace(/^\d+\.\s*/, '')}</span>
                               </li>
                            ))}
                          </ul>
                      </div>
                      <div className="absolute bottom-6 left-0 right-0">
                        <button onClick={() => insertExerciseFromLibrary(libraryPreview)} className="w-full bg-accent text-[#15100B] py-5 rounded-2xl font-black tracking-[0.2em] uppercase hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(213,206,163,0.2)] text-base">
                          + Añadir a Rutina
                        </button>
                      </div>
                   </div>
                 ) : (
                   <div className="grid gap-3 sm:gap-4 animate-in fade-in max-w-3xl mx-auto">
                     {libraryEntries.length === 0 ? (
                       <div className="text-center text-white/30 text-xs font-bold uppercase py-24 tracking-[0.2em] flex flex-col items-center gap-4">
                         <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                         Búsqueda vacía
                       </div>
                     ) : (
                       libraryEntries.map(([name, guide]) => (
                         <div key={name} className="flex items-center justify-between p-4 sm:p-5 bg-[#27211B]/50 rounded-2xl border border-white/5 hover:bg-[#392A1D]/40 hover:border-accent/30 active:bg-white/5 transition-all group cursor-pointer" onClick={() => setLibraryPreview(name)}>
                           <div className="flex-1 min-w-0 pr-4 pl-2">
                             <h4 className="text-sm sm:text-base font-extrabold text-white/90 group-hover:text-accent transition-colors leading-tight truncate tracking-wide">{name}</h4>
                             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mt-1.5 inline-block bg-background/50 px-2 py-0.5 rounded">{guide.muscle}</span>
                           </div>
                           <div className="flex items-center shrink-0 pr-2">
                             <button onClick={(e) => {e.stopPropagation(); insertExerciseFromLibrary(name);}} className="bg-white/5 group-hover:bg-accent text-white group-hover:text-black font-black text-xl w-12 h-12 flex items-center justify-center rounded-xl transition-all border border-white/5 group-hover:shadow-[0_0_15px_rgba(213,206,163,0.3)] shrink-0 opacity-80 group-hover:opacity-100">
                               +
                             </button>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* OVERLAY REST */}
      {restTimer.active && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#1A120B] border border-accent rounded-xl shadow-[0_10px_40px_rgba(213,206,163,0.3)] z-[150] flex flex-col overflow-hidden border-t-4 border-t-accent">
          <div className="flex justify-between items-center p-4">
             <div className="flex items-center gap-2">
               <svg className="w-5 h-5 text-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="font-bold text-white/90 text-sm uppercase tracking-widest">Descanso</span>
             </div>
             <button onClick={() => setRestTimer({active:false, remaining:0, total:0})} className="text-white/40 hover:text-white px-2 py-1 rounded bg-white/5 font-bold text-xs uppercase">Saltar</button>
          </div>
          <div className="text-center pb-6">
            <div className="text-5xl font-mono font-extrabold text-accent">{formatStopwatch(restTimer.remaining)}</div>
          </div>
          <div className="h-1.5 bg-[#27211B] w-full">
            <div className="h-full bg-gradient-to-r from-accent to-[#EAE4C4]" style={{ width: `${(restTimer.remaining / restTimer.total) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR: FINALIZAR ENTRENAMIENTO */}
      {isTrainingStarted && (
        <div className="fixed bottom-0 left-0 right-0 z-[50] flex flex-col items-center gap-3 pb-8 pt-16 px-4 bg-gradient-to-t from-[#0d0906] via-[#15100B]/95 to-transparent pointer-events-none">

          {/* Feedback: Éxito */}
          {saveStatus === 'success' && (
            <div className="pointer-events-auto flex items-center gap-2.5 text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-5 py-2.5 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              ¡Entrenamiento guardado en la nube!
            </div>
          )}

          {/* Feedback: Error */}
          {saveStatus === 'error' && (
            <div className="pointer-events-auto flex items-center gap-2.5 text-red-400 text-xs font-black uppercase tracking-widest bg-red-500/10 border border-red-500/30 px-5 py-2.5 rounded-full">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error al guardar. Inténtalo de nuevo.
            </div>
          )}

          {/* Botón principal */}
          <button
            id="btn-finalizar-entrenamiento"
            onClick={handleFinishTraining}
            disabled={isSaving}
            className={`pointer-events-auto w-full max-w-sm px-10 py-5 rounded-full font-black text-base uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_10px_40px_rgba(37,99,235,0.35)] hover:scale-[1.03] active:scale-95 ${
              isSaving
                ? 'bg-blue-800 text-white/50 cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="w-5 h-5 animate-spin shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Guardando en la nube...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finalizar y Guardar
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
