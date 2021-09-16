"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _user = require('../models/user'); var _user2 = _interopRequireDefault(_user);

var _Mail = require('../../lib/Mail'); var _Mail2 = _interopRequireDefault(_Mail);

var _auth = require('../../config/auth'); var _auth2 = _interopRequireDefault(_auth);

class UserController {
  async index(req, res) {
    const users = await _user2.default.findAll({
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

    const userExists = await _user2.default.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(401).json({ error: 'O usuário já está cadastrado' });
    }

    const { id, name, email } = await _user2.default.create(req.body);

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

    const user = await _user2.default.findOne({ where: { email } });

    const { id } = user;

    if (!user) {
      return res.json({ error: 'O usuário não existe' });
    }

    const token = _jsonwebtoken2.default.sign({ id }, _auth2.default.secret, {
      expiresIn: _auth2.default.expiresIn,
    });

    await _Mail2.default.sendMail({
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

    const user = await _user2.default.findByPk(id);

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

exports. default = new UserController();
