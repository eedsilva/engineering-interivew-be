import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // This is to prevent the process from hanging
  await prisma.$disconnect();
});
