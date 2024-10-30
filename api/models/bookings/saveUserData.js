const db = require("../../config/database");

const saveUserData = async (userDetails, user_id) => {
  try {
    const checkAlreadyExists = await db.query(
      "SELECT * FROM user_details WHERE user_id = $1",
      [user_id]
    );

    if (checkAlreadyExists.rows.length === 0) {
      const insertDataQuery = `
            INSERT INTO user_details 
            (user_id, fname, lname, email, phone_number, address, city, pincode, state, country)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
      await db.query(insertDataQuery, [
        user_id,
        userDetails.fName || null,
        userDetails.lName || null,
        userDetails.email || null,
        userDetails.phonenumber || null,
        userDetails.address || null,
        userDetails.city || null,
        userDetails.pincode || null,
        userDetails.state || null,
        userDetails.country || null,
      ]);
    } else {
      const updateDataQuery = `
            UPDATE user_details 
            SET fname = $1, lname = $2, email = $3, phone_number = $4, address = $5, city = $6, pincode = $7, state = $8, country = $9
            WHERE user_id = $10
        `;
      await db.query(updateDataQuery, [
        userDetails.fName || null,
        userDetails.lName || null,
        userDetails.email || null,
        userDetails.phonenumber || null,
        userDetails.address || null,
        userDetails.city || null,
        userDetails.pincode || null,
        userDetails.state || null,
        userDetails.country || null,
        user_id,
      ]);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = saveUserData;
