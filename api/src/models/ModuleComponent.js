import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class ModuleComponent extends Model {
    static associate(models) {
      ModuleComponent.belongsTo(models.ModuleCategory, {
        foreignKey: 'category_id',
        as: 'category',
      })
    }
  }

  ModuleComponent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      estimatedDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'estimated_days',
      },
      requiresApproval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'requires_approval',
      },
      paidOverride: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'paid_override',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      fields: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'ModuleComponent',
      tableName: 'module_components',
      timestamps: true,
      underscored: true,
    }
  )

  return ModuleComponent
}
