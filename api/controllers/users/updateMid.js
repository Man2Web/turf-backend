const {
  checkIfUserIsAdminWithId,
} = require("../../models/admin/checkIfUserIsAdminWithId");
const getUserData = require("../../models/users/getUserData");
const db = require("../../config/database"); // Assuming you have a db instance to run SQL queries

const updateMid = async (req, res) => {
  const { id } = req.params;
  const { merchantId } = req.body; // Assuming you're passing newMid in the request body

  try {
    // Check if user is an admin
    const isAdmin = await checkIfUserIsAdminWithId(id);
    if (!isAdmin.admin) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    // Validate the newMid value (you can add more validation if needed)
    if (!merchantId) {
      return res.status(400).json({ message: "newMid is required" });
    }

    // Update the user's mid in the database
    const updateQuery = "UPDATE users SET m_id = $1 WHERE id = $2";
    const result = await db.query(updateQuery, [merchantId, id]);

    if (result.rowCount === 0) {
      // If no rows were updated, the user was not found
      return res.status(404).json({ message: "User not found" });
    }

    // Return a success response
    return res.status(200).json({ message: "mid updated successfully" });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateMid;
