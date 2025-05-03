const { DataTypes } = require('sequelize');
const sequelize = require('../db/config'); 
    const MaterialRequestItem = sequelize.define('MaterialRequestItem', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ticket_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      uom: {
        type: DataTypes.STRING,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      make: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: 'material_request_items',
      timestamps: false,
      underscored: true,
    });
  
    MaterialRequestItem.associate = (models) => {
      MaterialRequestItem.belongsTo(models.MaterialRequest, {
        foreignKey: 'ticket_id',
        as: 'request',
      });
    };
 

    module.exports=MaterialRequestItem