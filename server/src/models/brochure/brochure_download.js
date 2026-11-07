const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BrochureDownload extends Model {
    static associate(models) {
      // define association here
    }
  }
  BrochureDownload.init(
    {
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      designation: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(10),
      },
      company: {
        type: DataTypes.STRING,
      },
      downloaded_file: {
        type: DataTypes.ENUM,
        allowNull: false,
        defaultValue: "All Product Brochure",
        values: [
          "All Product Brochure",
          "Anamaya Brochure",
          "Mini 90 Brochure",
          "Drive Link",
        ],
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BrochureDownload",
      tableName: "brochure_download_list",
      timestamps: false,
    }
  );
  return BrochureDownload;
};
