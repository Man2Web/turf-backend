const db = require("../../config/database");

const saveUserBookingData = async (userDetails) => {
  const userDetailsQuery = `
    INSERT INTO booking_details (fName, lName, phone_number, email, location, city, country, pincode, guests, add_guests, payment_type, pg_tid, card_type, bank_id, state)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id;
  `;

  const userDetailsValues = [
    userDetails.fName || null,
    userDetails.lName || null,
    userDetails.phonenumber || null,
    userDetails.email || null,
    userDetails.address || null,
    userDetails.city || null,
    userDetails.country || null,
    userDetails.pincode || null,
    userDetails.numberOfGuests || null,
    userDetails.additionalNumberOfGuests || null,
    null,
    null,
    null,
    null,
    userDetails.state || null,
  ];

  try {
    await db.query("BEGIN");
    const result = await db.query(userDetailsQuery, userDetailsValues);
    await db.query("COMMIT");
    return result.rows[0].id;
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    throw error;
  }
};

module.exports = saveUserBookingData;
