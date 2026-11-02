import pg from "pg";
import config from "../config.js";

const { Pool } = pg;
const connectionString = config.databaseUrl;

const pool = new Pool({ connectionString });

export default pool;
