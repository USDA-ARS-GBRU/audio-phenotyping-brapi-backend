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
        //The ID of the field trial to which the audio belongs
        field_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        //The ID of the audio file in the breedbase database
        file_id: {
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: 'audio',
    }
);

module.exports = Audio;
