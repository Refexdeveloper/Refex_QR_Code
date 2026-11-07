const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class SmtpConfig extends Model {}

  SmtpConfig.init(
    {
      host: { type: DataTypes.STRING(255), allowNull: true },
      port: { type: DataTypes.INTEGER, allowNull: true },
      secure: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      user: { type: DataTypes.STRING(255), allowNull: true },
      password: { type: DataTypes.TEXT, allowNull: true },
      from_email: { type: DataTypes.STRING(255), allowNull: true },
      from_name: { type: DataTypes.STRING(255), allowNull: true },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "SmtpConfig",
      tableName: "smtp_config",
    }
  );

  return SmtpConfig;
};
