import { App } from '../src/server';
import supertest from 'supertest';
import { PrismaClient, Task } from '@prisma/client';
import faker from 'faker';
import { execSync } from 'child_process'; // Import execSync
import dotenv from 'dotenv'; // Import dotenv
import path from 'path'; // Import path

const app = new App();
const request = supertest(app.expressApp);
const prisma = new PrismaClient();

let user1: { id: string };
let user2: { id: string };
let user1Task: Task;

describe('Tasks API', () => {
  beforeAll(async () => {
    // Load .env.test for the prisma client
    dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
    // Ensure database schema is up-to-date
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      stdio: 'inherit',
    });

    app.start();
    // Clear the tables and create fresh users for this test file
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    user1 = await prisma.user.create({ data: { id: 'test-user-1' } });
    user2 = await prisma.user.create({ data: { id: 'test-user-2' } });
  });

  beforeEach(async () => {
    // Clean up tasks before each test
    await prisma.task.deleteMany();
    // Create a task for user1 before each test
    user1Task = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'This is a test description.',
        userId: user1.id,
      },
    });
  });

  afterEach(async () => {
    // Clean up tasks after each test
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    // Clean up users
    await prisma.user.deleteMany();
    await prisma.$disconnect(); // Disconnect prisma here
    await app.stop(); // Await app.stop()
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task for the authenticated user', async () => {
      const taskData = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
      };

      const res = await request
        .post('/api/v1/tasks')
        .set('X-User-Id', user1.id)
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe(taskData.title);
      expect(res.body.userId).toBe(user1.id);
    });

    it('should return a 401 error if no user ID is provided', async () => {
      const taskData = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
      };

      const res = await request.post('/api/v1/tasks').send(taskData);

      expect(res.status).toBe(401);
    });

    it('should return a 400 error for invalid task data', async () => {
      const taskData = {
        description: faker.lorem.paragraph(),
      };

      const res = await request
        .post('/api/v1/tasks')
        .set('X-User-Id', user1.id)
        .send(taskData);

      expect(res.status).toBe(400);
      expect(res.body.title).toBe('Validation Error');
    });

    it('should return a 400 error for missing description', async () => {
      const taskData = {
        title: faker.lorem.sentence(),
      };

      const res = await request
        .post('/api/v1/tasks')
        .set('X-User-Id', user1.id)
        .send(taskData);

      expect(res.status).toBe(400);
      expect(res.body.title).toBe('Validation Error');
      expect(res.body.issues[0].message).toContain(
        'Invalid input: expected string, received undefined'
      );
    });

    it('should return a 409 conflict error if a duplicate task is created', async () => {
      const taskData = {
        title: 'A very specific title',
        description: 'A very specific description',
      };

      // Create the task for the first time
      await request
        .post('/api/v1/tasks')
        .set('X-User-Id', user1.id)
        .send(taskData)
        .expect(201);

      // Attempt to create the exact same task again
      const res = await request
        .post('/api/v1/tasks')
        .set('X-User-Id', user1.id)
        .send(taskData);

      expect(res.status).toBe(409);
      expect(res.body.title).toBe('Conflict');
    });

    it('should trim whitespace from the title on creation', async () => {
      const taskData = {
        title: '   A task with whitespace   ',
        description: faker.lorem.paragraph(),
      };

      const res = await request
        .post('/api/v1/tasks')
        .set('X-User-Id', user1.id)
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('A task with whitespace');
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return all tasks for the authenticated user', async () => {
      const res = await request.get('/api/v1/tasks').set('X-User-Id', user1.id);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(user1Task.id);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should return a single task if it belongs to the user', async () => {
      const res = await request
        .get(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user1.id);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user1Task.id);
    });

    it('should return a 404 error if the task does not belong to the user', async () => {
      const res = await request
        .get(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user2.id);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    it('should update a task if it belongs to the user', async () => {
      const updateData = { title: 'Updated Title' };
      const res = await request
        .patch(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user1.id)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updateData.title);
    });

    it('should return a 404 error if trying to update a task that does not belong to the user', async () => {
      const updateData = { title: 'Malicious Update' };
      const res = await request
        .patch(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user2.id)
        .send(updateData);

      expect(res.status).toBe(404);
    });

    it('should return a 400 error for an invalid status transition', async () => {
      // First, archive the task
      await request
        .patch(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user1.id)
        .send({ status: 'archived' })
        .expect(200);

      // Then, try to move it directly to 'in_progress'
      const res = await request
        .patch(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user1.id)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(400);
      expect(res.body.detail).toContain('Invalid status transition');
    });

    it('should return a 404 error if the task to update does not exist', async () => {
      const nonExistentTaskId = faker.datatype.uuid();
      const updateData = { title: 'A new title' };

      const res = await request
        .patch(`/api/v1/tasks/${nonExistentTaskId}`)
        .set('X-User-Id', user1.id)
        .send(updateData);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task if it belongs to the user', async () => {
      const res = await request
        .delete(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user1.id);

      expect(res.status).toBe(204);

      const foundTask = await prisma.task.findUnique({
        where: { id: user1Task.id },
      });
      expect(foundTask).toBeNull();
    });

    it('should return a 404 error if trying to delete a task that does not belong to the user', async () => {
      const res = await request
        .delete(`/api/v1/tasks/${user1Task.id}`)
        .set('X-User-Id', user2.id);

      expect(res.status).toBe(404);

      const foundTask = await prisma.task.findUnique({
        where: { id: user1Task.id },
      });
      expect(foundTask).not.toBeNull();
    });

    it('should return a 404 error if the task to delete does not exist', async () => {
      const nonExistentTaskId = faker.datatype.uuid();

      const res = await request
        .delete(`/api/v1/tasks/${nonExistentTaskId}`)
        .set('X-User-Id', user1.id);

      expect(res.status).toBe(404);
    });
  });
});
