const { DataTypes } = require('sequelize');
const sequelize = require('../db/config'); 
    const MaterialRequest = sequelize.define('material_requests', {
      ticket_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      project_details: {
        type: DataTypes.STRING,
      },
      manager_emails: {
        type: DataTypes.STRING,
      },
      sheet_no: {
        type: DataTypes.STRING,
      },
      requirement_date: {
        type: DataTypes.DATEONLY,
      },
      delivery_place: {
        type: DataTypes.STRING,
      },
      remarks: {
        type: DataTypes.STRING,
      },
      attachment: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },
      status_track: {
        type: DataTypes.STRING,
        defaultValue: 'Sent to Management',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: 'material_requests',
      timestamps: false,
      underscored: true,
    });
  
    MaterialRequest.associate = (models) => {
      MaterialRequest.hasMany(models.MaterialRequestItem, {
        foreignKey: 'ticket_id',
        as: 'items',
      });
    };


    module.exports=MaterialRequest
  