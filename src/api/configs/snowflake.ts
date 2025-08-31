import snowflake from "snowflake-sdk";
import genericPool from "generic-pool";
import config from './config.js';

snowflake.configure({
    logLevel: "INFO",
    additionalLogToConsole: false
});

const factory = {
    create: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            // Create Connection
            const connection = snowflake.createConnection(config.snowflake);
            // Try to connect to Snowflake, and check whether the connection was successful.
            connection.connect((err: any, conn: any) => {
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
    destroy: (connection: any): Promise<void> => {
        return new Promise((resolve) => {
            connection.destroy((err: any, conn: any) => {
                if (err) {
                    console.error('Unable to disconnect: ' + err.message);
                } else {
                    console.log('Disconnected connection with id: ' + conn.getId());
                }
                resolve(); // Always resolve for destroy
            });
        });
    },
    validate: (connection: any): Promise<boolean> => {
        return new Promise((resolve) => {
            resolve(connection.isUp());
        });
    }
};

const connectionPool = genericPool.createPool(factory, config.poolOpts);
export default connectionPool;