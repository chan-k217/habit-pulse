import React from 'react';
import { 
  X, 
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { Habit, HabitType } from '../lib/types';
import { HABIT_COLORS, cn } from '../lib/utils';

interface CreateHabitModalProps {
  onClose: () => void;
  onAdd: (habit: Habit) => void;
  onUpdate?: (habit: Habit) => void;
  initialHabit?: Habit;
}

const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ 
  onClose, 
  onAdd, 
  onUpdate, 
  initialHabit 
}) => {
  const [title, setTitle] = React.useState(initialHabit?.title || '');
  const [type, setType] = React.useState<HabitType>(initialHabit?.type || 'boolean');
  const [category, setCategory] = React.useState<Habit['category']>(initialHabit?.category || 'health');
  const [targetValue, setTargetValue] = React.useState(initialHabit?.targetValue || 1);
  const [unit, setUnit] = React.useState(initialHabit?.unit || '');
  const [frequency, setFrequency] = React.useState<'daily' | 'weekly' | 'custom'>(initialHabit?.frequency || 'daily');
  const [reminderTime, setReminderTime] = React.useState(initialHabit?.reminderTime || '');
  const [selectedColor, setSelectedColor] = React.useState(initialHabit?.color || HABIT_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const habitData = {
      title: title.trim(),
      type,
      category,
      targetValue: Number(targetValue),
      unit: unit.trim() || undefined,
      frequency,
      reminderTime: reminderTime || undefined,
      color: selectedColor,
    };

    if (initialHabit && onUpdate) {
      onUpdate({
        ...initialHabit,
        ...habitData
      });
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        ...habitData,
        createdAt: Date.now(),
        streak: 0,
        xp: 0
      };
      onAdd(newHabit);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-zinc-900">
            {initialHabit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Habit Name</label>
            <input 
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Meditation"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category</label>
            <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-200 overflow-x-auto no-scrollbar">
              {(['health', 'productivity', 'learning', 'wellness', 'lifestyle', 'finance'] as const).map((cat) => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 text-[10px] font-bold rounded-lg transition-all capitalize",
                    category === cat ? "bg-white shadow-sm text-indigo-600" : "text-zinc-500"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Goal Type</label>
            <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-200">
              {(['boolean', 'count', 'duration', 'measurement'] as const).map((t) => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all capitalize",
                    type === t ? "bg-white shadow-sm text-indigo-600" : "text-zinc-500"
                  )}
                >
                  {t === 'boolean' ? 'Yes/No' : t}
                </button>
              ))}
            </div>
          </div>

          {type !== 'boolean' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Target</label>
                <input 
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Unit</label>
                <input 
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder={type === 'duration' ? 'min' : 'times'}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Frequency</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Reminder</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Color</label>
            <div className="flex flex-wrap gap-3">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all ring-offset-2",
                    selectedColor === color ? "ring-2 ring-indigo-500 scale-110" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={!title.trim()}
            className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {initialHabit ? 'Update Habit' : 'Create Habit'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateHabitModal;
