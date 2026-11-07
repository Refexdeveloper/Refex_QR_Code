const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class WinterSpinWeeklyStock extends Model {
    static associate() {}
  }

  WinterSpinWeeklyStock.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      week_key: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      prize_code: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      cap: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      used: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "WinterSpinWeeklyStock",
      tableName: "winter_spin_weekly_stock",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["week_key", "prize_code"],
          name: "winter_spin_week_prize_unique",
        },
      ],
    }
  );

  return WinterSpinWeeklyStock;
};
