const Sequelize = require('sequelize');

const sequelize = new Sequelize('brapi', 'root', 'savla000822', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false,
    },
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database: ', error);
    });

module.exports = sequelize;
