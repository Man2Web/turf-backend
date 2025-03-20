const db = require("../../config/database");

const checkIfUserIsAdminWithId = async (id) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

    const admin = result.rows[0];
    // Check if the user is an admin
    if (admin && !admin.admin) {
      return null; // Return null if the user is not an admin
    }

    return admin; // Return the admin object if found and is an admin
  } catch (error) {
    console.error("Error checking id existence:", error);
    throw error; // Handle the error appropriately in your application
  }
};

module.exports = { checkIfUserIsAdminWithId }; // Export it as an object
