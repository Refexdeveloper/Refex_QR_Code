const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class WinterCampaignBill extends Model {
    static associate(models) {
      WinterCampaignBill.belongsTo(models.WinterCampaignSubmission, {
        foreignKey: "submission_id",
        as: "submission",
      });
    }
  }

  WinterCampaignBill.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      submission_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      stored_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      size_bytes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      kind: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "invoice",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "WinterCampaignBill",
      tableName: "winter_campaign_bills",
      timestamps: false,
      indexes: [{ fields: ["submission_id"] }],
    }
  );

  return WinterCampaignBill;
};
