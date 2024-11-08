'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config(); // Load environment variables
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
// console.log(config,config.use_env_variable)
if (config.use_env_variable) {
  sequelize = new Sequelize(config.use_env_variable, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false // Use this option if SSL is required by Clever Cloud
      }
    }
  });
  console.log("error where")
} 

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
