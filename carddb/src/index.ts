import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import cards from './routes/cards.js';
import regions from './routes/regions.js';
import stats from './routes/stats.js';
import loadouts from './routes/loadouts.js';
import { getAllTags } from './search.js';

const app = new Hono();

const isProd = process.env.NODE_ENV === 'production';

app.use('*', cors({
  origin: isProd
    ? [process.env.FRONTEND_URL || '*']
    : ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.route('/api/cards', cards);
app.route('/api/regions', regions);
app.route('/api/stats', stats);
app.route('/api/loadouts', loadouts);

// Tags endpoint
app.get('/api/tags', (c) => c.json(getAllTags()));

// Serve built React frontend in production
if (isProd) {
  app.use('*', serveStatic({ root: './public' }));
  app.get('*', serveStatic({ path: './public/index.html' }));
}

const port = parseInt(process.env.PORT || '3001');
console.log(`Beltway Realms Card DB API running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
