const db = require("../config/database");

const addUserModel = async (username, email, password) => {
  try {
    const result = await db.query(
      "INSERT INTO users (username, email, password, admin) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, password, false]
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { addUserModel };
