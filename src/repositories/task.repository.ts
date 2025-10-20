import { PrismaClient, Task } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { type Logger } from 'pino';

export class TaskRepository {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.prisma = new PrismaClient();
    this.logger = logger.child({ context: 'TaskRepository' });
  }

  public async createTask(
    userId: string,
    data: CreateTaskInput
  ): Promise<Task> {
    this.logger.info({ userId, data }, 'Creating task');
    const { title, description } = data; // Destructure to ensure types are correct
    return this.prisma.task.create({
      data: {
        title,
        description,
        userId,
      },
    });
  }

  public async findTaskById(
    userId: string,
    taskId: string
  ): Promise<Task | null> {
    this.logger.info({ userId, taskId }, 'Finding task by id');
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });
  }

  public async findTasksByUserId(userId: string): Promise<Task[]> {
    this.logger.info({ userId }, 'Finding tasks by user id');
    return this.prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async findByTitleAndDescription(
    userId: string,
    title: string,
    description: string
  ): Promise<Task | null> {
    this.logger.info(
      { userId, title, description },
      'Finding task by title and description'
    );
    return this.prisma.task.findFirst({
      where: {
        userId,
        title,
        description,
      },
    });
  }

  public async updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskInput
  ): Promise<Task | null> {
    this.logger.info({ userId, taskId, data }, 'Updating task');
    try {
      return await this.prisma.task.update({
        where: {
          id: taskId,
          userId,
        },
        data: data,
      });
      /* istanbul ignore next */
    } catch (error) {
      this.logger.error({ error }, 'Error updating task');
      // Prisma's P2025 error code indicates record to update not found
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  public async deleteTask(
    userId: string,
    taskId: string
  ): Promise<Task | null> {
    this.logger.info({ userId, taskId }, 'Deleting task');
    try {
      return await this.prisma.task.delete({
        where: {
          id: taskId,
          userId,
        },
      });
      /* istanbul ignore next */
    } catch (error) {
      this.logger.error({ error }, 'Error deleting task');
      // Prisma's P2025 error code indicates record to delete not found
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }
}
