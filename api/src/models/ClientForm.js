import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ClientForm extends Model {
    static associate(models) {
      ClientForm.belongsTo(models.Client, {
        foreignKey: 'client_id',
      });
    }
  }

  ClientForm.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'client_id',
        references: {
          model: 'clients',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      formType: {
        type: DataTypes.STRING(50),
        defaultValue: 'onboarding',
        field: 'form_type',
      },
      data: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: 'ClientForm',
      tableName: 'client_forms',
      timestamps: true,
      createdAt: false,
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['client_id', 'form_type'],
        },
      ],
    }
  );

  return ClientForm;
};
