'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      business_name: {
        type: Sequelize.STRING(255),
      },
      email: {
        type: Sequelize.STRING(255),
      },
      invite_token: {
        type: Sequelize.STRING(64),
        unique: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      invite_sent_at: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('client_forms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      form_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'onboarding',
      },
      data: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('client_forms', ['client_id', 'form_type'], {
      unique: true,
    });

    await queryInterface.createTable('client_documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      document_type: {
        type: Sequelize.STRING(100),
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(255),
      },
      file_url: {
        type: Sequelize.STRING(1024),
      },
      file_size: {
        type: Sequelize.INTEGER,
      },
      storage_provider: {
        type: Sequelize.STRING(50),
        defaultValue: 'local',
      },
      public_id: {
        type: Sequelize.STRING(255),
      },
      resource_type: {
        type: Sequelize.STRING(20),
        defaultValue: 'auto',
      },
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('clients', ['invite_token']);
    await queryInterface.addIndex('client_forms', ['client_id']);
    await queryInterface.addIndex('client_documents', ['client_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('client_documents');
    await queryInterface.dropTable('client_forms');
    await queryInterface.dropTable('clients');
  },
};
