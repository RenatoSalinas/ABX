import express from 'express';
import cookieParser from 'cookie-parser';
import { requireAuth } from './auth.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import clientsRoutes from './routes/clients.js';
import opportunitiesRoutes from './routes/opportunities.js';
import eventTypesRoutes from './routes/event-types.js';
import statsRoutes from './routes/stats.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', requireAuth, usersRoutes);
app.use('/api/clients', requireAuth, clientsRoutes);
app.use('/api/opportunities', requireAuth, opportunitiesRoutes);
app.use('/api/event-types', requireAuth, eventTypesRoutes);
app.use('/api/stats', requireAuth, statsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`API escuchando en puerto ${port}`));
