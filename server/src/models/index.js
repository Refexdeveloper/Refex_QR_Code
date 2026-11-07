const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Function to recursively load models and associations from directories
function loadModels(directory) {
  // Read all files and directories in the given directory
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      loadModels(fullPath); // Recursively load models from subdirectories
    } else if (
      file.indexOf(".") !== 0 && // Not a hidden file
      file !== basename && // Not the current file
      file.slice(-3) === ".js" && // JavaScript file
      file.indexOf(".test.js") === -1 // Not a test file
    ) {
      const model = require(fullPath)(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }
  });
}

loadModels(__dirname);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
