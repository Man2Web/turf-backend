const checkIfExists = require("../../models/super-admin/checkIfExists");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = async (req, res) => {
  const { email, password } = req.body;

  try {
    const ifAdminExists = await checkIfExists(email);

    // Assuming `checkIfExists` returns an array
    if (ifAdminExists.length === 0) {
      return res.json({ message: "Admin not found" });
    }

    // Accessing the first element if admin exists
    const admin = ifAdminExists[0];

    const compare = await bcrypt.compare(password, admin.password);

    if (!compare) {
      return res.json({ message: "Email or Password is invalid" });
    }

    // Generate JWT (replace 'yourSecretKey' with your actual secret key)
    const token = jwt.sign(
      { userId: admin.id, email: admin.email }, // Payload data
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expiration time
    );

    // If authentication is successful
    return res.status(200).json({
      message: "Authenticated as SuperAdmin",
      token: token, // Send the JWT
      userId: admin.id,
      role: "superAdmin",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred during authentication" });
  }
};

module.exports = auth;
