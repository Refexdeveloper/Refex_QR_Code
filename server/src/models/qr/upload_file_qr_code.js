const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class UploadFileQrCode extends Model {
    static associate(models) {
      UploadFileQrCode.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "creator",
      });
    }
  }

  UploadFileQrCode.init(
    {
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      stored_path: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      access_mode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "view",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_delete: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "UploadFileQrCode",
      tableName: "upload_file_qr_codes",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return UploadFileQrCode;
};
