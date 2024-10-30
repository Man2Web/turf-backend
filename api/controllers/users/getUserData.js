const db = require("../../config/database");
const {
  checkUserExistsWithId,
} = require("../../models/users/checkUserExistsWithId");

const getUserData = async (req, res) => {
  const { userId } = req.params;
  try {
    const userExists = await checkUserExistsWithId(userId);

    if (userExists.length === 0) {
      return res.status(404).json({ message: "Invalid Request" });
    }

    const getUserDetails = await db.query(
      "SELECT * FROM user_details WHERE user_id = $1",
      [userId]
    );

    if (getUserDetails.rows.length === 0) {
      return res.status(404).json({ message: "No Data Found " });
    }
    const userData = getUserDetails.rows[0];
    res.status(200).json({ message: "Data Found", userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getUserData;
