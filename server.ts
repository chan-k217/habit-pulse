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
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

app.use(express.json());

// API Routes
app.get('/api/habits', async (req, res) => {
  const { userId } = req.query;
  let query = supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/habits', async (req, res) => {
  const { data, error } = await supabase
    .from('habits')
    .insert([req.body])
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/habits/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('habits')
    .update(req.body)
    .eq('id', id)
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/habits/:id', async (req, res) => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', req.params.id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get('/api/logs', async (req, res) => {
  const { userId } = req.query;
  let query = supabase
    .from('habit_logs')
    .select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/logs', async (req, res) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .insert([req.body])
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/logs/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('habit_logs')
    .update(req.body)
    .eq('id', id)
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/logs/:id', async (req, res) => {
  const { error } = await supabase
    .from('habit_logs')
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
