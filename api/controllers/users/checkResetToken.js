const db = require("../../config/database");

const checkResetToken = async (req, res) => {
  const { token } = req.params;
  try {
    const checkTokenExists = await db.query(
      "SELECT * FROM pass_reset WHERE token = $1 AND status = TRUE",
      [token]
    );
    if (checkTokenExists.rows.length === 0) {
      return res.status(404).json({ message: "Invalid Request" });
    }
    res.status(200).json({ message: "Valid Request" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = checkResetToken;
