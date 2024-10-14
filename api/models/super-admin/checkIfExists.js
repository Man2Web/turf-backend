const db = require("../../config/database");

const checkIfExists = async (email) => {
  try {
    const checkQuery = `SELECT * FROM users WHERE email = $1 AND super_admin = TRUE`;
    const checkRes = await db.query(checkQuery, [email]);
    // console.log(checkRes.rows);
    return checkRes.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = checkIfExists;
