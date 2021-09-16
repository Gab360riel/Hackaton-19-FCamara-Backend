"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');

var _UserController = require('./app/controllers/UserController'); var _UserController2 = _interopRequireDefault(_UserController);
var _SessionController = require('./app/controllers/SessionController'); var _SessionController2 = _interopRequireDefault(_SessionController);

var _auth = require('./app/middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);
var _SchedulingController = require('./app/controllers/SchedulingController'); var _SchedulingController2 = _interopRequireDefault(_SchedulingController);

const routes = new (0, _express.Router)();

routes.get('/users', _UserController2.default.index);
routes.post('/users', _UserController2.default.store);
routes.post('/users/forgotPassword', _UserController2.default.forgotPassword_1);

routes.post('/sessions', _SessionController2.default.store);

routes.use(_auth2.default);
routes.put('/users/forgotPassword', _UserController2.default.forgotPassword_2);

routes.get('/sessions', _SessionController2.default.index);

routes.get('/scheduling', _SchedulingController2.default.index);
routes.get(
  '/scheduling/todaySchedulings',
  _SchedulingController2.default.listTodaySchedulings
);
routes.get('/scheduling/id/:id', _SchedulingController2.default.listScheduleById);
routes.get('/scheduling/all/user', _SchedulingController2.default.listAllUserSchedules);
routes.get('/scheduling/user', _SchedulingController2.default.listUserSchedules);
routes.get('/scheduling/last/user', _SchedulingController2.default.listLastSchedules);
routes.post('/scheduling', _SchedulingController2.default.store);
routes.delete('/scheduling/:id', _SchedulingController2.default.delete);

exports. default = routes;
