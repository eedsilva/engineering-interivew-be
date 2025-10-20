import { PrismaClient, Task } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class TaskRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async createTask(
    userId: string,
    data: CreateTaskInput
  ): Promise<Task> {
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
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });
  }

  public async findTasksByUserId(userId: string): Promise<Task[]> {
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
    try {
      return await this.prisma.task.update({
        where: {
          id: taskId,
          userId,
        },
        data: data,
      });
    } catch (error) {
      // Prisma's P2025 error code indicates record to update not found
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  public async deleteTask(
    userId: string,
    taskId: string
  ): Promise<Task | null> {
    try {
      return await this.prisma.task.delete({
        where: {
          id: taskId,
          userId,
        },
      });
    } catch (error) {
      // Prisma's P2025 error code indicates record to delete not found
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
}
