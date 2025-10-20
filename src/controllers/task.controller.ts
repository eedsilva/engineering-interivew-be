import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { ZodError } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { BadRequestError } from '../errors/bad-request.error';
import { type Logger } from 'pino';

export class TaskController {
  private taskService: TaskService;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ context: 'TaskController' });
    this.taskService = new TaskService(this.logger);
  }

  public createTask = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      this.logger.info({ body: req.body }, 'Handling create task request');
      try {
        const taskData = createTaskSchema.parse(req.body);
        // We can safely use the non-null assertion (!) because the userAuthMiddleware guarantees req.userId exists.
        const task = await this.taskService.createTask(req.userId!, taskData);
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

      if (!req.params.id) {
        throw new BadRequestError(
          'A task ID must be provided in the URL path.'
        );
      }

      const task = await this.taskService.getTaskById(
        req.userId!,
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
      const tasks = await this.taskService.getAllTasks(req.userId!);
      res.status(200).json(tasks);
    }
  );

  public updateTask = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      this.logger.info(
        { params: req.params, body: req.body },
        'Handling update task request'
      );
      if (!req.params.id) {
        throw new BadRequestError(
          'A task ID must be provided in the URL path.'
        );
      }
      try {
        const taskData = updateTaskSchema.parse(req.body);
        const task = await this.taskService.updateTask(
          req.userId!,
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
      if (!req.params.id) {
        throw new BadRequestError(
          'A task ID must be provided in the URL path.'
        );
      }

      const task = await this.taskService.deleteTask(
        req.userId!,
        req.params.id
      );
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
