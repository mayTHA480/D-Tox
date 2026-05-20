const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

module.exports = app;
