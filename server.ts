import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
let isMockMode = false;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.warn('Supabase environment variables are missing or placeholders. Running in MOCK MODE.');
  isMockMode = true;
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    isMockMode = true;
  }
}

// In-memory store for mock mode
const mockStore = {
  habits: [] as Record<string, unknown>[],
  logs: [] as Record<string, unknown>[]
};

app.use(express.json());

// Health Check
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', mode: isMockMode ? 'mock' : 'supabase' });
});

// API Routes
app.get('/api/habits', async (req, res) => {
  const { userId } = req.query;
  
  if (isMockMode) {
    const habits = userId ? mockStore.habits.filter(h => h.user_id === userId) : mockStore.habits;
    return res.json(habits);
  }

  try {
    let query = supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: message });
  }
});

app.post('/api/habits', async (req, res) => {
  if (isMockMode) {
    const newHabit = {
      ...req.body,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    mockStore.habits.push(newHabit);
    return res.json(newHabit);
  }

  try {
    const { data, error } = await supabase
      .from('habits')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating habit:', error);
    res.status(500).json({ error: message });
  }
});

app.put('/api/habits/:id', async (req, res) => {
  const { id } = req.params;

  if (isMockMode) {
    const index = mockStore.habits.findIndex(h => h.id === id);
    if (index === -1) return res.status(404).json({ error: 'Habit not found' });
    mockStore.habits[index] = { ...mockStore.habits[index], ...req.body };
    return res.json(mockStore.habits[index]);
  }

  try {
    const { data, error } = await supabase
      .from('habits')
      .update(req.body)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating habit:', error);
    res.status(500).json({ error: message });
  }
});

app.delete('/api/habits/:id', async (req, res) => {
  const { id } = req.params;

  if (isMockMode) {
    mockStore.habits = mockStore.habits.filter(h => h.id !== id);
    mockStore.logs = mockStore.logs.filter(l => l.habit_id !== id);
    return res.json({ success: true });
  }

  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: message });
  }
});

app.get('/api/logs', async (req, res) => {
  const { userId } = req.query;

  if (isMockMode) {
    const logs = userId ? mockStore.logs.filter(l => l.user_id === userId) : mockStore.logs;
    return res.json(logs);
  }

  try {
    let query = supabase
      .from('habit_logs')
      .select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: message });
  }
});

app.post('/api/logs', async (req, res) => {
  if (isMockMode) {
    const newLog = {
      ...req.body,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    mockStore.logs.push(newLog);
    return res.json(newLog);
  }

  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating log:', error);
    res.status(500).json({ error: message });
  }
});

app.put('/api/logs/:id', async (req, res) => {
  const { id } = req.params;

  if (isMockMode) {
    const index = mockStore.logs.findIndex(l => l.id === id);
    if (index === -1) return res.status(404).json({ error: 'Log not found' });
    mockStore.logs[index] = { ...mockStore.logs[index], ...req.body };
    return res.json(mockStore.logs[index]);
  }

  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .update(req.body)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating log:', error);
    res.status(500).json({ error: message });
  }
});

app.delete('/api/logs/:id', async (req, res) => {
  const { id } = req.params;

  if (isMockMode) {
    mockStore.logs = mockStore.logs.filter(l => l.id !== id);
    return res.json({ success: true });
  }

  try {
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error deleting log:', error);
    res.status(500).json({ error: message });
  }
});

