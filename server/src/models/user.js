const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING(100),
      phone: DataTypes.STRING(20),
      user_name: DataTypes.STRING(50),
      password: DataTypes.STRING(100),
      pending_password: DataTypes.TEXT,
      photo: DataTypes.BLOB("medium"),
      role: DataTypes.STRING(10),
      page_access: DataTypes.TEXT,
      employee_id: DataTypes.STRING(50),
      company_name: DataTypes.STRING(255),
      designation: DataTypes.STRING(255),
      is_hrms_synced: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_delete: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
