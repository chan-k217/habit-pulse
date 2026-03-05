import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  Check, 
  Moon, 
  Droplets, 
  BookOpen, 
  Dumbbell, 
  Code,
  Heart,
  Brain
} from 'lucide-react';
import { Habit } from '../lib/types';
import { HABIT_COLORS, cn } from '../lib/utils';

interface Template {
  title: string;
  type: 'boolean' | 'count' | 'duration' | 'measurement';
  targetValue: number;
  unit?: string;
  frequency: 'daily' | 'weekly';
  color: string;
  icon: React.ReactNode;
  category: 'health' | 'productivity' | 'learning' | 'wellness' | 'lifestyle' | 'finance';
}

const TEMPLATES: Template[] = [
  // Health
  { title: 'Drink Water', type: 'count', targetValue: 8, unit: 'glasses', frequency: 'daily', color: HABIT_COLORS[0], icon: <Droplets size={20} />, category: 'health' },
  { title: 'Go to Gym', type: 'boolean', targetValue: 1, frequency: 'daily', color: HABIT_COLORS[1], icon: <Dumbbell size={20} />, category: 'health' },
  { title: 'Track Calories', type: 'measurement', targetValue: 2000, unit: 'kcal', frequency: 'daily', color: HABIT_COLORS[2], icon: <Sparkles size={20} />, category: 'health' },
  { title: 'Sleep 7 hours', type: 'duration', targetValue: 420, unit: 'min', frequency: 'daily', color: HABIT_COLORS[3], icon: <Moon size={20} />, category: 'health' },
  
  // Learning
  { title: 'Read Daily', type: 'count', targetValue: 20, unit: 'pages', frequency: 'daily', color: HABIT_COLORS[4], icon: <BookOpen size={20} />, category: 'learning' },
  { title: 'Study', type: 'duration', targetValue: 60, unit: 'min', frequency: 'daily', color: HABIT_COLORS[5], icon: <Brain size={20} />, category: 'learning' },
  { title: 'Language Learning', type: 'duration', targetValue: 15, unit: 'min', frequency: 'daily', color: HABIT_COLORS[6], icon: <Sparkles size={20} />, category: 'learning' },
  
  // Productivity
  { title: 'Focus Work', type: 'duration', targetValue: 90, unit: 'min', frequency: 'daily', color: HABIT_COLORS[7], icon: <Code size={20} />, category: 'productivity' },
  { title: 'Journal', type: 'boolean', targetValue: 1, frequency: 'daily', color: HABIT_COLORS[8], icon: <Heart size={20} />, category: 'productivity' },
  { title: 'Daily Planning', type: 'boolean', targetValue: 1, frequency: 'daily', color: HABIT_COLORS[9], icon: <Sparkles size={20} />, category: 'productivity' },
];

interface OnboardingProps {
  onComplete: (selectedHabits: Habit[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const toggleTemplate = (index: number) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleFinish = () => {
    const habits: Habit[] = selectedIndices.map(index => {
      const t = TEMPLATES[index];
      return {
        id: crypto.randomUUID(),
        title: t.title,
        type: t.type,
        category: t.category,
        targetValue: t.targetValue,
        unit: t.unit,
        frequency: t.frequency,
        color: t.color,
        createdAt: Date.now(),
        streak: 0,
        xp: 0
      };
    });
    onComplete(habits);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 bg-indigo-600 rounded-[40px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200">
                <Sparkles size={48} />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Welcome to HabitPulse</h1>
                <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                  The science-backed way to build habits that actually stick. Let's get you set up in 60 seconds.
                </p>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-zinc-900 text-white rounded-[32px] font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all group"
              >
                Let's Start
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Pick your first habits</h2>
                <p className="text-zinc-500 font-medium">Choose 1-3 habits to start your journey. You can always add more later.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((template, index) => {
                  const isSelected = selectedIndices.includes(index);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleTemplate(index)}
                      className={cn(
                        "p-5 rounded-[32px] border-2 text-left transition-all relative group",
                        isSelected 
                          ? "border-indigo-600 bg-indigo-50/30" 
                          : "border-zinc-100 bg-white hover:border-zinc-200"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                          style={{ backgroundColor: template.color }}
                        >
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{template.category}</p>
                          <p className="font-bold text-zinc-900">{template.title}</p>
                          <p className="text-xs text-zinc-500 font-medium">{template.frequency} • {template.type}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="sticky bottom-0 pt-8 bg-white/80 backdrop-blur-md">
                <button 
                  onClick={handleFinish}
                  disabled={selectedIndices.length === 0}
                  className="w-full py-5 bg-zinc-900 text-white rounded-[32px] font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  Create {selectedIndices.length} Habits
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
