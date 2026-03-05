import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Calendar, 
  TrendingUp, 
  Trash2, 
  Edit3,
  MessageSquare,
  Save
} from 'lucide-react';
import { motion } from 'motion/react';
import { Habit, HabitLog } from '../lib/types';
import { format, subDays, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

import WaterTracker from './specialized/WaterTracker';
import GymTracker from './specialized/GymTracker';

interface HabitDetailsModalProps {
  habit: Habit;
  logs: HabitLog[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateLog: (logId: string, note: string) => Promise<void>;
  onUpdateLogValue: (habitId: string, value: number, metadata?: Record<string, unknown>, date?: string) => Promise<void>;
}

const HabitDetailsModal: React.FC<HabitDetailsModalProps> = ({ 
  habit, 
  logs, 
  onClose, 
  onEdit, 
  onDelete,
  onUpdateLog,
  onUpdateLogValue
}) => {
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const activeLog = logs.find(l => l.habitId === habit.id && l.date === selectedDate);

  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));
  const habitLogs = logs
    .filter(l => l.habitId === habit.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const completionRate = habitLogs.length > 0 
    ? Math.round((habitLogs.filter(l => {
        const d = parseISO(l.date);
        return d >= subDays(new Date(), 30);
      }).length / 30) * 100) 
    : 0;

  const handleSaveNote = async (logId: string) => {
    setIsSaving(true);
    await onUpdateLog(logId, noteValue);
    setEditingLogId(null);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: habit.color }} 
              />
              <h2 className="text-2xl font-bold text-zinc-900">{habit.title}</h2>
            </div>
            <p className="text-sm text-zinc-500 font-medium">Created {format(habit.createdAt, 'MMM d, yyyy')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between mb-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
          <div className="flex items-center gap-3">
            <Calendar className="text-zinc-400" size={18} />
            <span className="text-sm font-bold text-zinc-900">Logging for:</span>
          </div>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <Flame size={16} fill="currentColor" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Current Streak</span>
            </div>
            <p className="text-2xl font-black text-zinc-900">{habit.streak} days</p>
          </div>
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
            <div className="flex items-center gap-2 text-indigo-500 mb-1">
              <TrendingUp size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">30d Completion</span>
            </div>
            <p className="text-2xl font-black text-zinc-900">{completionRate}%</p>
          </div>
        </div>

        {/* Specialized Trackers or Quick Log */}
        <div className="mb-8">
          {habit.title.toLowerCase().includes('water') ? (
            <WaterTracker 
              currentValue={activeLog?.value || 0}
              targetValue={habit.targetValue || 3}
              onUpdate={(val) => onUpdateLogValue(habit.id, val, undefined, selectedDate)}
            />
          ) : habit.title.toLowerCase().includes('gym') ? (
            <GymTracker 
              initialData={activeLog?.metadata as Record<string, unknown>}
              onUpdate={(data) => onUpdateLogValue(habit.id, 1, data, selectedDate)}
            />
          ) : (
            <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900">Quick Log</h3>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: habit.color }}
                >
                  <TrendingUp size={20} />
                </div>
              </div>
              
              {habit.type === 'boolean' ? (
                <button
                  onClick={() => onUpdateLogValue(habit.id, activeLog ? 0 : 1, undefined, selectedDate)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold transition-all border-2",
                    activeLog 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "bg-white border-zinc-200 text-zinc-400 hover:border-indigo-200"
                  )}
                >
                  {activeLog ? 'Completed Today' : 'Mark as Complete'}
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={activeLog?.value || 0}
                        onChange={(e) => onUpdateLogValue(habit.id, parseFloat(e.target.value) || 0, undefined, selectedDate)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xl font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs">{habit.unit || 'units'}</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 5, 10].map(val => (
                        <button
                          key={val}
                          onClick={() => onUpdateLogValue(habit.id, (activeLog?.value || 0) + val, undefined, selectedDate)}
                          className="flex-1 py-2 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Target</p>
                    <p className="text-lg font-black text-zinc-900">{habit.targetValue} {habit.unit}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Grid */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Last 30 Days</h3>
          <div className="grid grid-cols-7 gap-2">
            {last30Days.reverse().map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isCompleted = habitLogs.some(l => l.date === dateStr);
              const isSelected = selectedDate === dateStr;
              return (
                <button 
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center transition-all border-2",
                    isCompleted ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-100 text-zinc-300 border-transparent",
                    isSelected && "border-indigo-400 scale-110 shadow-lg z-10"
                  )}
                >
                  <span className="text-[8px] font-bold uppercase">{format(date, 'EEE')}</span>
                  <span className="text-xs font-black">{format(date, 'd')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Journal Section */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Journal & Notes</h3>
            <span className="text-[10px] font-bold text-zinc-400">{habitLogs.length} entries</span>
          </div>
          
          <div className="space-y-3">
            {habitLogs.length === 0 ? (
              <p className="text-center py-8 text-zinc-400 text-sm italic">No entries yet. Complete this habit to start journaling!</p>
            ) : (
              habitLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-500">{format(parseISO(log.date), 'EEEE, MMM d')}</span>
                    <button 
                      onClick={() => {
                        setEditingLogId(log.id);
                        setNoteValue(log.note || '');
                      }}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                  
                  {editingLogId === log.id ? (
                    <div className="space-y-2">
                      <textarea 
                        autoFocus
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="How did it go? Any challenges?"
                        className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingLogId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:bg-zinc-200 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          disabled={isSaving}
                          onClick={() => handleSaveNote(log.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        >
                          {isSaving ? 'Saving...' : <><Save size={12} /> Save</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={cn(
                      "text-sm",
                      log.note ? "text-zinc-700" : "text-zinc-400 italic"
                    )}>
                      {log.note || "No note added for this day."}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onEdit}
            className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
          >
            <Edit3 size={18} /> Edit Habit
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this habit?')) {
                onDelete();
                onClose();
              }
            }}
            className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HabitDetailsModal;
