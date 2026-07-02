import { Model } from 'sequelize';
import { ONBOARDING_STATUS, ADMIN_STATUS, BILLING_STATUS, SERVICE_TYPES } from '../constants/client.js';

export default (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.hasOne(models.ClientForm, {
        foreignKey: 'client_id',
        as: 'form',
      });
      Client.hasMany(models.ClientDocument, {
        foreignKey: 'client_id',
        as: 'documents',
      });
    }
  }

  Client.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      businessName: {
        type: DataTypes.STRING(255),
        field: 'business_name',
      },
      email: {
        type: DataTypes.STRING(255),
      },
      address: {
        type: DataTypes.STRING(255),
      },
      serviceType: {
        type: DataTypes.STRING(50),
        field: 'service_type',
        validate: { isIn: [Object.values(SERVICE_TYPES)] },
      },
      inviteToken: {
        type: DataTypes.STRING(64),
        unique: true,
        allowNull: false,
        field: 'invite_token',
      },
      onboardingStatus: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: ONBOARDING_STATUS.PENDING,
        field: 'onboarding_status',
        validate: { isIn: [Object.values(ONBOARDING_STATUS)] },
      },
      inviteSentAt: {
        type: DataTypes.DATE,
        field: 'invite_sent_at',
      },
      apiUrl: {
        type: DataTypes.STRING(512),
        field: 'api_url',
      },
      adminStatus: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: ADMIN_STATUS.PENDING,
        field: 'admin_status',
        validate: { isIn: [Object.values(ADMIN_STATUS)] },
      },
      syncStatus: {
        type: DataTypes.JSONB,
        defaultValue: {},
        field: 'sync_status',
      },
      cloudinaryFolderPrefix: {
        type: DataTypes.STRING(64),
        unique: true,
        field: 'cloudinary_folder_prefix',
      },
      gitRepo: {
        type: DataTypes.STRING(255),
        field: 'git_repo',
      },
      backendRepo: {
        type: DataTypes.STRING(255),
        field: 'backend_repo',
      },
      frontendRepo: {
        type: DataTypes.STRING(255),
        field: 'frontend_repo',
      },
      phone: {
        type: DataTypes.STRING(50),
      },
      description: {
        type: DataTypes.TEXT,
      },
      domain: {
        type: DataTypes.STRING(255),
      },
      notes: {
        type: DataTypes.TEXT,
      },
      billingStatus: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: BILLING_STATUS.PENDING_ACTIVATION,
        field: 'billing_status',
        validate: { isIn: [Object.values(BILLING_STATUS)] },
      },
      billingDay: {
        type: DataTypes.INTEGER,
        field: 'billing_day',
      },
      monthlyFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
        field: 'monthly_fee',
      },
      currentPeriodStart: {
        type: DataTypes.DATE,
        field: 'current_period_start',
      },
      currentPeriodEnd: {
        type: DataTypes.DATE,
        field: 'current_period_end',
      },
      graceDays: {
        type: DataTypes.INTEGER,
        defaultValue: 7,
        field: 'grace_days',
      },
      graceUntil: {
        type: DataTypes.DATE,
        field: 'grace_until',
      },
      suspendedAt: {
        type: DataTypes.DATE,
        field: 'suspended_at',
      },
      cancelledAt: {
        type: DataTypes.DATE,
        field: 'cancelled_at',
      },
      lastBillingCronAt: {
        type: DataTypes.DATE,
        field: 'last_billing_cron_at',
      },
    },
    {
      sequelize,
      modelName: 'Client',
      tableName: 'clients',
      timestamps: true,
      updatedAt: false,
    }
  );

  return Client;
};
