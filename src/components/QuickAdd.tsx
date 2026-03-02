import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Habit } from '../lib/types';
import { HABIT_COLORS } from '../lib/utils';

interface QuickAddProps {
  onAdd: (habit: Habit) => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title: title.trim(),
      type: 'boolean',
      targetValue: 1,
      frequency: 'daily',
      color: HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)],
      createdAt: Date.now(),
      streak: 0
    };

    onAdd(newHabit);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
        <Sparkles size={18} />
      </div>
      <input 
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's your next habit?"
        className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pl-12 pr-16 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
      />
      <button 
        type="submit"
        disabled={!title.trim()}
        className="absolute right-2 top-2 bottom-2 px-4 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Add
      </button>
    </form>
  );
};

export default QuickAdd;
