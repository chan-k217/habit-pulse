import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Habit, HabitLog } from '../lib/types';
import { getCompletionStats, getLastNDays } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Award, Grid, Flame, Calendar, ChevronDown, Book, Dumbbell } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AnalyticsProps {
  habits: Habit[];
  logs: HabitLog[];
}

const Analytics: React.FC<AnalyticsProps> = ({ habits, logs }) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string | 'all'>('all');
  
  const weeklyData = getCompletionStats(habits, logs, 7);
  const last90Days = getLastNDays(90);
  
  const totalCompletions = logs.length;
  const bestStreak = Math.max(...habits.map(h => h.streak), 0);
  const averageCompletion = weeklyData.reduce((acc, curr) => acc + curr.rate, 0) / 7;

  const selectedHabit = selectedHabitId === 'all' ? null : habits.find(h => h.id === selectedHabitId);
  const filteredLogs = selectedHabitId === 'all' ? logs : logs.filter(l => l.habitId === selectedHabitId);

  // Time Series Data for Selected Habit
  const timeSeriesData = getLastNDays(30).map(date => {
    const log = filteredLogs.find(l => l.date === date);
    return {
      date: format(parseISO(date), 'MMM d'),
      value: log?.value || 0,
      completed: !!log
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Habit Selector */}
      <div className="relative">
        <select 
          value={selectedHabitId}
          onChange={(e) => setSelectedHabitId(e.target.value)}
          className="w-full bg-white border border-zinc-100 rounded-2xl px-6 py-4 text-sm font-bold shadow-sm outline-none appearance-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Habits Overview</option>
          {habits.map(h => (
            <option key={h.id} value={h.id}>{h.title}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
      </div>

      <AnimatePresence mode="wait">
        {selectedHabitId === 'all' ? (
          <motion.div 
            key="all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
                  <Flame size={20} fill="currentColor" />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Best Streak</p>
                <p className="text-3xl font-black text-zinc-900">{bestStreak}d</p>
              </div>
              
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <Award size={20} />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Logs</p>
                <p className="text-3xl font-black text-zinc-900">{totalCompletions}</p>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">7-Day Rate</p>
                <p className="text-3xl font-black text-indigo-600">{Math.round(averageCompletion)}%</p>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">30-Day Rate</p>
                <p className="text-3xl font-black text-indigo-600">
                  {Math.round(getCompletionStats(habits, logs, 30).reduce((acc, curr) => acc + curr.rate, 0) / 30)}%
                </p>
              </div>
            </div>

            {/* Heatmap */}
            <section className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Grid size={20} />
                </div>
                <h3 className="font-black text-zinc-900 tracking-tight">Activity Heatmap</h3>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {last90Days.map((date) => {
                  const dayLogs = logs.filter(l => l.date === date);
                  const intensity = Math.min(dayLogs.length, 4);
                  const colors = ['bg-zinc-100', 'bg-indigo-100', 'bg-indigo-300', 'bg-indigo-500', 'bg-indigo-700'];
                  
                  return (
                    <div 
                      key={date}
                      title={`${date}: ${dayLogs.length} completions`}
                      className={`w-3.5 h-3.5 rounded-sm ${colors[intensity]} transition-colors`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-zinc-100" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-300" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-700" />
                </div>
                <span>More</span>
              </div>
            </section>

            {/* Weekly Activity */}
            <section className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <h3 className="font-black text-zinc-900 tracking-tight">Weekly Activity</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                  {Math.round(averageCompletion)}% avg
                </span>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="completed" radius={[8, 8, 8, 8]} barSize={32}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rate > 70 ? '#6366f1' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div 
            key="habit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Habit Specific Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Streak</p>
                <p className="text-3xl font-black text-zinc-900">{selectedHabit?.streak}d</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total</p>
                <p className="text-3xl font-black text-zinc-900">{filteredLogs.length}</p>
              </div>
            </div>

            {/* Value Trend Chart */}
            <section className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-black text-zinc-900 tracking-tight">30-Day Trend</h3>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                      interval={6}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Specialized Insights */}
            {selectedHabit?.title.toLowerCase().includes('read') && (
              <section className="bg-indigo-600 p-8 rounded-[40px] text-white space-y-6">
                <div className="flex items-center gap-3">
                  <Book size={24} />
                  <h3 className="text-xl font-black tracking-tight">Reading Insights</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Total Minutes</p>
                    <p className="text-2xl font-black">{filteredLogs.reduce((acc, curr) => acc + curr.value, 0)}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Avg Session</p>
                    <p className="text-2xl font-black">
                      {filteredLogs.length > 0 ? Math.round(filteredLogs.reduce((acc, curr) => acc + curr.value, 0) / filteredLogs.length) : 0}m
                    </p>
                  </div>
                </div>
              </section>
            )}

            {selectedHabit?.title.toLowerCase().includes('gym') && (
              <section className="bg-orange-600 p-8 rounded-[40px] text-white space-y-6">
                <div className="flex items-center gap-3">
                  <Dumbbell size={24} />
                  <h3 className="text-xl font-black tracking-tight">Gym Insights</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Sessions</p>
                    <p className="text-2xl font-black">{filteredLogs.length}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Intensity</p>
                    <p className="text-2xl font-black">High</p>
                  </div>
                </div>
                <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Recent Exercises</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(filteredLogs.flatMap(l => (l.metadata?.exercises as string[]) || []))).slice(0, 6).map(ex => (
                      <span key={ex} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{ex}</span>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;
