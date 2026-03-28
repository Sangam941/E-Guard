import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './socket.js';
import connectDB from './config/database.js';

import authRoutes from './routes/auth.js';

import sosRoutes from './routes/sos.js';
import contactsRoutes from './routes/contacts.js';
import fakeCallRoutes from './routes/fakeCall.js';
import uploadRoutes from './routes/upload.js';
import alertsRoutes from './routes/alerts.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000','http://localhost:3001', 'http://127.0.0.1:3000', 'https://e-guard-pokm.vercel.app', 'https://e-guard-pokm-git-main-malang-code-innovators.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/fake-call', fakeCallRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Guard API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`E-Guard server running on port ${PORT}`);
});
