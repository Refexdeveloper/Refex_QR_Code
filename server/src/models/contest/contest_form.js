const { Model, DataTypes, BOOLEAN } = require("sequelize");

module.exports = (sequelize) => {
  class ContestForm extends Model {
    static associate(models) {
      // define association here
    }
  }
  ContestForm.init(
    {
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      mobile_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      has_residential_address: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      // residency: {
      //   type: DataTypes.STRING(45),
      //   allowNull: false,
      // },
      is_participate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      is_acknowledge: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      invoice: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ContestForm",
      tableName: "contest_form",
      timestamps: false,
    }
  );
  return ContestForm;
};
