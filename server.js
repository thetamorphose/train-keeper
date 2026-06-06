import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { JSONFilePreset } from 'lowdb/node';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const DB_FILE = 'history.json';

// Initialize lowdb
const defaultData = { history: [] };
const db = await JSONFilePreset(DB_FILE, defaultData);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Train Keeper - Фокус.html'));
});

// API Routes
app.get('/api/history', (req, res) => {
  res.json(db.data.history);
});

app.post('/api/history', async (req, res) => {
  const workout = req.body;
  db.data.history.unshift(workout);
  await db.write();
  res.status(201).json({ success: true });
});

// Helper to get local IP
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

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('--------------------------------------------------');
  console.log(`Train Keeper Server is running!`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Mobile access: http://${localIP}:${PORT}`);
  console.log('--------------------------------------------------');
});
