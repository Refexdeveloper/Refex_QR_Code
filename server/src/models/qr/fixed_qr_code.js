const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FixedQrCode extends Model {
    static associate(models) {
      FixedQrCode.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "creator",
      });
    }
  }

  FixedQrCode.init(
    {
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      value: {
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
      modelName: "FixedQrCode",
      tableName: "fixed_qr_codes",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return FixedQrCode;
};
