import { Model } from 'sequelize';

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
      },
      inviteToken: {
        type: DataTypes.STRING(64),
        unique: true,
        allowNull: false,
        field: 'invite_token',
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending',
      },
      inviteSentAt: {
        type: DataTypes.DATE,
        field: 'invite_sent_at',
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
