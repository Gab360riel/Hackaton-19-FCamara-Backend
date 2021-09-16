"use strict";Object.defineProperty(exports, "__esModule", {value: true});exports. default = {
  service: 'Gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Equipe FCalendar <noreply@fcalendar.com>',
  },
};
