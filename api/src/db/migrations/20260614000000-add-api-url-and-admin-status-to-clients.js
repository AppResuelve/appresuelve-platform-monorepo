'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'api_url', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'admin_status', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'pending',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'admin_status');
    await queryInterface.removeColumn('clients', 'api_url');
  },
};
