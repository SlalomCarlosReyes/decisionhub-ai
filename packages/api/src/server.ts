import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { corsOptions } from './middleware/cors';
import { AIProviderFactory } from './services/ai';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Initialize AI Provider
AIProviderFactory.initialize().catch(err => {
  console.error('[Server] Failed to initialize AI provider:', err);
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api', routes);

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  const aiMode = AIProviderFactory.isRealAI() ? 'Real AI' : 'Mock AI';
  console.log(`
╔════════════════════════════════════════╗
║   DecisionHub AI - API Server         ║
║   Running on: http://localhost:${PORT}   ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   AI Provider: ${aiMode.padEnd(24)}║
╚════════════════════════════════════════╝
  `);
});

export default app;
