import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Plus, 
  TrendingUp, 
  Trash2,
  Pill,
  Save,
  X,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { HealthLog, ConditionMetadata } from '../lib/types';
import { useAuth } from '../lib/useAuth';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const HealthTracker: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [activeTab, setActiveTab] = useState<'vitals' | 'conditions'>('vitals');
  const [isAddingVital, setIsAddingVital] = useState(false);
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);
  
  // Vital Form State
  const [vitalDate, setVitalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('');
  const [vitalNote, setVitalNote] = useState('');

  // Condition Form State
  const [conditionDate, setConditionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [conditionName, setConditionName] = useState('');
  const [conditionStatus, setConditionStatus] = useState<'active' | 'recovered' | 'chronic'>('active');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [medicines, setMedicines] = useState<string[]>([]);
  const [newMedicine, setNewMedicine] = useState('');
  const [conditionNote, setConditionNote] = useState('');

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/health?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch health logs');
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching health logs:', err);
      setLogs([]);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  const handleSaveVital = async () => {
    if (!user) return;
    
    const newLog = {
      user_id: user.id,
      date: vitalDate,
      weight: weight ? parseFloat(weight) : null,
      note: vitalNote,
      metadata: { type: 'vital' },
      timestamp: new Date(vitalDate).getTime()
    };

    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
      
      if (res.ok) {
        fetchLogs();
        setIsAddingVital(false);
        resetVitalForm();
      }
    } catch (err) {
      console.error('Error saving vital log:', err);
    }
  };

  const handleSaveCondition = async () => {
    if (!user || !conditionName) return;

    const metadata: ConditionMetadata = {
      type: 'condition',
      condition: conditionName,
      status: conditionStatus,
      severity,
      symptoms,
      medicines,
      onset_date: conditionDate,
      end_date: conditionStatus === 'recovered' ? endDate : undefined
    };
    
    const newLog = {
      user_id: user.id,
      date: conditionDate,
      note: conditionNote,
      metadata,
      timestamp: new Date(conditionDate).getTime()
    };

    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
      
      if (res.ok) {
        fetchLogs();
        setIsAddingCondition(false);
        resetConditionForm();
      }
    } catch (err) {
      console.error('Error saving condition log:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`/api/health/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLogs(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Error deleting health log:', err);
    }
  };

  const resetVitalForm = () => {
    setVitalDate(format(new Date(), 'yyyy-MM-dd'));
    setWeight('');
    setVitalNote('');
  };

  const resetConditionForm = () => {
    setConditionDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
    setConditionName('');
    setConditionStatus('active');
    setSeverity('mild');
    setSymptoms([]);
    setMedicines([]);
    setConditionNote('');
    setNewSymptom('');
    setNewMedicine('');
  };

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const addMedicine = () => {
    if (newMedicine.trim()) {
      setMedicines([...medicines, newMedicine.trim()]);
      setNewMedicine('');
    }
  };

  const vitalLogs = logs.filter(l => !l.metadata || (l.metadata as ConditionMetadata).type !== 'condition');
  const conditionLogs = logs.filter(l => (l.metadata as ConditionMetadata)?.type === 'condition');

  const chartData = [...vitalLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter(l => l.weight)
    .slice(-14)
    .map(l => ({
      date: format(parseISO(l.date), 'MMM d'),
      weight: l.weight
    }));

  // Group conditions by name
  const groupedConditions = conditionLogs.reduce((acc, log) => {
    const meta = log.metadata as ConditionMetadata;
    const name = meta.condition || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(log);
    return acc;
  }, {} as Record<string, HealthLog[]>);

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Health Hub</h2>
          <p className="text-zinc-500 font-medium">Track your vitals and wellness</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('vitals')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'vitals' ? "bg-white shadow-sm text-indigo-600" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Vitals
          </button>
          <button
            onClick={() => setActiveTab('conditions')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'conditions' ? "bg-white shadow-sm text-indigo-600" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Conditions
          </button>
        </div>
      </div>

      {activeTab === 'vitals' ? (
        <div className="space-y-8">
          {/* Weight Chart */}
          {chartData.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-zinc-900">Weight Trend</h3>
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Last 14 Logs</span>
              </div>
              
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#a1a1aa' }}
                    />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#6366f1" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[32px] border border-zinc-100 shadow-sm space-y-3">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                <Scale size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Current Weight</p>
                <p className="text-2xl font-black text-zinc-900">{vitalLogs.find(l => l.weight)?.weight || '--'} <span className="text-sm font-bold text-zinc-400">kg</span></p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAddingVital(true)}
              className="bg-indigo-600 text-white p-5 rounded-[32px] shadow-lg shadow-indigo-200 flex flex-col items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Plus size={32} />
              <span className="font-bold">Log Vitals</span>
            </button>
          </div>

          {/* Recent Vital Logs */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-2">Recent Records</h3>
            <div className="space-y-3">
              {vitalLogs.map((log) => (
                <motion.div 
                  key={log.id}
                  layout
                  className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{format(parseISO(log.date), 'MMM')}</span>
                    <span className="text-lg font-black text-zinc-900 leading-none">{format(parseISO(log.date), 'd')}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.weight && (
                          <span className="text-sm font-black text-zinc-900">{log.weight}kg</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDelete(log.id!)}
                        className="text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {log.note && (
                      <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{log.note}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Add Condition Button */}
          <button 
            onClick={() => setIsAddingCondition(true)}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={20} />
            Log New Condition
          </button>

          {/* Active Conditions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-2">Condition History</h3>
            <div className="space-y-3">
              {Object.entries(groupedConditions).map(([name, logs]) => {
                const latestLog = logs[0];
                const meta = latestLog.metadata as ConditionMetadata;
                const isRecovered = meta.status === 'recovered';
                const isExpanded = expandedCondition === name;
                
                let durationString = '';
                if (meta.onset_date) {
                  const start = parseISO(meta.onset_date);
                  const end = meta.end_date ? parseISO(meta.end_date) : new Date();
                  const days = differenceInDays(end, start);
                  if (days > 0) {
                    durationString = ` • ${days} day${days === 1 ? '' : 's'}`;
                  }
                }

                return (
                  <motion.div 
                    key={name}
                    layout
                    className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-4 overflow-hidden"
                  >
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedCondition(isExpanded ? null : name)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                          isRecovered ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                        )}>
                          {isRecovered ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">{name}</h4>
                          <p className="text-xs font-medium text-zinc-500">
                            {logs.length} updates • Last update {format(parseISO(latestLog.date), 'MMM d')}{durationString}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          isRecovered ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {meta.status}
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 pt-4 border-t border-zinc-100"
                        >
                          {logs.map((log) => {
                            const logMeta = log.metadata as ConditionMetadata;
                            return (
                              <div key={log.id} className="relative pl-4 border-l-2 border-zinc-100 py-1">
                                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-zinc-300" />
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-bold text-zinc-500">{format(parseISO(log.date), 'MMM d, yyyy')}</span>
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase",
                                    logMeta.severity === 'severe' ? "text-red-500" : 
                                    logMeta.severity === 'moderate' ? "text-orange-500" : "text-emerald-500"
                                  )}>
                                    {logMeta.severity}
                                  </span>
                                </div>
                                
                                <div className="space-y-2">
                                  {logMeta.symptoms && logMeta.symptoms.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {logMeta.symptoms.map(s => (
                                        <span key={s} className="px-1.5 py-0.5 bg-zinc-100 rounded text-[10px] font-medium text-zinc-600">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {logMeta.medicines && logMeta.medicines.length > 0 && (
                                    <div className="flex items-center gap-1 text-[11px] text-indigo-600">
                                      <Pill size={12} />
                                      <span>{logMeta.medicines.join(', ')}</span>
                                    </div>
                                  )}

                                  {log.note && (
                                    <p className="text-sm text-zinc-600 bg-zinc-50 p-2 rounded-lg italic">
                                      "{log.note}"
                                    </p>
                                  )}
                                  
                                  <div className="flex justify-end pt-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                                      className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                                      title="Delete log entry"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              {Object.keys(groupedConditions).length === 0 && (
                <div className="text-center py-12 text-zinc-400">
                  <Stethoscope size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No medical conditions logged yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Vital Modal */}
      <AnimatePresence>
        {isAddingVital && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingVital(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Log Vitals</h3>
                  <button onClick={() => setIsAddingVital(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X size={24} className="text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date"
                      value={vitalDate}
                      onChange={(e) => setVitalDate(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Notes</label>
                    <textarea 
                      placeholder="Optional notes..."
                      value={vitalNote}
                      onChange={(e) => setVitalNote(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium min-h-[100px]"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveVital}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Save Vitals
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Condition Modal */}
      <AnimatePresence>
        {isAddingCondition && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingCondition(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Log Condition</h3>
                  <button onClick={() => setIsAddingCondition(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X size={24} className="text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Date</label>
                      <input 
                        type="date"
                        value={conditionDate}
                        onChange={(e) => setConditionDate(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Status</label>
                      <select 
                        value={conditionStatus}
                        onChange={(e) => setConditionStatus(e.target.value as 'active' | 'recovered' | 'chronic')}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                      >
                        <option value="active">Active</option>
                        <option value="recovered">Recovered</option>
                        <option value="chronic">Chronic</option>
                      </select>
                    </div>
                  </div>

                  {conditionStatus === 'recovered' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">End Date</label>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Condition Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Common Cold, Migraine"
                      value={conditionName}
                      onChange={(e) => setConditionName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Severity */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Severity</label>
                    <div className="flex bg-zinc-50 p-1 rounded-2xl border border-zinc-100">
                      {(['mild', 'moderate', 'severe'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSeverity(s)}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                            severity === s 
                              ? "bg-white shadow-sm text-indigo-600" 
                              : "text-zinc-400 hover:text-zinc-600"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Symptoms</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {symptoms.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1">
                          {s}
                          <button onClick={() => setSymptoms(prev => prev.filter((_, idx) => idx !== i))}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add symptom..."
                        value={newSymptom}
                        onChange={(e) => setNewSymptom(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
                        className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                      />
                      <button 
                        onClick={addSymptom}
                        className="px-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Medicines */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Medicines</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {medicines.map((m, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1">
                          {m}
                          <button onClick={() => setMedicines(prev => prev.filter((_, idx) => idx !== i))}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add medicine..."
                        value={newMedicine}
                        onChange={(e) => setNewMedicine(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addMedicine()}
                        className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                      />
                      <button 
                        onClick={addMedicine}
                        className="px-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Notes / Triggers</label>
                    <textarea 
                      placeholder="Details about triggers, progress, etc..."
                      value={conditionNote}
                      onChange={(e) => setConditionNote(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium min-h-[100px]"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveCondition}
                  disabled={!conditionName}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  Save Condition Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthTracker;
