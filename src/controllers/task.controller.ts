import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { ZodError } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { HttpError } from '../errors/http-error';
import { BadRequestError } from '../errors/bad-request.error';
import { type Logger } from 'pino';

export class TaskController {
  private taskService: TaskService;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ context: 'TaskController' });
    this.taskService = new TaskService(this.logger);
  }

  // NOTE: The `if (!req.userId)` check is repeated in each controller method.
  // This is a deliberate choice for two reasons:
  // 1. Defensive Programming: It acts as a safeguard to ensure that if the `userAuthMiddleware`
  //    is ever accidentally omitted from a route, the request fails immediately with a 500 error,
  //    indicating a server-side configuration issue.
  // 2. TypeScript Type Guard: It proves to the TypeScript compiler that `req.userId` is a non-null
  //    string for the remainder of the function's scope, preventing potential type errors.
  public createTask = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      this.logger.info({ body: req.body }, 'Handling create task request');
      if (!req.userId) {
        throw new HttpError(
          500,
          'https://example.com/probs/internal-server-error',
          'Internal Server Error',
          'User ID missing from request after auth middleware.'
        );
      }
      try {
        const taskData = createTaskSchema.parse(req.body);
        const task = await this.taskService.createTask(req.userId, taskData);
        res.status(201).json(task);
      } catch (error) {
        this.logger.error({ error }, 'Error creating task');
        if (error instanceof ZodError) {
          throw new ValidationError(error);
        }
        throw error;
      }
    }
  );

  public getTaskById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      this.logger.info(
        { params: req.params },
        'Handling get task by id request'
      );
      if (!req.userId) {
        throw new HttpError(
          500,
          'https://example.com/probs/internal-server-error',
          'Internal Server Error',
          'User ID missing from request after auth middleware.'
        );
      }

      if (!req.params.id) {
        throw new BadRequestError(
          'A task ID must be provided in the URL path.'
        );
      }

      const task = await this.taskService.getTaskById(
        req.userId,
        req.params.id
      );
      if (!task) {
        this.logger.warn({ taskId: req.params.id }, 'Task not found');
        throw new NotFoundError('Task not found');
      }
      res.status(200).json(task);
    }
  );

  public getAllTasks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      this.logger.info('Handling get all tasks request');
      if (!req.userId) {
        throw new HttpError(
          500,
          'https://example.com/probs/internal-server-error',
          'Internal Server Error',
          'User ID missing from request after auth middleware.'
        );
      }
      const tasks = await this.taskService.getAllTasks(req.userId);
      res.status(200).json(tasks);
    }
  );

  public updateTask = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      this.logger.info(
        { params: req.params, body: req.body },
        'Handling update task request'
      );
      if (!req.userId) {
        throw new HttpError(
          500,
          'https://example.com/probs/internal-server-error',
          'Internal Server Error',
          'User ID missing from request after auth middleware.'
        );
      }
      if (!req.params.id) {
        throw new BadRequestError(
          'A task ID must be provided in the URL path.'
        );
      }
      try {
        const taskData = updateTaskSchema.parse(req.body);
        const task = await this.taskService.updateTask(
          req.userId,
          req.params.id,
          taskData
        );
        if (!task) {
          this.logger.warn(
            { taskId: req.params.id },
            'Task not found for update'
          );
          throw new NotFoundError('Task not found');
        }
        res.status(200).json(task);
      } catch (error) {
        this.logger.error({ error }, 'Error updating task');
        if (error instanceof ZodError) {
          throw new ValidationError(error);
        }
        throw error;
      }
    }
  );

  public deleteTask = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      this.logger.info({ params: req.params }, 'Handling delete task request');
      if (!req.userId) {
        throw new HttpError(
          500,
          'https://example.com/probs/internal-server-error',
          'Internal Server Error',
          'User ID missing from request after auth middleware.'
        );
      }

      if (!req.params.id) {
        throw new BadRequestError(
          'A task ID must be provided in the URL path.'
        );
      }

      const task = await this.taskService.deleteTask(req.userId, req.params.id);
      if (!task) {
        this.logger.warn(
          { taskId: req.params.id },
          'Task not found for deletion'
        );
        throw new NotFoundError('Task not found');
      }

      res.status(204).send();
    }
  );
}
