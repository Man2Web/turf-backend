const getUserData = require("../../models/users/getUserData");
const bcrypt = require("bcrypt");
const db = require("../../config/database"); // Assuming you have a database connection module

const updatePass = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    const userData = await getUserData(id);

    // Check if user exists
    if (!userData.user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare old password with stored hashed password
    const comparePassword = await bcrypt.compare(
      oldPassword,
      userData.user.password
    );

    if (!comparePassword) {
      return res.status(400).json({ message: "Incorrect Credentials" });
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    const updateUserQuery = "UPDATE users SET password = $1 WHERE id = $2";
    await db.query(updateUserQuery, [hashedPassword, id]);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updatePass;
