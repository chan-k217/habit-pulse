import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Timer, Flame, CheckCircle2, Activity, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GymTrackerProps {
  onUpdate: (data: { muscleGroups: string[], cardioMinutes: number, weightMinutes: number, intensity: string, exercises: string[] }) => void;
  initialData?: Record<string, unknown>;
}

const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', icon: '💪' },
  { id: 'shoulder', label: 'Shoulder', icon: '🏋️' },
  { id: 'back', label: 'Back', icon: '📐' },
  { id: 'legs', label: 'Legs', icon: '🦵' },
  { id: 'arms', label: 'Arms', icon: '🦾' },
  { id: 'core', label: 'Core', icon: '🧘' }
];

const GymTracker: React.FC<GymTrackerProps> = ({ onUpdate, initialData }) => {
  const muscleGroups = Array.isArray(initialData?.muscleGroups) ? initialData.muscleGroups as string[] : [];
  const cardioMinutes = typeof initialData?.cardioMinutes === 'number' ? initialData.cardioMinutes : 0;
  const weightMinutes = typeof initialData?.weightMinutes === 'number' ? initialData.weightMinutes : 0;
  const intensity = typeof initialData?.intensity === 'string' ? initialData.intensity : 'Medium';
  const exercises = Array.isArray(initialData?.exercises) ? initialData.exercises as string[] : [];

  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(muscleGroups);
  const [currentCardioMinutes, setCurrentCardioMinutes] = useState<number>(cardioMinutes);
  const [currentWeightMinutes, setCurrentWeightMinutes] = useState<number>(weightMinutes);
  const [currentIntensity, setCurrentIntensity] = useState<string>(intensity);
  const [currentExercises, setCurrentExercises] = useState<string[]>(exercises);
  const [newExercise, setNewExercise] = useState('');

  const toggleMuscle = (id: string) => {
    const newMuscles = selectedMuscles.includes(id)
      ? selectedMuscles.filter(m => m !== id)
      : [...selectedMuscles, id];
    setSelectedMuscles(newMuscles);
    onUpdate({ 
      muscleGroups: newMuscles, 
      cardioMinutes: currentCardioMinutes, 
      weightMinutes: currentWeightMinutes,
      intensity: currentIntensity,
      exercises: currentExercises
    });
  };

  const handleCardioChange = (val: number) => {
    setCurrentCardioMinutes(val);
    onUpdate({ 
      muscleGroups: selectedMuscles, 
      cardioMinutes: val, 
      weightMinutes: currentWeightMinutes,
      intensity: currentIntensity,
      exercises: currentExercises
    });
  };

  const handleWeightChange = (val: number) => {
    setCurrentWeightMinutes(val);
    onUpdate({ 
      muscleGroups: selectedMuscles, 
      cardioMinutes: currentCardioMinutes, 
      weightMinutes: val,
      intensity: currentIntensity,
      exercises: currentExercises
    });
  };

  const addExercise = () => {
    if (!newExercise.trim()) return;
    const updated = [...currentExercises, newExercise.trim()];
    setCurrentExercises(updated);
    setNewExercise('');
    onUpdate({
      muscleGroups: selectedMuscles,
      cardioMinutes: currentCardioMinutes,
      weightMinutes: currentWeightMinutes,
      intensity: currentIntensity,
      exercises: updated
    });
  };

  return (
    <div className="space-y-8 p-6 bg-zinc-900 rounded-[32px] text-white shadow-2xl shadow-zinc-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Gym Session</h3>
          <p className="text-sm text-zinc-400 font-medium">Track your gains and intensity</p>
        </div>
        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Dumbbell size={24} />
        </div>
      </div>

      {/* Muscle Groups Selection */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Muscle Groups Targeted</h4>
        <div className="grid grid-cols-3 gap-3">
          {MUSCLE_GROUPS.map((muscle) => {
            const isSelected = selectedMuscles.includes(muscle.id);
            return (
              <motion.button
                key={muscle.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleMuscle(muscle.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  isSelected 
                    ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20" 
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                )}
              >
                <span className="text-2xl">{muscle.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{muscle.label}</span>
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1"
                  >
                    <CheckCircle2 size={12} className="text-white" fill="currentColor" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Intensity Selection */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Workout Intensity</h4>
        <div className="flex gap-2">
          {['Low', 'Medium', 'High', 'Extreme'].map((level) => (
            <button
              key={level}
              onClick={() => {
                setCurrentIntensity(level);
                onUpdate({ 
                  muscleGroups: selectedMuscles, 
                  cardioMinutes: currentCardioMinutes, 
                  weightMinutes: currentWeightMinutes,
                  intensity: level,
                  exercises: currentExercises
                });
              }}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2",
                currentIntensity === level 
                  ? "bg-orange-600 border-orange-600 text-white" 
                  : "bg-zinc-800 border-zinc-700 text-zinc-500"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Exercises / Reps</h4>
        <div className="space-y-2">
          {currentExercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-zinc-700">
              <span className="text-sm font-medium text-zinc-200">{ex}</span>
              <button 
                onClick={() => {
                  const updated = currentExercises.filter((_, idx) => idx !== i);
                  setCurrentExercises(updated);
                  onUpdate({
                    muscleGroups: selectedMuscles,
                    cardioMinutes: currentCardioMinutes,
                    weightMinutes: currentWeightMinutes,
                    intensity: currentIntensity,
                    exercises: updated
                  });
                }}
                className="text-zinc-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="e.g. Bench Press 3x10"
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExercise()}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <button 
              onClick={addExercise}
              className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Duration Tracking */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <Activity size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cardio (min)</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleCardioChange(Math.max(0, currentCardioMinutes - 5))}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
             >
               -
             </button>
             <span className="text-xl font-black">{currentCardioMinutes}</span>
             <button 
                onClick={() => handleCardioChange(currentCardioMinutes + 5)}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
             >
               +
             </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <Flame size={16} className="text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Weights (min)</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleWeightChange(Math.max(0, currentWeightMinutes - 5))}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
             >
               -
             </button>
             <span className="text-xl font-black">{currentWeightMinutes}</span>
             <button 
                onClick={() => handleWeightChange(currentWeightMinutes + 5)}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
             >
               +
             </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-orange-500">
            <Timer size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Duration</p>
            <p className="text-lg font-black">{currentCardioMinutes + currentWeightMinutes} min</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Intensity</p>
          <p className="text-lg font-black text-orange-500">
            {currentIntensity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GymTracker;
