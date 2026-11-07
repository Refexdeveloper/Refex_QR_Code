const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Asset extends Model {
    static associate(models) {
      // define association here (future)
    }
  }

  Asset.init(
    {
      asset_id: {
        type: DataTypes.STRING(64),
        primaryKey: true,
        allowNull: false,
        field: "asset_id",
      },
      asset_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "asset_name",
      },
      category: {
        type: DataTypes.STRING(128),
        field: "category",
      },
      asset_subcategory: {
        type: DataTypes.STRING(128),
        field: "asset_subcategory",
      },
      entity: {
        type: DataTypes.STRING(128),
        field: "entity",
      },
      brand: {
        type: DataTypes.STRING(128),
        field: "brand",
      },
      model: {
        type: DataTypes.STRING(128),
        field: "model",
      },
      configuration_details: {
        type: DataTypes.TEXT,
        field: "configuration_details",
      },
      asset_status: {
        type: DataTypes.STRING(64),
        field: "asset_status",
      },
      purchase_date: {
        type: DataTypes.DATEONLY,
        field: "purchase_date",
      },
      warranty_expiry_date: {
        type: DataTypes.DATEONLY,
        field: "warranty_expiry_date",
      },
      purchase_cost: {
        type: DataTypes.DECIMAL(14, 2),
        field: "purchase_cost",
      },
      current_value: {
        type: DataTypes.DECIMAL(14, 2),
        field: "current_value",
      },
      vendor_name: {
        type: DataTypes.STRING(255),
        field: "vendor_name",
      },
      invoice_date: {
        type: DataTypes.DATEONLY,
        field: "invoice_date",
      },
      assigned_employee_name: {
        type: DataTypes.STRING(255),
        field: "assigned_employee_name",
      },
      assigned_employee_email: {
        type: DataTypes.STRING(255),
        field: "assigned_employee_email",
      },
      location: {
        type: DataTypes.STRING(255),
        field: "location",
      },
      notes: {
        type: DataTypes.TEXT,
        field: "notes",
      },
      employee_status: {
        type: DataTypes.STRING(64),
        field: "employee_status",
      },
      exit_date: {
        type: DataTypes.DATEONLY,
        field: "exit_date",
      },
      qr_url: {
        type: DataTypes.STRING(512),
        field: "qr_url",
      },
    },
    {
      sequelize,
      modelName: "Asset",
      tableName: "assets",
      timestamps: false,
    }
  );

  return Asset;
};

