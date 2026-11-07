const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class SmartQrCode extends Model {
    static associate(models) {
      SmartQrCode.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "creator",
      });
    }
  }

  SmartQrCode.init(
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
      android_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ios_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fallback_url: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      modelName: "SmartQrCode",
      tableName: "smart_qr_codes",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SmartQrCode;
};
