var snowflake = require("snowflake-sdk");
snowflake.configure({
    logLevel: "INFO",
    additionalLogToConsole: false
})
const genericPool = require("generic-pool");
const config = require('./config');

const factory = {
    create: () => {
        return new Promise((resolve, reject) => {
            // Create Connection
            const connection = snowflake.createConnection(config.snowflake);
            // Try to connect to Snowflake, and check whether the connection was successful.
            connection.connect((err, conn) => {
                if (err) {
                    console.error('Unable to connect: ' + err.message);
                    reject(new Error(err.message));
                } else {
                    console.log('Successfully connected to Snowflake, ID:', conn.getId());
                    resolve(conn);
                }
            });
        });
    },
    destroy: (connection) => {
        return new Promise((resolve, reject) => {
            connection.destroy((err, conn) => {
                if (err) {
                    console.error('Unable to disconnect: ' + err.message);
                } else {
                    console.log('Disconnected connection with id: ' + conn.getId());
                }
                resolve(); // Always resolve for destroy
            });
        });
    },
    validate: (connection) => {
        return new Promise((resolve, reject) => {
            resolve(connection.isUp());
        });
    }
};

const connectionPool = genericPool.createPool(factory, config.poolOpts);
module.exports = connectionPool