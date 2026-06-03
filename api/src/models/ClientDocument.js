import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ClientDocument extends Model {
    static associate(models) {
      ClientDocument.belongsTo(models.Client, {
        foreignKey: 'client_id',
      });
    }
  }

  ClientDocument.init(
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
      documentType: {
        type: DataTypes.STRING(100),
        field: 'document_type',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING(255),
        field: 'mime_type',
      },
      fileUrl: {
        type: DataTypes.STRING(1024),
        field: 'file_url',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        field: 'file_size',
      },
      storageProvider: {
        type: DataTypes.STRING(50),
        defaultValue: 'local',
        field: 'storage_provider',
      },
      publicId: {
        type: DataTypes.STRING(255),
        field: 'public_id',
      },
      resourceType: {
        type: DataTypes.STRING(20),
        defaultValue: 'auto',
        field: 'resource_type',
      },
    },
    {
      sequelize,
      modelName: 'ClientDocument',
      tableName: 'client_documents',
      timestamps: true,
      createdAt: 'uploaded_at',
      updatedAt: false,
    }
  );

  return ClientDocument;
};
