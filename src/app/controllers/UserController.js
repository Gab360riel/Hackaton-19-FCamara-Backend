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

  async forgotPassword(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().required(),
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

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

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
