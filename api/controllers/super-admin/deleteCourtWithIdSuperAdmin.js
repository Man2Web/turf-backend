const db = require("../../config/database");

const deleteCourtWithIdSuperAdmin = async (req, res) => {
  const { courtId } = req.params;
  try {
    // Check if the court exists
    const checkCourtExists = await db.query(
      "SELECT * FROM courts WHERE id = $1",
      [courtId]
    );

    if (checkCourtExists.rows.length === 0) {
      return res.status(404).json({ message: "Court does not exist" }); // Use 404 for 'Not Found'
    }

    // Delete the court
    await db.query("DELETE FROM courts WHERE id = $1", [courtId]);

    // Return success response
    return res.status(200).json({ message: "Court deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = deleteCourtWithIdSuperAdmin;
