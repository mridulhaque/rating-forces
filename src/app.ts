import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import codeforcesRoutes from './routes/codeforcesRoutes';
import logger, { requestLogger, errorLogger } from './services/loggerService';


const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running');
});

// Codeforces routes
app.use('/api/codeforces', codeforcesRoutes);

// Error logging
app.use(errorLogger);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
  logger.info(`📚 Swagger documentation available at http://localhost:${port}/api-docs`);
});

export default app;