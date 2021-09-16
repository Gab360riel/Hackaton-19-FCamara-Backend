"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }require('dotenv/config');

var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _swaggeruiexpress = require('swagger-ui-express'); var _swaggeruiexpress2 = _interopRequireDefault(_swaggeruiexpress);
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);
var _routes = require('./routes'); var _routes2 = _interopRequireDefault(_routes);

var _swaggerjson = require('./swagger.json'); var _swaggerjson2 = _interopRequireDefault(_swaggerjson);

require('./database');

class App {
  constructor() {
    this.server = _express2.default.call(void 0, );

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(_express2.default.json());
    this.server.use('/api-docs', _swaggeruiexpress2.default.serve, _swaggeruiexpress2.default.setup(_swaggerjson2.default));
  }

  routes() {
    this.server.use(_cors2.default.call(void 0, ));
    this.server.use(_routes2.default);
  }
}

exports. default = new App().server;
