import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { type Logger } from 'pino';

export const createTaskRouter = (logger: Logger): Router => {
  const taskRouter = Router();
  const taskController = new TaskController(logger);

  taskRouter.post('/', taskController.createTask);
  taskRouter.get('/', taskController.getAllTasks);
  taskRouter.get('/:id', taskController.getTaskById);
  taskRouter.patch('/:id', taskController.updateTask);
  taskRouter.delete('/:id', taskController.deleteTask);

  return taskRouter;
};
