const db = require("../../config/database");

const checkUserWithIdAndEmail = async (id, email) => {
  try {
    const checkIfUserExists = await db.query(
      "SELECT * FROM users WHERE id = $1 AND email = $2",
      [id, email]
    );
    return checkIfUserExists.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = checkUserWithIdAndEmail;
