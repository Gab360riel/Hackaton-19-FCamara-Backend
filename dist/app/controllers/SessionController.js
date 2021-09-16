"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);

var _user = require('../models/user'); var _user2 = _interopRequireDefault(_user);
var _auth = require('../../config/auth'); var _auth2 = _interopRequireDefault(_auth);

class SessionController {
  async index(req, res) {
    const user = await _user2.default.findOne({ where: { id: req.userId } });

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

    const user = await _user2.default.findOne({ where: { email } });

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
      token: _jsonwebtoken2.default.sign({ id }, _auth2.default.secret, {
        expiresIn: _auth2.default.expiresIn,
      }),
    });
  }
}

exports. default = new SessionController();
