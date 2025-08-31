import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

export default {
  snowflake: {
    timeout: 120000,
    account: "TKJAEDV-RR90059",
    username: "testuser",
    password: "Developers2024AB",
  },
  poolOpts: {
    min: 1, // Minimum size of the pool,
    testOnBorrow: false, // Validate connection before acquiring it
    acquireTimeoutMillis: 60000, // Timeout to acquire connection
    evictionRunIntervalMillis: 900000, // Check every 15 min for ideal connection
    numTestsPerEvictionRun: 4, // Check only 4 connections every 15 min
    idleTimeoutMillis: 10800000, // Evict only if connection is idle for 3 hrs
  },
};