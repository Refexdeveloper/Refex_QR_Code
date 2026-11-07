const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class WinterSpinToken extends Model {
    static associate() {}
  }

  WinterSpinToken.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WinterSpinToken",
      tableName: "winter_spin_tokens",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["token"] },
        { fields: ["phone"] },
      ],
    }
  );

  return WinterSpinToken;
};
