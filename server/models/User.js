const {DataTypes}=require('sequelize');
const sequelize=require('../db/config');
const User=sequelize.define('User',{
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      pass: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
      },
    }, {
      tableName: 'users',
      timestamps: false,
    });
    
    module.exports = User;