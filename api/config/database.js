const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_CONNECTION,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

