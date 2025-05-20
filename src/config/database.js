const dotenv = require('dotenv');
dotenv.config();

// Конфигурация подключения к базе данных
const dbConfig = {
    user:  'sa',
    password: 'icY2eGuyfU',
    server:'PRM-SRV-MSSQL-01.komus.net',
    port:59587,
    database: 'SPOe_rc',
    pool:{
        max: 500,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: true 
    }
};

module.exports = dbConfig; 