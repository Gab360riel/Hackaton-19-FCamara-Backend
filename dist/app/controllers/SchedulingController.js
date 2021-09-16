"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _datefns = require('date-fns');
var _user = require('../models/user'); var _user2 = _interopRequireDefault(_user);
var _Scheduling = require('../models/Scheduling'); var _Scheduling2 = _interopRequireDefault(_Scheduling);

var _Mail = require('../../lib/Mail'); var _Mail2 = _interopRequireDefault(_Mail);

class SchedulingController {
  async index(req, res) {
    const { office } = req.query;

    const scheduling = await _Scheduling2.default.findAll({
      where: { office, canceled_at: null },
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: _user2.default,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listScheduleById(req, res) {
    const { id } = req.params;

    const scheduling = await _Scheduling2.default.findByPk(id, {
      include: [
        {
          model: _user2.default,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listAllUserSchedules(req, res) {
    const { order = 'date' } = req.query;

    const scheduling = await _Scheduling2.default.findAll({
      where: { user_id: req.userId },
      order: order === 'date' ? [[order, 'DESC']] : [[order, 'ASC']],
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: _user2.default,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listLastSchedules(req, res) {
    const { order = 'date' } = req.query;

    const scheduling = await _Scheduling2.default.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: order === 'date' ? [[order, 'ASC']] : [[order, 'DESC']],
      attributes: [
        'id',
        'date',
        'past',
        'cancelable',
        'office',
        'sector',
        'seat',
      ],
      include: [
        {
          model: _user2.default,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listUserSchedules(req, res) {
    const { page = 1, order = 'date' } = req.query;

    const scheduling = await _Scheduling2.default.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: order === 'date' ? [[order, 'ASC']] : [[order, 'DESC']],
      limit: 5,
      offset: (page - 1) * 5,
      attributes: [
        'id',
        'date',
        'past',
        'cancelable',
        'office',
        'sector',
        'seat',
      ],
      include: [
        {
          model: _user2.default,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listTodaySchedulings(req, res) {
    const { office, date } = req.query;

    const current_date = _datefns.format.call(void 0, _datefns.parseISO.call(void 0, date), "yyyy-MM-dd'T'11:00:00'.000Z'");

    const scheduling = await _Scheduling2.default.findAll({
      where: { date: current_date, office, canceled_at: null },
      attributes: [
        'id',
        'date',
        'past',
        'office',
        'sector',
        'seat',
        'cancelable',
      ],
      include: [
        {
          model: _user2.default,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      office: Yup.number().required(),
      sector: Yup.number().required(),
      seat: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Verifique os dados inseridos' });
    }

    const { office, date, sector, seat } = req.body;

    const data = `${date}T08:00:00-03:00`;
    const selected_date = _datefns.format.call(void 0, _datefns.parseISO.call(void 0, data), 'dd-MM-yyyy');

    const user = await _user2.default.findByPk(req.userId, {
      attributes: ['name', 'email'],
    });

    const schedulingExists = await _Scheduling2.default.findOne({
      where: { date: data, office, sector, seat, canceled_at: null },
    });

    const userSchedulingExists = await _Scheduling2.default.findOne({
      where: { date: data, user_id: req.userId, canceled_at: null },
    });

    const allSchedulings = await _Scheduling2.default.findAll({
      where: { date: data, office, canceled_at: null },
    });

    if (
      (office === 1 && allSchedulings.length === 4) ||
      (office === 2 && allSchedulings.length === 40)
    ) {
      return res
        .status(400)
        .json({ error: 'A lotação máxima diária foi atingida!' });
    }

    if (userSchedulingExists) {
      return res
        .status(400)
        .json({ error: 'Você já marcou uma visita à empresa para esse dia' });
    }

    if (schedulingExists) {
      return res.status(400).json({ error: 'O lugar escolhido está ocupado!' });
    }

    const schedule = _datefns.parseISO.call(void 0, date);

    if (_datefns.isBefore.call(void 0, schedule, new Date())) {
      return res.status(400).json({
        error: 'Não é possível agendar para datas anteriores a atual',
      });
    }

    const scheduling = await _Scheduling2.default.create({
      user_id: req.userId,
      office,
      date: data,
      sector,
      seat,
    });

    await _Mail2.default.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Agendamento marcado com sucesso!',
      template: 'scheduling',
      context: {
        user: user.name,
        date: selected_date,
      },
    });

    return res.json(scheduling);
  }

  async delete(req, res) {
    const scheduling = await _Scheduling2.default.findByPk(req.params.id, {
      include: [
        {
          model: _user2.default,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    const selected_date = _datefns.format.call(void 0, scheduling.date, 'dd-MM-yyyy');

    const user = await _user2.default.findByPk(req.userId, {
      attributes: ['name', 'email'],
    });

    if (scheduling.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Você não tem permissão para excluir esse agendamento',
      });
    }

    const dateWithSub = _datefns.subHours.call(void 0, scheduling.date, 2);

    if (_datefns.isBefore.call(void 0, dateWithSub, new Date())) {
      return res.status(401).json({
        error:
          'O agendamento só pode ser desmarcado com 2 horas de antecedência',
      });
    }

    scheduling.canceled_at = new Date();
    await scheduling.save();

    await _Mail2.default.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Agendamento cancelado!',
      template: 'cancellation',
      context: {
        user: user.name,
        date: selected_date,
      },
    });

    return res.json(scheduling);
  }
}

exports. default = new SchedulingController();
