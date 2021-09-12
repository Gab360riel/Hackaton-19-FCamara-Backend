import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Scheduling extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        office: Sequelize.INTEGER,
        sector: Sequelize.INTEGER,
        seat: Sequelize.INTEGER,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 4));
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

export default Scheduling;
