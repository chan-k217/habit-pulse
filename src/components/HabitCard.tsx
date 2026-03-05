import React from 'react';
import { CheckCircle2, Circle, Flame, MoreVertical, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Habit } from '../lib/types';
import { cn } from '../lib/utils';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  currentValue?: number;
  hasNoteToday?: boolean;
  onToggle: () => void;
  onShowDetails: () => void;
}

const HabitCard = React.forwardRef<HTMLDivElement, HabitCardProps>(({ 
  habit, 
  isCompleted, 
  currentValue = 0,
  hasNoteToday,
  onToggle, 
  onShowDetails
}, ref) => {
  const progress = habit.targetValue > 0 ? Math.min((currentValue / habit.targetValue) * 100, 100) : 0;

  return (
    <motion.div 
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onShowDetails}
      className={cn(
        "group relative p-4 rounded-2xl border transition-all duration-300 habit-card-shadow cursor-pointer",
        isCompleted 
          ? "bg-white border-indigo-100" 
          : "bg-white border-zinc-100 hover:border-zinc-200"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
              isCompleted 
                ? "bg-indigo-600 text-white scale-90" 
                : "bg-zinc-50 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-400"
            )}
          >
            {isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-0.5">{habit.category}</p>
            <h3 className={cn(
              "font-bold text-zinc-900 truncate transition-all",
              isCompleted && "opacity-40 line-through"
            )}>
              {habit.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                <Flame size={12} fill="currentColor" />
                <span>{habit.streak}d</span>
              </div>
              {habit.type !== 'boolean' && (
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {currentValue} / {habit.targetValue} {habit.unit}
                </span>
              )}
              {hasNoteToday && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                  <MessageSquare size={10} />
                  <span>Journaled</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar (if count/duration type) */}
      {habit.type !== 'boolean' && (
        <div className="mt-4 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: habit.color }}
          />
        </div>
      )}
    </motion.div>
  );
});

HabitCard.displayName = 'HabitCard';

export default HabitCard;
