const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LoginHistory.belongsTo(models.User,{
        foreignKey:"user_id",
        as: "userDetails"
      });
    }
  }
  LoginHistory.init(
    {
      user_id: {
        type:DataTypes.INTEGER,
        allowNull:false,
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING(100),
      user_name: DataTypes.STRING(50),
      status:{
        type: DataTypes.ENUM,
        allowNull:false,
        values:["Logged-In","Logged-Out"]
      }  
    },
    {
      sequelize,
      modelName: "LoginHistory",
      createdAt:"login_time",
      updatedAt:"logout_time"
    }
  );
  return LoginHistory;
};
