import { Task } from '@prisma/client';
import { TaskRepository } from '../repositories/task.repository';
import { ConflictError } from '../errors/conflict.error';
import { BadRequestError } from '../errors/bad-request.error';

import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { type Logger } from 'pino';

export class TaskService {
  private taskRepository: TaskRepository;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ context: 'TaskService' });
    this.taskRepository = new TaskRepository(this.logger);
  }

  public async createTask(
    userId: string,
    data: CreateTaskInput
  ): Promise<Task> {
    this.logger.info({ userId, data }, 'Creating task');
    const trimmedData = {
      ...data,
      title: data.title.trim(),
    };

    // Check for existing task with same title and description for the user
    const existingTask = await this.taskRepository.findByTitleAndDescription(
      userId,
      trimmedData.title,
      trimmedData.description
    );

    if (existingTask) {
      this.logger.warn({ userId, data }, 'Task already exists');
      throw new ConflictError(
        'A task with the same title and description already exists for this user.'
      );
    }

    return this.taskRepository.createTask(userId, trimmedData);
  }

  public async getTaskById(
    userId: string,
    taskId: string
  ): Promise<Task | null> {
    this.logger.info({ userId, taskId }, 'Getting task by id');
    return this.taskRepository.findTaskById(userId, taskId);
  }

  public async getAllTasks(userId: string): Promise<Task[]> {
    this.logger.info({ userId }, 'Getting all tasks for user');
    return this.taskRepository.findTasksByUserId(userId);
  }

  public async updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskInput
  ): Promise<Task | null> {
    this.logger.info({ userId, taskId, data }, 'Updating task');
    const currentTask = await this.taskRepository.findTaskById(userId, taskId);
    if (!currentTask) {
      return null;
    }

    if (data.status && data.status !== currentTask.status) {
      const allowedTransitions: Record<string, string[]> = {
        todo: ['in_progress', 'done', 'archived'],
        in_progress: ['todo', 'done', 'archived'],
        done: ['todo', 'archived'],
        archived: ['todo'],
      };

      const currentStatus = currentTask.status;
      const requestedStatus = data.status;

      if (!allowedTransitions[currentStatus]!.includes(requestedStatus)) {
        this.logger.warn(
          { userId, taskId, currentStatus, requestedStatus },
          'Invalid status transition'
        );
        throw new BadRequestError(
          `Invalid status transition from '${currentStatus}' to '${requestedStatus}'.`
        );
      }
    }

    return this.taskRepository.updateTask(userId, taskId, data);
  }

  public async deleteTask(
    userId: string,
    taskId: string
  ): Promise<Task | null> {
    this.logger.info({ userId, taskId }, 'Deleting task');
    return this.taskRepository.deleteTask(userId, taskId);
  }
}
