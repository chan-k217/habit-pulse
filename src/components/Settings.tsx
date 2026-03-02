import React from 'react';
import { 
  User, 
  Shield, 
  Download, 
  Trash2, 
  ChevronRight, 
  Moon, 
  LogOut,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { Habit, HabitLog } from '../lib/types';

interface SettingsProps {
  habits: Habit[];
  logs: HabitLog[];
  onClearData: () => void;
}

interface SettingsItem {
  icon: any;
  label: string;
  value?: string;
  color: string;
  bg: string;
  onClick?: () => void;
  description?: string;
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const Settings: React.FC<SettingsProps> = ({ habits, logs, onClearData }) => {
  const exportData = () => {
    const data = {
      habits,
      logs,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitpulse-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', value: 'John Doe', color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: CreditCard, label: 'Subscription', value: 'Pulse Pro', color: 'text-indigo-500', bg: 'bg-indigo-50' },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: Moon, label: 'Dark Mode', value: 'System', color: 'text-zinc-500', bg: 'bg-zinc-100' },
        { icon: Shield, label: 'Privacy & Security', color: 'text-emerald-500', bg: 'bg-emerald-50' },
      ]
    },
    {
      title: 'Data Management',
      items: [
        { 
          icon: Download, 
          label: 'Export Data', 
          onClick: exportData, 
          color: 'text-orange-500', 
          bg: 'bg-orange-50',
          description: 'Download your habits and history as JSON'
        },
        { 
          icon: Trash2, 
          label: 'Clear All Data', 
          onClick: () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
              onClearData();
            }
          }, 
          color: 'text-red-500', 
          bg: 'bg-red-50', 
          danger: true 
        },
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-2">
        <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-200">
          JD
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900">John Doe</h2>
          <p className="text-sm text-zinc-500 font-medium">Pro Member since 2024</p>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-2">
              {section.title}
            </h3>
            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors ${
                    i !== section.items.length - 1 ? 'border-b border-zinc-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${item.danger ? 'text-red-500' : 'text-zinc-900'}`}>
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-[10px] text-zinc-400 font-medium">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-xs font-bold text-zinc-400">{item.value}</span>
                    )}
                    <ChevronRight size={16} className="text-zinc-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-4 justify-center px-4">
        <button className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
          Privacy Policy <ExternalLink size={10} />
        </button>
        <button className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
          Terms of Service <ExternalLink size={10} />
        </button>
        <button className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
          Log Out <LogOut size={10} />
        </button>
      </div>
      
      <p className="text-center text-[10px] text-zinc-300 font-medium">
        HabitPulse v1.0.0 • Made with ❤️
      </p>
    </div>
  );
};

export default Settings;
