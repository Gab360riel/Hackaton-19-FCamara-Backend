Object.defineProperty(exports, '__esModule', { value: true });
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const _nodemailer = require('nodemailer');

const _nodemailer2 = _interopRequireDefault(_nodemailer);
const _path = require('path');
const _expresshandlebars = require('express-handlebars');

const _expresshandlebars2 = _interopRequireDefault(_expresshandlebars);
const _nodemailerexpresshandlebars = require('nodemailer-express-handlebars');

const _nodemailerexpresshandlebars2 = _interopRequireDefault(
  _nodemailerexpresshandlebars
);
const _mail = require('../config/mail');

const _mail2 = _interopRequireDefault(_mail);

class Mail {
  constructor() {
    const { service, secure, auth } = _mail2.default;

    this.transporter = _nodemailer2.default.createTransport({
      service,
      secure,
      auth: auth.user ? auth : null,
    });

    this.configureTemplates();
  }

  configureTemplates() {
    const viewPath = _path.resolve.call(
      void 0,
      __dirname,
      '..',
      'app',
      'views',
      'emails'
    );

    this.transporter.use(
      'compile',
      _nodemailerexpresshandlebars2.default.call(void 0, {
        viewEngine: _expresshandlebars2.default.create({
          layoutsDir: _path.resolve.call(void 0, viewPath, 'layouts'),
          partialsDir: _path.resolve.call(void 0, viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ..._mail2.default.default,
      ...message,
    });
  }
}

exports.default = new Mail();
