const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DistributionList extends Model {
    static associate(models) {
      // define association here
    }
  }
  DistributionList.init(
    {
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      contact_number: {
        type: DataTypes.STRING(15),
      },
      institution_name: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "DistributionList",
      tableName: "brochure_distribution_list",
      timestamps: false,
    }
  );
  return DistributionList;
};
