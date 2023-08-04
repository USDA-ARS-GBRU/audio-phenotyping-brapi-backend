const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../server');

const Audio = sequelize.define(
    'audio',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },

        audio_file_name: {
            type: DataTypes.STRING,
        },
        audiomimetype: {
            type: DataTypes.STRING,
        },
        audiourl: {
            type: DataTypes.STRING,
        },
        time_stamp: {
            type: DataTypes.DATE,
        },
    },
    {
        tableName: 'audio',
    }
);

module.exports = Audio;
