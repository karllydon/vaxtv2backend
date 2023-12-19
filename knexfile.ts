const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    client: 'mysql2',
    connection: {
      database: process.env.VAXTV_DBNAME,
      user:     process.env.VAXTV_DBUSER,
      password: process.env.VAXTV_DBPASSWORD,
      host: process.env.VAXTV_DBHOST
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
        tableName: 'migrations'
    }
};