const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class WinterCampaignSubmission extends Model {
    static associate(models) {
      WinterCampaignSubmission.hasMany(models.WinterCampaignBill, {
        foreignKey: "submission_id",
        as: "bills",
      });
    }
  }

  WinterCampaignSubmission.init(
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
      email: {
        type: DataTypes.STRING(180),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      consent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      outlet: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      invoice_value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ip_address: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      confirmation_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WinterCampaignSubmission",
      tableName: "winter_campaign_submissions",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["email"] },
        { unique: true, fields: ["phone"] },
      ],
    }
  );

  return WinterCampaignSubmission;
};
