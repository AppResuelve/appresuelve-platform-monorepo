import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class ModuleCategory extends Model {
    static associate(models) {
      ModuleCategory.hasMany(models.ModuleComponent, {
        foreignKey: 'category_id',
        as: 'components',
      })
    }
  }

  ModuleCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      free: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ModuleCategory',
      tableName: 'module_categories',
      timestamps: true,
      underscored: true,
    }
  )

  return ModuleCategory
}
