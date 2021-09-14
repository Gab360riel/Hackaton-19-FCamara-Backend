import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import SchedulingController from './app/controllers/SchedulingController';

const routes = new Router();

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.post('/users/forgotPassword', UserController.forgotPassword_1);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.put('/users/forgotPassword', UserController.forgotPassword_2);

routes.get('/sessions', SessionController.index);

routes.get('/scheduling', SchedulingController.index);
routes.get(
  '/scheduling/todaySchedulings',
  SchedulingController.listTodaySchedulings
);
routes.get('/scheduling/id/:id', SchedulingController.listScheduleById);
routes.get('/scheduling/user', SchedulingController.listUserSchedules);
routes.post('/scheduling', SchedulingController.store);
routes.delete('/scheduling/:id', SchedulingController.delete);

export default routes;
