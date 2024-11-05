const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../config/database");

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

    // Set cookie options
    const cookieOptions = {
      httpOnly: true, // Prevents JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures cookie is sent over HTTPS in production
      sameSite: "Strict", // Helps prevent CSRF attacks (can be 'Lax' or 'Strict')
      maxAge: 7 * 24 * 60 * 60 * 1000, // 15 minutes in milliseconds
    };

    // Generate JWT (replace 'yourSecretKey' with your actual secret key)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Check if the user is an admin (assuming a column 'is_admin' exists)
    if (user.admin) {
      res.cookie("accessToken", token, cookieOptions);

      return res.status(200).json({
        message: "Authenticated as Admin",
        token: token, // Send the JWT
        userId: user.id,
        role: "admin",
      });
    } else {
      res.cookie("accessToken", token, cookieOptions);

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
