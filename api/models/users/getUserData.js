// models/users/getUserData.js
const db = require("../../config/database");

const getUserData = async (id) => {
  try {
    // Get user details from users table
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

    // Get additional location details from user_details table
    const locationResult = await db.query(
      "SELECT * FROM user_details WHERE user_id = $1",
      [id]
    );

    // Return both results
    return { user: result.rows[0], location: locationResult.rows[0] };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = getUserData;
