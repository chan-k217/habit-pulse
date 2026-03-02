import React from 'react';
import { CheckCircle2, Circle, Flame, Trash2, MoreVertical, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Habit } from '../lib/types';
import { cn } from '../lib/utils';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  hasNoteToday?: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onShowDetails: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  isCompleted, 
  hasNoteToday,
  onToggle, 
  onDelete,
  onShowDetails
}) => {
  return (
    <motion.div 
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
            <h3 className={cn(
              "font-semibold text-zinc-900 truncate transition-all",
              isCompleted && "opacity-40 line-through"
            )}>
              {habit.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
                <Flame size={14} fill="currentColor" />
                <span>{habit.streak} day streak</span>
              </div>
              {hasNoteToday && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                  <MessageSquare size={10} />
                  <span>Journaled</span>
                </div>
              )}
              {habit.reminderTime && !hasNoteToday && (
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  {habit.reminderTime}
                </span>
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
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: isCompleted ? '100%' : '0%' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default HabitCard;
