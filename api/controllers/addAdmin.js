const db = require("../config/database");
const bcrypt = require("bcrypt");
const { addAdminUser } = require("../models/addAdmin");
const { checAdminExists } = require("../models/checkAdminExists");

const addAdmin = async (req, res) => {
  const { username, email, password, phonenumber } = req.body;
  console.log(req.body);

  try {
    // Check if the email already exists in the DB.
    // const emailExists = await checAdminExists(email);
    const emailExists = await db.query("SELECT * FROM USERS WHERE EMAIL = $1", [
      email,
    ]);
    console.log(emailExists.rows);

    if (emailExists.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    } else {
      // Hash the password before saving it
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Save the admin details with the hashed password
      const adminDetails = await addAdminUser(
        username,
        email,
        hashedPassword,
        phonenumber
      );

      return res
        .status(201)
        .json({ message: "Admin account created successfully" });
    }
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addAdmin,
};
