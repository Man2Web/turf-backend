const bcrypt = require("bcrypt");
const { checkUserExists } = require("../../models/users/checkUserExists");
const addUserModel = require("../../models/users/addUserModel");

const addUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userAlreadyExists = await checkUserExists(email);
    if (userAlreadyExists.length > 0) {
      res.status(409).json({ message: "Email already exists" });
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const addUserFunction = await addUserModel(
        email,
        username,
        hashedPassword
      );
      return res
        .status(201)
        .json({ message: "User account created successfully" });
    }
    console.log(userAlreadyExists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = addUser;
