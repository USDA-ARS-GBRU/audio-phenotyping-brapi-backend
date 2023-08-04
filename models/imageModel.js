const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../server');

const Image = sequelize.define(
    'image',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        auth_user_id: {
            type: DataTypes.STRING,
        },
        copyright: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        image_data: {
            type: DataTypes.BLOB('long'),
        },
        image_file_name: {
            type: DataTypes.DATEONLY,
        },
        image_file_size: {
            type: DataTypes.INTEGER,
        },
        image_height: {
            type: DataTypes.INTEGER,
        },
        imagemimetype: {
            type: DataTypes.STRING,
        },
        imageurl: {
            type: DataTypes.STRING,
        },
        image_width: {
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
        },
        time_stamp: {
            type: DataTypes.DATE,
        },
        coordinates_id: {
            type: DataTypes.STRING,
        },
        observation_unit_id: {
            type: DataTypes.STRING,
        },
    },
    {
        tableName: 'image',
    }
);

module.exports = Image;
