const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DynamicQrCode extends Model {
    static associate(models) {
      DynamicQrCode.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "creator",
      });
    }
  }

  DynamicQrCode.init(
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
      dynamic_value: {
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
      modelName: "DynamicQrCode",
      tableName: "dynamic_qr_codes",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return DynamicQrCode;
};
