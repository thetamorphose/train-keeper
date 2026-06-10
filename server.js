import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { JSONFilePreset } from 'lowdb/node';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// Environment-based database selection
const env = process.env.NODE_ENV || 'production';
const DB_FILE = env === 'test' 
  ? 'history.test.json' 
  : (env === 'development' ? 'history.dev.json' : 'history.json');

/**
 * Initialize lowdb for history persistence
 */
const defaultData = { history: [], templates: [] };
const db = await JSONFilePreset(DB_FILE, defaultData);

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/**
 * Root route - Serves the main application HTML
 * @route GET /
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Train Keeper - Фокус.html'));
});

/**
 * GET /api/history - Retrieve all workout history
 * @route GET /api/history
 * @returns {Array} List of past workout objects
 */
app.get('/api/history', (req, res) => {
  res.json(db.data.history);
});

/**
 * POST /api/history - Save a completed workout to history
 * @route POST /api/history
 * @param {Object} req.body - The completed workout data
 * @returns {Object} { success: true }
 */
app.post('/api/history', async (req, res) => {
  const workout = req.body;
  db.data.history.unshift(workout);
  await db.write();
  res.status(201).json({ success: true });
});

/**
 * GET /api/templates - Retrieve all workout templates
 */
app.get('/api/templates', (req, res) => {
  res.json(db.data.templates || []);
});

/**
 * POST /api/templates - Create a new workout template
 */
app.post('/api/templates', async (req, res) => {
  const template = {
    id: crypto.randomUUID(),
    title: req.body.title || 'Новый список',
    sections: req.body.sections || [],
    createdAt: Date.now()
  };
  db.data.templates = db.data.templates || [];
  db.data.templates.unshift(template);
  await db.write();
  res.status(201).json(template);
});

/**
 * PUT /api/templates/:id - Update an existing template
 */
app.put('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  const idx = db.data.templates.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  
  db.data.templates[idx] = { ...db.data.templates[idx], ...req.body, id };
  await db.write();
  res.json(db.data.templates[idx]);
});

/**
 * DELETE /api/templates/:id - Delete a template
 */
app.delete('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  db.data.templates = db.data.templates.filter(t => t.id !== id);
  await db.write();
  res.json({ success: true });
});

/**
 * Helper to get local IP address for mobile access
 * @returns {string} Local IPv4 address or 'localhost'
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    // Skip virtual/tun interfaces
    if (name.toLowerCase().includes('tun') || name.toLowerCase().includes('docker') || name.toLowerCase().includes('vbox')) continue;
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prefer 192.168.x.x or 10.x.x.x ranges
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          return iface.address;
        }
        candidates.push(iface.address);
      }
    }
  }
  return candidates[0] || 'localhost';
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('--------------------------------------------------');
    console.log(`Train Keeper Server is running!`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Mobile access: http://${localIP}:${PORT}`);
    console.log('--------------------------------------------------');
  });
}
