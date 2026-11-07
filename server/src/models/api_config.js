const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ApiConfig extends Model {}

  ApiConfig.init(
    {
      base_url: { type: DataTypes.STRING(1024), allowNull: false },
      access_token: { type: DataTypes.TEXT, allowNull: true },
      api_key: { type: DataTypes.TEXT, allowNull: true },
      username: { type: DataTypes.STRING(255), allowNull: true },
      password: { type: DataTypes.STRING(255), allowNull: true },
      headers_json: { type: DataTypes.TEXT, allowNull: true },
      updated_by: { type: DataTypes.STRING(255), allowNull: true },
      hrms_sync_cron_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      hrms_sync_cron_hour: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 22,
      },
      hrms_sync_cron_minute: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ApiConfig",
      tableName: "api_config",
    }
  );

  return ApiConfig;
};
