const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class SsoConfig extends Model {}

  SsoConfig.init(
    {
      provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      display_name: { type: DataTypes.STRING(100), allowNull: true },
      icon_url: { type: DataTypes.STRING(1024), allowNull: true },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      client_id: { type: DataTypes.STRING(512), allowNull: true },
      client_secret: { type: DataTypes.TEXT, allowNull: true },
      redirect_uri: { type: DataTypes.STRING(1024), allowNull: true },
      frontend_base_url: { type: DataTypes.STRING(1024), allowNull: true },
      authorization_url: { type: DataTypes.STRING(1024), allowNull: true },
      token_url: { type: DataTypes.STRING(1024), allowNull: true },
      user_info_url: { type: DataTypes.STRING(1024), allowNull: true },
      discovery_url: { type: DataTypes.STRING(1024), allowNull: true },
      scopes: {
        type: DataTypes.STRING(512),
        allowNull: true,
        defaultValue: "openid email profile",
      },
    },
    {
      sequelize,
      modelName: "SsoConfig",
      tableName: "sso_config",
    }
  );

  return SsoConfig;
};
