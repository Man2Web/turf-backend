// controllers/users/getUser.js
const getUserData = require("../../models/users/getUserData");

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const userData = await getUserData(id);

    // Check if user exists
    if (!userData.user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the response
    const response = {
      message: "User found",
      user: userData.user,
      location: userData.location,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getUser;
