import express from 'express';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';

import swaggerDocs from './swagger.json';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
