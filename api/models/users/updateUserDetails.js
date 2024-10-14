const db = require("../../config/database");

const updateUserDetails = async (id, details) => {
  const { name, email, phone, address, state, city, country, zipcode } =
    details;

  try {
    // Update the users table
    await db.query(
      "UPDATE users SET username = $1, email = $2, phone_number = $3 WHERE id = $4",
      [name, email, phone, id]
    );

    // Update the user_details table
    await db.query(
      "UPDATE user_details SET address = $1, state = $2, city = $3, country = $4, zipcode = $5 WHERE user_id = $6",
      [address, state, city, country, zipcode, id]
    );

    return { message: "User details updated successfully" };
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error; // Throw the error to handle it in the controller
  }
};

module.exports = updateUserDetails;
