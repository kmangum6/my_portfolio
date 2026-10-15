import express from 'express';
import db from './db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON request bodies
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Quick check that the server and database are working
app.get('/api/health', (req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS users FROM user').get();
  res.json({ ok: true, users: row.users });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});