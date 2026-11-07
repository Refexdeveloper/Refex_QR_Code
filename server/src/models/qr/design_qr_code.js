const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DesignQrCode extends Model {
    static associate(models) {
      DesignQrCode.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "creator",
      });
    }
  }

  DesignQrCode.init(
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
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      design_config: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      logo_path: {
        type: DataTypes.STRING(512),
        allowNull: true,
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
      modelName: "DesignQrCode",
      tableName: "design_qr_codes",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return DesignQrCode;
};
