const { DataTypes } = require('sequelize');
const sequelize = require('../db/config'); 

const ProjectManager = sequelize.define('project_managers', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  designation: { type: DataTypes.STRING, allowNull: false },
  phone_number: { type: DataTypes.STRING }
});

module.exports = ProjectManager;
