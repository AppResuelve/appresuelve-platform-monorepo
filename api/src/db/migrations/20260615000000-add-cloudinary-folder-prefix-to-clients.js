'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'cloudinary_folder_prefix', {
      type: Sequelize.STRING(64),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'cloudinary_folder_prefix');
  },
};
