const db = require("../../config/database");

const checkUserExists = async (email) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { checkUserExists };
