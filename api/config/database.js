const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DATABASE_LOCAL, // RDS endpoint
  user: process.env.DATABASE_USERNAME, // Username
  password: process.env.DATABASE_PASSWORD, // Password
  database: process.env.DATABASE_NAME, // Change this to your actual database name
  port: 5432, // Default PostgreSQL port
  ssl: {
    rejectUnauthorized: false, // Use this only for development (for RDS)
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
