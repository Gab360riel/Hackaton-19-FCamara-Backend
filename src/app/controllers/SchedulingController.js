import * as Yup from 'yup';
import { endOfDay, format, isBefore, parseISO, subHours } from 'date-fns';
import User from '../models/user';
import Scheduling from '../models/Scheduling';

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

  async listTodaySchedulings(req, res) {
    const { office } = req.query;

    const current_date = format(
      endOfDay(new Date()),
      "yyyy-MM-dd'T'08:00:00'.000Z'"
    );

    const scheduling = await Scheduling.findAll({
      where: { date: current_date, office, canceled_at: null },
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

  async store(req, res) {
    const schema = Yup.object().shape({
      office: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Verifique os dados inseridos' });
    }

    const { office, date } = req.body;

    const schedule = parseISO(date);

    if (isBefore(schedule, new Date())) {
      return res.status(400).json({
        error: 'Não é possível agendar para datas anteriores a atual',
      });
    }

    const scheduling = await Scheduling.create({
      user_id: req.userId,
      office,
      date,
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

    if (scheduling.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Você não tem permissão para excluir esse agendamento',
      });
    }

    const dateWithSub = subHours(scheduling.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error:
          'O agendamento só pode ser desmarcado com 2 horas de antecedência',
      });
    }

    scheduling.canceled_at = new Date();

    await scheduling.save();

    return res.json(scheduling);
  }
}

export default new SchedulingController();
