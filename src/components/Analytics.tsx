import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Habit, HabitLog } from '../lib/types';
import { getCompletionStats, getLastNDays } from '../lib/utils';
import { motion } from 'motion/react';
import { TrendingUp, Award, Grid, Flame, Calendar } from 'lucide-react';

interface AnalyticsProps {
  habits: Habit[];
  logs: HabitLog[];
}

const Analytics: React.FC<AnalyticsProps> = ({ habits, logs }) => {
  const weeklyData = getCompletionStats(habits, logs, 7);
  const last90Days = getLastNDays(90);
  
  const categoryData = habits.map(h => {
    const habitLogs = logs.filter(l => l.habitId === h.id);
    return {
      name: h.title,
      value: habitLogs.length,
      color: h.color
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  const totalCompletions = logs.length;
  const bestStreak = Math.max(...habits.map(h => h.streak), 0);
  const averageCompletion = weeklyData.reduce((acc, curr) => acc + curr.rate, 0) / 7;

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm"
        >
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-3">
            <Flame size={20} fill="currentColor" />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Best Streak</p>
          <p className="text-2xl font-black text-zinc-900">{bestStreak}d</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
            <Award size={20} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Logs</p>
          <p className="text-2xl font-black text-zinc-900">{totalCompletions}</p>
        </motion.div>
      </div>

      {/* Heatmap */}
      <section className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Grid className="text-indigo-600" size={20} />
          <h3 className="font-bold text-zinc-900">Activity Heatmap</h3>
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          {last90Days.map((date) => {
            const dayLogs = logs.filter(l => l.date === date);
            const intensity = Math.min(dayLogs.length, 4);
            const colors = ['bg-zinc-100', 'bg-indigo-100', 'bg-indigo-300', 'bg-indigo-500', 'bg-indigo-700'];
            
            return (
              <div 
                key={date}
                title={`${date}: ${dayLogs.length} completions`}
                className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-colors`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-zinc-100" />
            <div className="w-2 h-2 rounded-sm bg-indigo-300" />
            <div className="w-2 h-2 rounded-sm bg-indigo-700" />
          </div>
          <span>More</span>
        </div>
      </section>

      {/* Weekly Activity */}
      <section className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={20} />
            <h3 className="font-bold text-zinc-900">Weekly Activity</h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            +{Math.round(averageCompletion)}% avg
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
                tick={{ fontSize: 10, fontWeight: 600, fill: '#a1a1aa' }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="completed" radius={[6, 6, 6, 6]} barSize={32}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rate > 70 ? '#6366f1' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top Habits */}
      <section className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={20} />
          <h3 className="font-bold text-zinc-900">Top Habits</h3>
        </div>

        <div className="space-y-4">
          {categoryData.length === 0 ? (
            <p className="text-center py-8 text-zinc-400 text-sm italic">No data yet</p>
          ) : categoryData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-600">{item.name}</span>
                <span className="text-zinc-400">{item.value} times</span>
              </div>
              <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / totalCompletions) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Analytics;
