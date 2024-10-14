const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_LOCAL,
  ssl: false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
