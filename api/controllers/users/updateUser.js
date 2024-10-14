const getUserData = require("../../models/users/getUserData");
const updateUserDetails = require("../../models/users/updateUserDetails");

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, state, city, country, zipcode } =
    req.body;

  try {
    const userData = await getUserData(id);

    // Check if user exists
    if (!userData.user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details in both tables
    const updatedUserDetails = await updateUserDetails(id, {
      name,
      email,
      phone,
      address,
      state,
      city,
      country,
      zipcode,
    });

    return res.status(200).json({
      message: "User details updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateUser;
