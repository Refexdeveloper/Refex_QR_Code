const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class WinterCampaignSetting extends Model {
    static associate() {}
  }

  WinterCampaignSetting.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      start_date: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      end_date: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      est_spins_per_day: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 50,
      },
      default_caps: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      form_copy: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WinterCampaignSetting",
      tableName: "winter_campaign_settings",
      timestamps: false,
    }
  );

  return WinterCampaignSetting;
};
