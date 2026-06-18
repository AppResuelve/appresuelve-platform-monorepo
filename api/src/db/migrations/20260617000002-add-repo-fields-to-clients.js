'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'git_repo', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'backend_repo', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'frontend_repo', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'phone', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'domain', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'git_repo');
    await queryInterface.removeColumn('clients', 'backend_repo');
    await queryInterface.removeColumn('clients', 'frontend_repo');
    await queryInterface.removeColumn('clients', 'phone');
    await queryInterface.removeColumn('clients', 'description');
    await queryInterface.removeColumn('clients', 'domain');
    await queryInterface.removeColumn('clients', 'notes');
  },
};
