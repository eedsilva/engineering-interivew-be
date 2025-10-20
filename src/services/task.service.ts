import { Task } from '@prisma/client';
import { TaskRepository } from '../repositories/task.repository';
import { ConflictError } from '../errors/conflict.error';
import { BadRequestError } from '../errors/bad-request.error';

import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  public async createTask(
    userId: string,
    data: CreateTaskInput
  ): Promise<Task> {
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
    return this.taskRepository.findTaskById(userId, taskId);
  }

  public async getAllTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findTasksByUserId(userId);
  }

  public async updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskInput
  ): Promise<Task | null> {
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
    return this.taskRepository.deleteTask(userId, taskId);
  }
}
