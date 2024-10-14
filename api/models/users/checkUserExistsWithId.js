const db = require("../../config/database");

const checkUserExistsWithId = async (id) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    // console.log(result.rows);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { checkUserExistsWithId };
