import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const taskRouter = Router();
const taskController = new TaskController();

taskRouter.post('/', taskController.createTask);
taskRouter.get('/', taskController.getAllTasks);
taskRouter.get('/:id', taskController.getTaskById);
taskRouter.patch('/:id', taskController.updateTask);
taskRouter.delete('/:id', taskController.deleteTask);

export default taskRouter;
