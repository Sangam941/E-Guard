import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './config/database.js';
import corsMiddleware from './middleware/cors.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import sosRoutes from './routes/sos.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contacts.js';
import alertRoutes from './routes/alerts.js';
import fakeCallRoutes from './routes/fake-call.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// API Routes
app.use('/api/sos', sosRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/fake-call', fakeCallRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
