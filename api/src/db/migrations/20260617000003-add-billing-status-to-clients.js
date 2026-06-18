'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Renombrar status → onboarding_status
    await queryInterface.renameColumn('clients', 'status', 'onboarding_status');

    // Agregar columnas billing
    await queryInterface.addColumn('clients', 'billing_status', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'pending_activation',
    });

    await queryInterface.addColumn('clients', 'billing_day', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'current_period_start', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'current_period_end', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'grace_days', {
      type: Sequelize.INTEGER,
      defaultValue: 7,
    });

    await queryInterface.addColumn('clients', 'grace_until', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'suspended_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'last_billing_cron_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('clients', 'onboarding_status', 'status');

    await queryInterface.removeColumn('clients', 'billing_status');
    await queryInterface.removeColumn('clients', 'billing_day');
    await queryInterface.removeColumn('clients', 'current_period_start');
    await queryInterface.removeColumn('clients', 'current_period_end');
    await queryInterface.removeColumn('clients', 'grace_days');
    await queryInterface.removeColumn('clients', 'grace_until');
    await queryInterface.removeColumn('clients', 'suspended_at');
    await queryInterface.removeColumn('clients', 'cancelled_at');
    await queryInterface.removeColumn('clients', 'last_billing_cron_at');
  },
};
