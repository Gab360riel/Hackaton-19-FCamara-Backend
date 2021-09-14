import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/user';

import Mail from '../../lib/Mail';

import authentConfig from '../../config/auth';

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

  async forgotPassword_1(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Verifique novamente as informações inseridas!',
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    const { id } = user;

    if (!user) {
      return res.json({ error: 'O usuário não existe' });
    }

    const token = jwt.sign({ id }, authentConfig.secret, {
      expiresIn: authentConfig.expiresIn,
    });

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Alteração de Senha!',
      template: 'forgotPassword',
      context: {
        user: user.name,
        token,
      },
    });

    return res.status(200).json({
      user,
      token,
    });
  }

  async forgotPassword_2(req, res) {
    const schema = Yup.object().shape({
      password: Yup.string().required().min(4),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Verifique novamente as informações inseridas!',
      });
    }

    const { password } = req.body;

    const id = req.userId;

    const user = await User.findByPk(id);

    if (!user) {
      return res.json({ error: 'O usuário não existe' });
    }

    if (password && (await user.checkPassword(password))) {
      return res
        .status(401)
        .json({ error: 'A senha cadastrada é igual a que inseriu' });
    }

    await user.update(req.body);

    return res.status(200).json({ message: 'Sua nova senha está cadastrada' });
  }
}

export default new UserController();
