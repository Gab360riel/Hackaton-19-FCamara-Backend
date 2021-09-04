import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authentConfig from '../../config/auth';

export default async (req, res, next) => {
  const authent = req.headers.authorization;

  if (!authent) {
    return res.status(401).json({ error: 'Token não validado' });
  }

  const [, token] = authent.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authentConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Erro na autenticação' });
  }
};
