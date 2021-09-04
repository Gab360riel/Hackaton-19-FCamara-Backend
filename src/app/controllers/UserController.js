import * as Yup from 'yup';
import User from '../models/user';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      order: ['id'],
      attributes: ['id', 'name', 'email'],
    });

    return res.json(users);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required().min(4),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Falha na criação do usuário',
      });
    }

    const userExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(401).json({ error: 'O usuário já está cadastrado' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }
}

export default new UserController();
