const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user details (admin or regular user) by email from the database
    const userQuery = `
      SELECT id, email, password, admin FROM users WHERE email = $1;
    `;
    const userResult = await db.query(userQuery, [email]);

    // Check if user exists
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    const user = userResult.rows[0];

    console.log(user);

    // Check if user has a password and that it matches
    if (!user.password) {
      return res
        .status(500)
        .json({ message: "Server error: Missing password hash" });
    }

    // Compare the password with the hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT (replace 'yourSecretKey' with your actual secret key)
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Payload data
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expiration time
    );

    // Check if the user is an admin (assuming a column 'is_admin' exists)
    if (user.admin) {
      return res.status(200).json({
        message: "Authenticated as Admin",
        token: token, // Send the JWT
        userId: user.id,
        role: "admin",
      });
    } else {
      return res.status(200).json({
        message: "Authenticated as User",
        token: token, // Send the JWT
        userId: user.id,
        role: "user",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = authUser;
