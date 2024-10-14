const db = require("../config/database");

const addAdminUser = async (username, email, password) => {
  try {
    const result = await db.query(
      "INSERT INTO users (username, email, password, admin) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, password, true] // Insert 'true' as the admin value
    );
    return result.rows[0]; // Return the inserted admin's details
  } catch (error) {
    console.error("Error adding admin:", error);
    throw error;
  }
};

// Export it correctly as an object
module.exports = { addAdminUser };
