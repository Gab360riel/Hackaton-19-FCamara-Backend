module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('schedulings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUptade: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      office: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      canceled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    queryInterface.dropTable('schedulings');
  },
};
