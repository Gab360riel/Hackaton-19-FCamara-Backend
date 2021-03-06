import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/user';
import authentConfig from '../../config/auth';

class SessionController {
  async index(req, res) {
    const user = await User.findOne({ where: { id: req.userId } });

    if (!user) {
      return res.status(401).json({ error: 'O usuário não foi encontrado' });
    }

    const { id, name, email } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'A validação falhou, verifique os dados inseridos' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'O usuário não foi encontrado' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'A senha inserida está incorreta' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authentConfig.secret, {
        expiresIn: authentConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
