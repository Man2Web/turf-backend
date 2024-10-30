const db = require("../../config/database");
const bcrypt = require("bcrypt");

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  try {
    const checkTokenExists = await db.query(
      "SELECT * FROM pass_reset WHERE token = $1 AND status = TRUE",
      [token]
    );
    if (checkTokenExists.rows.length === 0) {
      return res.status(404).json({ message: "Invalid Request" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(404).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      checkTokenExists.rows[0].user_id,
    ]);

    await db.query("UPDATE pass_reset SET status = FALSE WHERE token = $1", [
      token,
    ]);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = resetPassword;
