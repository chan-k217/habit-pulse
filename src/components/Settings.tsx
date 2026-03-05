import React, { useState } from 'react';
import { 
  User, 
  Download, 
  Trash2, 
  ChevronRight, 
  LogOut,
  CreditCard,
  Bell,
  Smartphone,
  Mail,
  Save,
  Camera,
  AtSign,
  Check
} from 'lucide-react';
import { Habit, HabitLog } from '../lib/types';
import { useAuth } from '../lib/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface SettingsProps {
  habits: Habit[];
  logs: HabitLog[];
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ habits, logs, onClearData }) => {
  const { user, signOut } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile Form State
  const userMetadata = user?.user_metadata || {};
  const [fullName, setFullName] = useState(userMetadata.full_name || '');
  const [nickname, setNickname] = useState(userMetadata.nickname || '');
  const email = user?.email || '';

  // Notification State
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: true
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          nickname: nickname
        }
      });
      if (error) throw error;
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const exportData = (format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      const data = {
        habits,
        logs,
        exportedAt: new Date().toISOString(),
        version: '1.1.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      downloadFile(blob, `habitpulse-export-${new Date().toISOString().split('T')[0]}.json`);
    } else {
      // CSV Export
      const headers = ['Date', 'Habit', 'Type', 'Value', 'Target', 'Unit', 'Note'];
      const rows = logs.map(log => {
        const habit = habits.find(h => h.id === log.habitId);
        return [
          log.date,
          habit?.title || 'Unknown',
          habit?.type || 'Unknown',
          log.value,
          habit?.targetValue || '',
          habit?.unit || '',
          log.note || ''
        ].map(val => `"${val}"`).join(',');
      });
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadFile(blob, `habitpulse-export-${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const userInitial = (nickname || fullName || email || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8 pb-24">
      {/* Profile Header Card */}
      <section className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        
        <div className="relative flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-200">
              {userInitial}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-indigo-600 transition-colors">
              <Camera size={18} />
            </button>
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{fullName || 'Set your name'}</h2>
            <p className="text-sm text-zinc-500 font-medium">@{nickname || 'nickname'} • {email}</p>
          </div>

          <button 
            onClick={() => setIsEditingProfile(true)}
            className="px-6 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </section>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Habits</p>
          <p className="text-xl font-black text-zinc-900">{habits.length}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Logs</p>
          <p className="text-xl font-black text-zinc-900">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Level</p>
          <p className="text-xl font-black text-indigo-600">12</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Notifications */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-4">Notifications</h3>
          <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden p-2">
            {[
              { id: 'email', label: 'Email Reports', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
              { id: 'push', label: 'Push Notifications', icon: Smartphone, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { id: 'reminders', label: 'Daily Reminders', icon: Bell, color: 'text-orange-500', bg: 'bg-orange-50' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", item.bg, item.color)}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">{item.label}</span>
                </div>
                <button 
                  onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    notifications[item.id as keyof typeof notifications] ? "bg-indigo-600" : "bg-zinc-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    notifications[item.id as keyof typeof notifications] ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account & Data */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-4">Account & Data</h3>
          <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900">Subscription</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Manage your Pulse Pro plan</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
            
            <div className="w-full flex flex-col p-5 border-b border-zinc-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Download size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-zinc-900">Export Data</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Download your history</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => exportData('json')}
                  className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold transition-colors"
                >
                  JSON Format
                </button>
                <button 
                  onClick={() => exportData('csv')}
                  className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold transition-colors"
                >
                  CSV Format
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  onClearData();
                }
              }}
              className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-red-600">Clear All Data</p>
                  <p className="text-[10px] text-red-400 font-medium">Delete all habits and logs</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-red-200" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="px-4">
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Edit Profile</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Nickname</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        disabled
                        type="email"
                        value={email}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-100 border border-zinc-100 rounded-2xl text-zinc-400 text-sm font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Check className="animate-pulse" /> : <Save size={20} />}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <p className="text-center text-[10px] text-zinc-300 font-medium">
        HabitPulse v1.1.0 • Made with ❤️
      </p>
    </div>
  );
};

export default Settings;
