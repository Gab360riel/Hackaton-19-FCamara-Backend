import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import SchedulingController from './app/controllers/SchedulingController';

const routes = new Router();

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/scheduling', SchedulingController.index);
routes.get(
  '/scheduling/todaySchedulings',
  SchedulingController.listTodaySchedulings
);
routes.post('/scheduling', SchedulingController.store);
routes.delete('/scheduling/:id', SchedulingController.delete);

export default routes;
