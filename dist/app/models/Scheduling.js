Object.defineProperty(exports, '__esModule', { value: true });
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const _sequelize = require('sequelize');

const _sequelize2 = _interopRequireDefault(_sequelize);
const _datefns = require('date-fns');

class Scheduling extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        date: _sequelize2.default.DATE,
        office: _sequelize2.default.INTEGER,
        sector: _sequelize2.default.INTEGER,
        seat: _sequelize2.default.INTEGER,
        canceled_at: _sequelize2.default.DATE,
        past: {
          type: _sequelize2.default.VIRTUAL,
          get() {
            return _datefns.isBefore.call(void 0, this.date, new Date());
          },
        },
        cancelable: {
          type: _sequelize2.default.VIRTUAL,
          get() {
            return _datefns.isBefore.call(
              void 0,
              new Date(),
              _datefns.subHours.call(void 0, this.date, 2)
            );
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

exports.default = Scheduling;
