const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class WinterSpinEntry extends Model {
    static associate() {}
  }

  WinterSpinEntry.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      prize_code: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      prize_label: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      is_win: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      week_key: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      spun_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      user_agent: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WinterSpinEntry",
      tableName: "winter_spin_entries",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["phone"] },
        { fields: ["week_key", "prize_code"] },
      ],
    }
  );

  return WinterSpinEntry;
};
