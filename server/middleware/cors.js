import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
