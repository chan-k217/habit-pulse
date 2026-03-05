import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings as SettingsIcon, 
  BarChart2, 
  Calendar, 
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  Activity,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { useAuth } from '../lib/useAuth';
import { cn, getTodayString, calculateStreak } from '../lib/utils';
import { Habit, HabitLog, HabitType } from '../lib/types';
import HabitCard from './HabitCard';
import QuickAdd from './QuickAdd';
import CreateHabitModal from './CreateHabitModal';
import Analytics from './Analytics';
import Settings from './Settings';
import HabitDetailsModal from './HabitDetailsModal';
import HealthTracker from './HealthTracker';
import WaterReminder from './specialized/WaterReminder';
import Onboarding from './Onboarding';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'health' | 'analytics' | 'settings'>('today');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load data from API on mount or session change
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [habitsRes, logsRes] = await Promise.all([
          fetch(`/api/habits?userId=${user.id}`),
          fetch(`/api/logs?userId=${user.id}`)
        ]);
        
        if (!habitsRes.ok || !logsRes.ok) {
          throw new Error('Failed to fetch data from server');
        }

        const habitsData = await habitsRes.json();
        const logsData = await logsRes.json();
          
          const formattedLogs = logsData.map((l: { id: string; habit_id: string; date: string; value: number; timestamp: string; note?: string; metadata?: Record<string, unknown> }) => ({
            id: l.id,
            habitId: l.habit_id,
            date: l.date,
            value: l.value,
            timestamp: new Date(l.timestamp).getTime(),
            source: (l.metadata?.source as HabitLog['source']) || 'manual',
            note: l.note,
            metadata: l.metadata
          }));
          
          setLogs(formattedLogs);
          
          const formattedHabits = habitsData.map((h: { id: string; title: string; description?: string; type: string; category: string; target_value: number; unit?: string; frequency: string; custom_days?: string[]; reminder_time?: string; color: string; metadata?: Record<string, unknown>; created_at: string; xp?: number }) => ({
            id: h.id,
            title: h.title,
            description: h.description,
            type: h.type as HabitType,
            category: h.category as Habit['category'],
            targetValue: h.target_value,
            unit: h.unit,
            frequency: h.frequency as Habit['frequency'],
            customDays: h.custom_days?.map(Number),
            reminderTime: h.reminder_time,
            color: h.color,
            metadata: h.metadata,
            createdAt: new Date(h.created_at).getTime(),
            streak: calculateStreak(formattedLogs.filter((l: { habitId: string }) => l.habitId === h.id)),
            xp: h.xp || 0
          }));
          
          setHabits(formattedHabits);

          // Check for onboarding
          const hasOnboarded = localStorage.getItem(`onboarded_${user.id}`);
          if (!hasOnboarded && formattedHabits.length === 0) {
            setShowOnboarding(true);
          }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Failed to fetch data:', err);
        setError(message || 'Failed to connect to the server. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleOnboardingComplete = async (selectedHabits: Habit[]) => {
    if (!user) return;
    
    try {
      // Save habits to database
      await Promise.all(selectedHabits.map(habit => 
        fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            title: habit.title,
            type: habit.type,
            category: habit.category,
            target_value: habit.targetValue,
            unit: habit.unit,
            frequency: habit.frequency,
            color: habit.color,
            created_at: new Date(habit.createdAt).toISOString(),
            xp: 0
          })
        })
      ));

      // Refresh habits
      const res = await fetch(`/api/habits?userId=${user.id}`);
      if (res.ok) {
        const habitsData = await res.json();
        setHabits(habitsData.map((h: { id: string; title: string; description?: string; type: string; category: string; target_value: number; unit?: string; frequency: string; custom_days?: string[]; reminder_time?: string; color: string; metadata?: Record<string, unknown>; created_at: string; xp?: number }) => ({
          id: h.id,
          title: h.title,
          description: h.description,
          type: h.type as HabitType,
          category: h.category as Habit['category'],
          targetValue: h.target_value,
          unit: h.unit,
          frequency: h.frequency as Habit['frequency'],
          customDays: h.custom_days?.map(Number),
          reminderTime: h.reminder_time,
          color: h.color,
          metadata: h.metadata,
          createdAt: new Date(h.created_at).getTime(),
          streak: 0,
          xp: h.xp || 0
        })));
      }

      localStorage.setItem(`onboarded_${user.id}`, 'true');
      setShowOnboarding(false);
    } catch (err) {
      console.error('Onboarding failed:', err);
    }
  };

  const addHabit = async (habit: Habit) => {
    if (!user) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: habit.title,
          type: habit.type,
          category: habit.category,
          target_value: habit.targetValue,
          frequency: habit.frequency,
          color: habit.color,
          reminder_time: habit.reminderTime,
          xp: 0
        })
      });

      if (res.ok) {
        const savedHabit = await res.json();
        setHabits(prev => [{
          ...habit,
          id: savedHabit.id,
          createdAt: new Date(savedHabit.created_at).getTime(),
          streak: 0,
          xp: 0
        }, ...prev]);
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  };

  const updateHabit = async (habit: Habit) => {
    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: habit.title,
          type: habit.type,
          category: habit.category,
          target_value: habit.targetValue,
          frequency: habit.frequency,
          color: habit.color,
          reminder_time: habit.reminderTime
        })
      });

      if (res.ok) {
        setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
        setEditingHabit(null);
      }
    } catch (err) {
      console.error('Failed to update habit:', err);
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const today = getTodayString();
    const existingLog = logs.find(l => l.habitId === habitId && l.date === today);

    try {
      if (existingLog) {
        // If it has a note or a value > 1 (for non-boolean), ask for confirmation before deleting
        const habit = habits.find(h => h.id === habitId);
        const hasData = existingLog.note || (habit?.type !== 'boolean' && existingLog.value > 0);
        
        if (hasData) {
          if (!confirm('This habit has logs or notes. Are you sure you want to clear today\'s entry?')) {
            return;
          }
        }

        const res = await fetch(`/api/logs/${existingLog.id}`, { method: 'DELETE' });
        if (res.ok) {
          const newLogs = logs.filter(l => l.id !== existingLog.id);
          setLogs(newLogs);
          setHabits(prev => prev.map(h => h.id === habitId ? { ...h, streak: calculateStreak(newLogs.filter(l => l.habitId === habitId)) } : h));
        }
      } else {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            habit_id: habitId,
            date: today,
            value: 1
          })
        });
        
        if (res.ok) {
          const savedLog = await res.json();
          const newLog = {
            id: savedLog.id,
            habitId: savedLog.habit_id,
            date: savedLog.date,
            value: savedLog.value,
            timestamp: new Date(savedLog.timestamp).getTime(),
            source: 'manual' as const
          };
          const newLogs = [...logs, newLog];
          setLogs(newLogs);
          setHabits(prev => prev.map(h => h.id === habitId ? { ...h, streak: calculateStreak(newLogs.filter(l => l.habitId === habitId)) } : h));
        }
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHabits(prev => prev.filter(h => h.id !== id));
        setLogs(prev => prev.filter(l => l.habitId !== id));
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const updateLog = async (logId: string, note: string) => {
    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        const updatedLog = await res.json();
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, note: updatedLog.note } : l));
      }
    } catch (err) {
      console.error('Failed to update log:', err);
    }
  };

  const updateLogValue = async (habitId: string, value: number, metadata?: Record<string, unknown>, date?: string) => {
    if (!user) return;
    const targetDate = date || getTodayString();
    const existingLog = logs.find(l => l.habitId === habitId && l.date === targetDate);

    try {
      if (existingLog) {
        const res = await fetch(`/api/logs/${existingLog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value, metadata })
        });
        if (res.ok) {
          const updatedLog = await res.json();
          setLogs(prev => prev.map(l => l.id === existingLog.id ? { 
            ...l, 
            value: updatedLog.value, 
            metadata: updatedLog.metadata 
          } : l));
        }
      } else {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            habit_id: habitId,
            date: targetDate,
            value,
            metadata
          })
        });
        if (res.ok) {
          const savedLog = await res.json();
          const newLog: HabitLog = {
            id: savedLog.id,
            habitId: savedLog.habit_id,
            date: savedLog.date,
            value: savedLog.value,
            metadata: savedLog.metadata,
            timestamp: new Date(savedLog.timestamp).getTime(),
            source: 'manual' as const
          };
          setLogs(prev => [...prev, newLog]);
        }
      }
    } catch (err) {
      console.error('Failed to update log value:', err);
    }
  };

  const clearAllData = async () => {
    try {
      await Promise.all(habits.map(h => fetch(`/api/habits/${h.id}`, { method: 'DELETE' })));
      setHabits([]);
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear data:', err);
    }
  };

  const userMetadata = user?.user_metadata || {};
  const fullName = userMetadata.full_name || 'User';
  const nickname = userMetadata.nickname || fullName.split(' ')[0];
  const userInitial = (nickname || fullName || user?.email || 'U').substring(0, 2).toUpperCase();

  const completedToday = habits.filter(h => {
    const log = logs.find(l => l.habitId === h.id && l.date === getTodayString());
    if (!log) return false;
    if (h.type === 'boolean') return log.value >= 1;
    return log.value >= h.targetValue;
  });

  const completionRate = habits.length > 0 
    ? Math.round((completedToday.length / habits.length) * 100) 
    : 0;

  const getMotivationalMessage = () => {
    if (habits.length === 0) return "Ready to start your journey?";
    if (completionRate === 0) return "One small step is all it takes.";
    if (completionRate < 50) return "You're off to a great start!";
    if (completionRate < 100) return "Almost there! Keep pushing.";
    return "Perfect day! You're a legend.";
  };

  const waterHabit = habits.find(h => h.title.toLowerCase().includes('water'));
  const waterLog = logs.find(l => l.habitId === waterHabit?.id && l.date === getTodayString());

  const filteredHabits = habits.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) && h.type !== 'health'
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {waterHabit && (
        <WaterReminder 
          currentValue={waterLog?.value || 0}
          targetValue={waterHabit.targetValue}
          nickname={nickname}
          lastLogTime={waterLog?.timestamp}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-50/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">HabitPulse</h1>
          <p className="text-xs font-medium text-zinc-500">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-2 text-zinc-500 hover:bg-zinc-200 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-50"></span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs hover:ring-2 hover:ring-indigo-500 transition-all"
          >
            {userInitial}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-4 space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
            <p className="text-zinc-500 font-medium animate-pulse">Syncing your habits...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center rotate-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900">Connection Error</h3>
              <p className="text-zinc-500 max-w-xs mx-auto leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="py-3 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : activeTab === 'today' ? (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-zinc-900">Hey, {nickname}! 👋</h2>
              <p className="text-zinc-500 font-medium">{getMotivationalMessage()}</p>
            </div>
            {/* Progress Card */}
            <section className="relative overflow-hidden bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-80">Daily Progress</span>
                  <span className="text-2xl font-bold">{completionRate}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    className="h-full bg-white"
                  />
                </div>
                <p className="text-sm opacity-90">
                  {completionRate === 100 
                    ? `Perfect day, ${nickname}! You've crushed all your habits.` 
                    : `${habits.length - completedToday.length} habits remaining for today.`}
                </p>
              </div>
              <Sparkles className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
            </section>

            {/* Search Bar (Conditional) */}
            <AnimatePresence>
              {isSearching && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search habits..."
                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Add */}
            {!isSearching && <QuickAdd onAdd={addHabit} />}

            {/* Habits List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  {searchQuery ? 'Search Results' : "Today's Habits"}
                </h2>
                {!searchQuery && (
                  <button className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredHabits.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center space-y-3"
                    >
                      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                        {searchQuery ? <Search size={32} /> : <Plus size={32} />}
                      </div>
                      <p className="text-zinc-500 font-medium">
                        {searchQuery ? `No results for "${searchQuery}"` : "No habits yet. Start by adding one!"}
                      </p>
                    </motion.div>
                  ) : (
                    filteredHabits.map((habit) => {
                      const todayLog = logs.find(l => l.habitId === habit.id && l.date === getTodayString());
                      const isCompleted = !!todayLog && (
                        habit.type === 'boolean' 
                          ? todayLog.value >= 1 
                          : todayLog.value >= habit.targetValue
                      );
                      return (
                        <HabitCard 
                          key={habit.id}
                          habit={habit}
                          isCompleted={isCompleted}
                          currentValue={todayLog?.value || 0}
                          hasNoteToday={!!todayLog?.note}
                          onToggle={() => toggleHabit(habit.id)}
                          onShowDetails={() => setSelectedHabit(habit)}
                        />
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </section>
          </>
        ) : activeTab === 'health' ? (
          <HealthTracker />
        ) : activeTab === 'analytics' ? (
          <Analytics habits={habits} logs={logs} />
        ) : (
          <Settings habits={habits} logs={logs} onClearData={clearAllData} />
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
        {isAdding && (
          <CreateHabitModal 
            onClose={() => setIsAdding(false)}
            onAdd={addHabit}
          />
        )}
        {editingHabit && (
          <CreateHabitModal 
            initialHabit={editingHabit}
            onClose={() => setEditingHabit(null)}
            onAdd={addHabit}
            onUpdate={updateHabit}
          />
        )}
        {selectedHabit && (
          <HabitDetailsModal 
            habit={selectedHabit}
            logs={logs}
            onClose={() => setSelectedHabit(null)}
            onEdit={() => {
              setEditingHabit(selectedHabit);
              setSelectedHabit(null);
            }}
            onDelete={() => deleteHabit(selectedHabit.id)}
            onUpdateLog={updateLog}
            onUpdateLogValue={updateLogValue}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md glass rounded-full px-4 py-2 flex items-center justify-between z-50">
        <button 
          onClick={() => { setActiveTab('today'); setIsSearching(false); }}
          className={cn(
            "p-3 rounded-full transition-all",
            activeTab === 'today' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <Calendar size={22} />
        </button>
        <button 
          onClick={() => { setActiveTab('health'); setIsSearching(false); }}
          className={cn(
            "p-3 rounded-full transition-all",
            activeTab === 'health' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <Activity size={22} />
        </button>
        <div className="relative -top-8">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-zinc-200 hover:scale-110 active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>
        <button 
          onClick={() => { setActiveTab('analytics'); setIsSearching(false); }}
          className={cn(
            "p-3 rounded-full transition-all",
            activeTab === 'analytics' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <BarChart2 size={22} />
        </button>
        <button 
          onClick={() => { setActiveTab('settings'); setIsSearching(false); }}
          className={cn(
            "p-3 rounded-full transition-all",
            activeTab === 'settings' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <SettingsIcon size={22} />
        </button>
      </nav>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-zinc-100 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-zinc-900">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Welcome to HabitPulse!</p>
                      <p className="text-[10px] text-zinc-500">Start your journey by adding your first habit.</p>
                    </div>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl flex gap-3 opacity-60">
                    <div className="w-8 h-8 bg-zinc-200 text-zinc-500 rounded-xl flex items-center justify-center shrink-0">
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Daily Reminder</p>
                      <p className="text-[10px] text-zinc-500">Don't forget to log your water intake today.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
