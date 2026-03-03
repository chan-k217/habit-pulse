import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Timer, Flame, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GymTrackerProps {
  onUpdate: (data: { muscleGroups: string[], cardioMinutes: number, weightMinutes: number }) => void;
  initialData?: { muscleGroups: string[], cardioMinutes: number, weightMinutes: number };
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
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(initialData?.muscleGroups || []);
  const [cardioMinutes, setCardioMinutes] = useState<number>(initialData?.cardioMinutes || 0);
  const [weightMinutes, setWeightMinutes] = useState<number>(initialData?.weightMinutes || 0);

  const toggleMuscle = (id: string) => {
    const newMuscles = selectedMuscles.includes(id)
      ? selectedMuscles.filter(m => m !== id)
      : [...selectedMuscles, id];
    setSelectedMuscles(newMuscles);
    onUpdate({ muscleGroups: newMuscles, cardioMinutes, weightMinutes });
  };

  const handleCardioChange = (val: number) => {
    setCardioMinutes(val);
    onUpdate({ muscleGroups: selectedMuscles, cardioMinutes: val, weightMinutes });
  };

  const handleWeightChange = (val: number) => {
    setWeightMinutes(val);
    onUpdate({ muscleGroups: selectedMuscles, cardioMinutes, weightMinutes: val });
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

      {/* Duration Tracking */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <Activity size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cardio (min)</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleCardioChange(Math.max(0, cardioMinutes - 5))}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
             >
               -
             </button>
             <span className="text-xl font-black">{cardioMinutes}</span>
             <button 
                onClick={() => handleCardioChange(cardioMinutes + 5)}
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
                onClick={() => handleWeightChange(Math.max(0, weightMinutes - 5))}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
             >
               -
             </button>
             <span className="text-xl font-black">{weightMinutes}</span>
             <button 
                onClick={() => handleWeightChange(weightMinutes + 5)}
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
            <p className="text-lg font-black">{cardioMinutes + weightMinutes} min</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Intensity</p>
          <p className="text-lg font-black text-orange-500">
            {selectedMuscles.length > 3 ? 'High' : selectedMuscles.length > 1 ? 'Medium' : 'Low'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GymTracker;
