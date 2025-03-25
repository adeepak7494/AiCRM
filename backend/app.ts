import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import DatabaseConnection from './config/database';
import userRoutes from './routes/user.routes';
import leadRoutes from './routes/lead.routes';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
DatabaseConnection.connect();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await DatabaseConnection.disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});