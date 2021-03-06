import * as Yup from 'yup';
import { format, isBefore, parseISO, subHours } from 'date-fns';
import User from '../models/user';
import Scheduling from '../models/Scheduling';

import Mail from '../../lib/Mail';

class SchedulingController {
  async index(req, res) {
    const { office } = req.query;

    const scheduling = await Scheduling.findAll({
      where: { office, canceled_at: null },
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listScheduleById(req, res) {
    const { id } = req.params;

    const scheduling = await Scheduling.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listAllUserSchedules(req, res) {
    const { order = 'date' } = req.query;

    const scheduling = await Scheduling.findAll({
      where: { user_id: req.userId },
      order: order === 'date' ? [[order, 'DESC']] : [[order, 'ASC']],
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listLastSchedules(req, res) {
    const { order = 'date' } = req.query;

    const scheduling = await Scheduling.findAll({
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
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listUserSchedules(req, res) {
    const { page = 1, order = 'date' } = req.query;

    const scheduling = await Scheduling.findAll({
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
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(scheduling);
  }

  async listTodaySchedulings(req, res) {
    const { office, date } = req.query;

    const current_date = format(parseISO(date), "yyyy-MM-dd'T'11:00:00'.000Z'");

    const scheduling = await Scheduling.findAll({
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
          model: User,
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
    const selected_date = format(parseISO(data), 'dd-MM-yyyy');

    const user = await User.findByPk(req.userId, {
      attributes: ['name', 'email'],
    });

    const schedulingExists = await Scheduling.findOne({
      where: { date: data, office, sector, seat, canceled_at: null },
    });

    const userSchedulingExists = await Scheduling.findOne({
      where: { date: data, user_id: req.userId, canceled_at: null },
    });

    const allSchedulings = await Scheduling.findAll({
      where: { date: data, office, canceled_at: null },
    });

    if (
      (office === 1 && allSchedulings.length === 4) ||
      (office === 2 && allSchedulings.length === 40)
    ) {
      return res
        .status(400)
        .json({ error: 'A lota????o m??xima di??ria foi atingida!' });
    }

    if (userSchedulingExists) {
      return res
        .status(400)
        .json({ error: 'Voc?? j?? marcou uma visita ?? empresa para esse dia' });
    }

    if (schedulingExists) {
      return res.status(400).json({ error: 'O lugar escolhido est?? ocupado!' });
    }

    const schedule = parseISO(date);

    if (isBefore(schedule, new Date())) {
      return res.status(400).json({
        error: 'N??o ?? poss??vel agendar para datas anteriores a atual',
      });
    }

    const scheduling = await Scheduling.create({
      user_id: req.userId,
      office,
      date: data,
      sector,
      seat,
    });

    Mail.sendMail({
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
    const scheduling = await Scheduling.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    const selected_date = format(scheduling.date, 'dd-MM-yyyy');

    const user = await User.findByPk(req.userId, {
      attributes: ['name', 'email'],
    });

    if (scheduling.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Voc?? n??o tem permiss??o para excluir esse agendamento',
      });
    }

    const dateWithSub = subHours(scheduling.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error:
          'O agendamento s?? pode ser desmarcado com 2 horas de anteced??ncia',
      });
    }

    scheduling.canceled_at = new Date();
    await scheduling.save();

    Mail.sendMail({
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

export default new SchedulingController();
