import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings as SettingsIcon, 
  BarChart2, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Flame, 
  ChevronRight,
  Search,
  MoreHorizontal,
  Bell,
  Sparkles,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { cn, getTodayString, calculateStreak } from './lib/utils';
import { Habit, HabitLog } from './lib/types';
import HabitCard from './components/HabitCard';
import QuickAdd from './components/QuickAdd';
import CreateHabitModal from './components/CreateHabitModal';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import HabitDetailsModal from './components/HabitDetailsModal';
import AuthPage from './components/AuthPage';
import WaterReminder from './components/specialized/WaterReminder';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'analytics' | 'settings'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data from API on mount or session change
  useEffect(() => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [habitsRes, logsRes] = await Promise.all([
          fetch(`/api/habits?userId=${session.user.id}`),
          fetch(`/api/logs?userId=${session.user.id}`)
        ]);
        
        if (habitsRes.ok && logsRes.ok) {
          const habitsData = await habitsRes.json();
          const logsData = await logsRes.json();
          
          const formattedLogs = logsData.map((l: any) => ({
            id: l.id,
            habitId: l.habit_id,
            date: l.date,
            value: l.value,
            timestamp: new Date(l.timestamp).getTime(),
            note: l.note,
            metadata: l.metadata
          }));

          setLogs(formattedLogs);
          
          setHabits(habitsData.map((h: any) => ({
            id: h.id,
            title: h.title,
            description: h.description,
            type: h.type,
            targetValue: h.target_value,
            unit: h.unit,
            frequency: h.frequency,
            customDays: h.custom_days,
            reminderTime: h.reminder_time,
            color: h.color,
            metadata: h.metadata,
            createdAt: new Date(h.created_at).getTime(),
            streak: calculateStreak(formattedLogs.filter((l: any) => l.habitId === h.id))
          })));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const addHabit = async (habit: Habit) => {
    if (!session) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          title: habit.title,
          type: habit.type,
          target_value: habit.targetValue,
          frequency: habit.frequency,
          color: habit.color,
          reminder_time: habit.reminderTime
        })
      });

      if (res.ok) {
        const savedHabit = await res.json();
        setHabits(prev => [{
          ...habit,
          id: savedHabit.id,
          createdAt: new Date(savedHabit.created_at).getTime(),
          streak: 0
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
    if (!session) return;
    const today = getTodayString();
    const existingLog = logs.find(l => l.habitId === habitId && l.date === today);

    try {
      if (existingLog) {
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
            user_id: session.user.id,
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
            timestamp: new Date(savedLog.timestamp).getTime()
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

  const updateLogValue = async (habitId: string, value: number, metadata?: any) => {
    if (!session) return;
    const today = getTodayString();
    const existingLog = logs.find(l => l.habitId === habitId && l.date === today);

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
            user_id: session.user.id,
            habit_id: habitId,
            date: today,
            value,
            metadata
          })
        });
        if (res.ok) {
          const savedLog = await res.json();
          const newLog = {
            id: savedLog.id,
            habitId: savedLog.habit_id,
            date: savedLog.date,
            value: savedLog.value,
            metadata: savedLog.metadata,
            timestamp: new Date(savedLog.timestamp).getTime()
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

  if (!session && !isLoading) {
    return <AuthPage />;
  }

  const todayLogs = logs.filter(l => l.date === getTodayString());
  const completionRate = habits.length > 0 
    ? Math.round((todayLogs.length / habits.length) * 100) 
    : 0;

  const waterHabit = habits.find(h => h.title.toLowerCase().includes('water'));
  const waterLog = logs.find(l => l.habitId === waterHabit?.id && l.date === getTodayString());

  const filteredHabits = habits.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
          <Sparkles size={32} />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-2">Configuration Required</h1>
        <p className="text-zinc-500 max-w-sm mb-8">
          Please set your Supabase environment variables to start tracking your habits.
        </p>
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 w-full max-w-md text-left space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Required Variables</p>
            <code className="block bg-zinc-50 p-3 rounded-xl text-sm font-mono text-zinc-600">
              VITE_SUPABASE_URL<br />
              VITE_SUPABASE_ANON_KEY
            </code>
          </div>
          <p className="text-sm text-zinc-500 italic">
            Check the .env.example file for more details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {waterHabit && (
        <WaterReminder 
          currentValue={waterLog?.value || 0}
          targetValue={waterHabit.targetValue}
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
          <button className="p-2 text-zinc-500 hover:bg-zinc-200 rounded-full transition-colors">
            <Bell size={20} />
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
          >
            <LogOut size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {session?.user.email?.substring(0, 2).toUpperCase()}
          </div>
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
        ) : activeTab === 'today' ? (
          <>
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
                    ? "Perfect day! You've crushed all your habits." 
                    : `${habits.length - todayLogs.length} habits remaining for today.`}
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
                      return (
                        <HabitCard 
                          key={habit.id}
                          habit={habit}
                          isCompleted={!!todayLog}
                          hasNoteToday={!!todayLog?.note}
                          onToggle={() => toggleHabit(habit.id)}
                          onDelete={() => deleteHabit(habit.id)}
                          onShowDetails={() => setSelectedHabit(habit)}
                        />
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </section>
          </>
        ) : activeTab === 'analytics' ? (
          <Analytics habits={habits} logs={logs} />
        ) : (
          <Settings habits={habits} logs={logs} onClearData={clearAllData} />
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
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
          onClick={() => { setActiveTab('today'); setIsSearching(false); setSearchQuery(''); }}
          className={cn(
            "p-3 rounded-full transition-all",
            activeTab === 'today' && !isSearching ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <Calendar size={22} />
        </button>
        <button 
          onClick={() => { setActiveTab('analytics'); setIsSearching(false); }}
          className={cn(
            "p-3 rounded-full transition-all",
            activeTab === 'analytics' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <BarChart2 size={22} />
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
          onClick={() => { setActiveTab('settings'); setIsSearching(false); }}
          className={cn(
            "p-3 rounded-full transition-all",
            activeTab === 'settings' ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <SettingsIcon size={22} />
        </button>
        <button 
          onClick={() => {
            if (activeTab !== 'today') setActiveTab('today');
            setIsSearching(!isSearching);
            if (isSearching) setSearchQuery('');
          }}
          className={cn(
            "p-3 rounded-full transition-all",
            isSearching ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <Search size={22} />
        </button>
      </nav>
    </div>
  );
};

export default App;
