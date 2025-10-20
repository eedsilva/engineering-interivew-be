import express, { Application, Request, Response, Router } from 'express';
import pino from 'pino-http';
import helmet from 'helmet';
import cors from 'cors';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { userAuthMiddleware } from './middleware/auth';
import taskRouter from './routes/task.router';
import { errorHandler } from './middleware/error.handler';
import { requestIdMiddleware } from './middleware/request-id';
import { metricsMiddleware } from './middleware/metrics';
import { register } from './utils/metrics';
import { config } from './config';

export class App {
  private app: Application;
  private server: HttpServer | null = null;
  private readonly port: number;
  private prisma: PrismaClient;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    this.prisma = new PrismaClient();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware() {
    this.app.use(requestIdMiddleware);
    this.app.use(metricsMiddleware);
    this.app.use(express.json());
    this.app.use(
      pino({
        // Set default level to 'warn'
        level: config.LOG_LEVEL,
        customProps: (req, res) => ({
          requestId: req.requestId,
        }),
        customLogLevel: function (req, res, err) {
          if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
          } else if (res.statusCode >= 500 || err) {
            return 'error';
          }
          return 'info'; // Will be filtered out by the 'warn' level
        },
      })
    );
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200,
      })
    );
  }

  private initializeRoutes() {
    this.app.get('/', (req: Request, _res: Response) => {
      _res.send('API is running!');
    });

    // Observability endpoints
    this.app.get('/healthz', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'ok' });
    });

    this.app.get('/readyz', async (req: Request, res: Response) => {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ready' });
      } catch (_e) {
        res.status(503).json({ status: 'not ready' });
      }
    });

    this.app.get('/metrics', async (req: Request, res: Response) => {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    });

    const v1Router = Router();
    v1Router.use(userAuthMiddleware);

    // Mount the task router
    v1Router.use('/tasks', taskRouter);

    this.app.use('/api/v1', v1Router);
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public async start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }

  public get expressApp(): Application {
    return this.app;
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(async (err) => {
        if (err) {
          return reject(err);
        }
        try {
          await this.prisma.$disconnect();
          console.log('Database connection closed.');
          resolve();
        } catch (dbErr) {
          console.error('Error closing database connection:', dbErr);
          reject(dbErr);
        }
      });
    });
  }
}
