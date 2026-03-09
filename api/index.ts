import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on the environment (if mostly local)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Create robust checking but allow the server to start to show missing env variables gracefully
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

app.use(cors());
app.use(express.json());

// Helper middleware for auth
const checkSupabase = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase credentials are not configured in the backend.' });
  }
  next();
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabaseConfigured: !!supabase });
});

// AUTH ENDPOINTS

app.post('/api/auth/register', checkSupabase, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const { data: existingUser } = await supabase!.from('users').select('id').eq('username', username).single();
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const { data, error } = await supabase!.from('users').insert([{ username, password: hashedPassword }]).select().single();
    
    if (error) throw error;
    res.status(201).json({ user: { id: data.id, username: data.username } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', checkSupabase, async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const { data: user, error } = await supabase!.from('users').select('*').eq('username', username).single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // In a real app we would use JWT. Here we return the user details.
    res.json({ user: { id: user.id, username: user.username } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PROFILE ENDPOINTS

// Middleware to get user_id from headers for simple auth simulation
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: missing x-user-id header' });
  }
  // @ts-ignore
  req.userId = userId;
  next();
};

app.get('/api/profile', checkSupabase, requireAuth, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { data, error } = await supabase!.from('profiles').select('*').eq('user_id', userId).single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is not found, we can return empty profile
      throw error;
    }
    
    res.json({ profile: data || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', checkSupabase, requireAuth, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const profileData = req.body;
    
    const { data: existingProfile } = await supabase!.from('profiles').select('user_id').eq('user_id', userId).single();

    let result;
    if (existingProfile) {
      result = await supabase!.from('profiles').update(profileData).eq('user_id', userId).select().single();
    } else {
      result = await supabase!.from('profiles').insert([{ ...profileData, user_id: userId }]).select().single();
    }
    
    if (result.error) throw result.error;
    res.json({ profile: result.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DAILY LOGS ENDPOINTS

app.get('/api/logs', checkSupabase, requireAuth, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const { data, error } = await supabase!.from('daily_logs').select('*').eq('user_id', userId);
    
    if (error) throw error;
    res.json({ logs: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs', checkSupabase, requireAuth, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const logData = req.body; // Needs to include date, mood, etc.
    
    if (!logData.date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const { data: existingLog } = await supabase!.from('daily_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', logData.date)
      .single();

    let result;
    if (existingLog) {
      result = await supabase!.from('daily_logs').update(logData).eq('id', existingLog.id).select().single();
    } else {
      result = await supabase!.from('daily_logs').insert([{ ...logData, user_id: userId }]).select().single();
    }
    
    if (result.error) throw result.error;
    res.json({ log: result.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// For local development, listen on a port.
// In Vercel, the function is executed directly, so we export the app instead.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
