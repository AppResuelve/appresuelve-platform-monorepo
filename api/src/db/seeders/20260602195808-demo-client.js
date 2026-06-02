'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'clients',
      [
        {
          business_name: 'Demo Shop',
          email: 'demo@example.com',
          invite_token: 'demo-token-1234',
          status: 'onboarding',
          created_at: new Date(),
          invite_sent_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'clients',
      { invite_token: 'demo-token-1234' },
      {}
    );
  },
};