// Health Logs Routes (Using habits and habit_logs tables)
app.get('/api/health', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  if (isMockMode) {
    const healthHabit = mockStore.habits.find(h => h.user_id === userId && h.type === 'health');
    if (!healthHabit) return res.json([]);
    const logs = mockStore.logs
      .filter(l => l.habit_id === healthHabit.id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(log => ({
        id: log.id,
        user_id: log.user_id,
        date: log.date,
        weight: log.metadata?.weight ?? (log.metadata?.type === 'vital' ? log.value : undefined),
        note: log.note,
        metadata: log.metadata,
        timestamp: new Date(log.timestamp).getTime()
      }));
    return res.json(logs);
  }

  try {
    // 1. Find the Health Tracker habit
    const { data: habits, error: habitError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'health')
      .limit(1);

    if (habitError) throw habitError;

    if (!habits || habits.length === 0) {
      return res.json([]); // No health habit means no logs
    }

    const healthHabitId = habits[0].id;

    // 2. Get logs for this habit
    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', healthHabitId)
      .order('date', { ascending: false });
    
    if (logsError) throw logsError;

    // 3. Map to HealthLog format
    const healthLogs = logs.map(log => ({
      id: log.id,
      user_id: log.user_id,
      date: log.date,
      weight: log.metadata?.weight ?? (log.metadata?.type === 'vital' ? log.value : undefined),
      note: log.note,
      metadata: log.metadata,
      timestamp: new Date(log.timestamp).getTime()
    }));

    res.json(healthLogs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching health logs:', error);
    res.status(500).json({ error: message });
  }
});

app.post('/api/health', async (req, res) => {
  const { user_id, date, weight, note, metadata } = req.body;

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  if (isMockMode) {
    let healthHabit = mockStore.habits.find(h => h.user_id === user_id && h.type === 'health');
    if (!healthHabit) {
      healthHabit = {
        id: crypto.randomUUID(),
        user_id,
        title: 'Health Tracker',
        type: 'health',
        target_value: 1,
        frequency: 'daily',
        color: '#6366f1',
        created_at: new Date().toISOString()
      };
      mockStore.habits.push(healthHabit);
    }

    const finalMetadata = { ...metadata };
    if (weight !== undefined && weight !== null) {
      finalMetadata.weight = weight;
    }

    const newLog = {
      id: crypto.randomUUID(),
      user_id,
      habit_id: healthHabit.id,
      date,
      value: weight || 1,
      note,
      metadata: finalMetadata,
      timestamp: new Date().toISOString()
    };
    mockStore.logs.push(newLog);

    return res.json({
      id: newLog.id,
      user_id: newLog.user_id,
      date: newLog.date,
      weight: newLog.metadata?.weight,
      note: newLog.note,
      metadata: newLog.metadata,
      timestamp: new Date(newLog.timestamp).getTime()
    });
  }

  try {
    // 1. Find or Create Health Tracker habit
    const { data: habits, error: habitError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', user_id)
      .eq('type', 'health')
      .limit(1);

    if (habitError) throw habitError;

    let healthHabitId;

    if (!habits || habits.length === 0) {
      // Create it
      const { data: newHabit, error: createError } = await supabase
        .from('habits')
        .insert([{
          user_id,
          title: 'Health Tracker',
          type: 'health',
          target_value: 1,
          frequency: 'daily',
          color: '#6366f1', // Indigo
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (createError) throw createError;
      healthHabitId = newHabit[0].id;
    } else {
      healthHabitId = habits[0].id;
    }

    // 2. Insert Log
    const finalMetadata = { ...metadata };
    if (weight !== undefined && weight !== null) {
      finalMetadata.weight = weight;
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .insert([{
        user_id,
        habit_id: healthHabitId,
        date,
        value: weight || 1, // Store weight in value for analytics, default to 1
        note,
        metadata: finalMetadata,
        timestamp: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;

    // Map back to HealthLog
    const log = data[0];
    const healthLog = {
      id: log.id,
      user_id: log.user_id,
      date: log.date,
      weight: log.metadata?.weight, // Retrieve from metadata
      note: log.note,
      metadata: log.metadata,
      timestamp: new Date(log.timestamp).getTime()
    };

    res.json(healthLog);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating health log:', error);
    res.status(500).json({ error: message });
  }
});

app.put('/api/health/:id', async (req, res) => {
  const { id } = req.params;
  const { weight, note, metadata } = req.body;

  if (isMockMode) {
    const index = mockStore.logs.findIndex(l => l.id === id);
    if (index === -1) return res.status(404).json({ error: 'Log not found' });
    
    const updatedLog = { ...mockStore.logs[index] };
    if (note !== undefined) updatedLog.note = note;
    if (metadata !== undefined) updatedLog.metadata = metadata;
    if (weight !== undefined) {
      updatedLog.value = weight;
      updatedLog.metadata = { ...updatedLog.metadata, weight };
    }
    
    mockStore.logs[index] = updatedLog;
    return res.json({
      id: updatedLog.id,
      user_id: updatedLog.user_id,
      date: updatedLog.date,
      weight: updatedLog.metadata?.weight,
      note: updatedLog.note,
      metadata: updatedLog.metadata,
      timestamp: new Date(updatedLog.timestamp).getTime()
    });
  }

  try {
    // We are updating a habit_log
    const updateData: Record<string, unknown> = {
      note,
      metadata
    };
    
    if (weight !== undefined) {
      updateData.value = weight;
      // Also update metadata
      updateData.metadata = { 
        ...(typeof metadata === 'object' ? metadata : {}), 
        weight 
      };
    } else if (metadata) {
       updateData.metadata = metadata;
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    const log = data[0];
    const healthLog = {
      id: log.id,
      user_id: log.user_id,
      date: log.date,
      weight: log.metadata?.weight,
      note: log.note,
      metadata: log.metadata,
      timestamp: new Date(log.timestamp).getTime()
    };

    res.json(healthLog);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating health log:', error);
    res.status(500).json({ error: message });
  }
});

app.delete('/api/health/:id', async (req, res) => {
  const { error } = await supabase
    .from('habit_logs') // Delete from habit_logs
    .delete()
    .eq('id', req.params.id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Vite Middleware for Development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
