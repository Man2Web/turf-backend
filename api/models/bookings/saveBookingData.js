const db = require("../../config/database");

const saveBookingData = async (
  court__id,
  selectedDate,
  selectedSlots,
  user_id,
  transaction_id,
  bookingDetailsId,
  amount,
  courtDuration,
  amountTobePaid
) => {
  try {
    const courtQuery = "SELECT * FROM courts WHERE id = $1";
    const courtResult = await db.query(courtQuery, [court__id]);
    const court = courtResult.rows[0];

    const adminId = court.admin_id;

    const timeSlotsArr = [];
    // Insert each selected slot into the bookings table
    for (const slot of selectedSlots) {
      const timeInHHMMSS = `${slot.time}:00`;
      timeSlotsArr.push(timeInHHMMSS);
    }

    const currentDate = new Date().toISOString().split("T")[0]; // Gets YYYY-MM-DD format

    const bookingQuery = `
    INSERT INTO bookings (admin_id, court_id, booking_date, booking_time, user_id, transaction_id, booking_detail_id, amount_paid, duration, pay_required, payment_mode, booked_on)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id;
    `;

    const bookingValues = [
      adminId,
      court__id,
      selectedDate, // Assuming selected_date is in the correct date format
      timeSlotsArr, // slot.time should be in 'HH:MM:SS' format
      user_id, // If user_id is undefined, it will insert NULL
      transaction_id,
      bookingDetailsId,
      Number(amount),
      courtDuration,
      Number(amountTobePaid),
      true, // payment mode set to true for online
      currentDate, // Add current date as the last parameter
    ];
    await db.query("BEGIN");
    await db.query(bookingQuery, bookingValues);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    throw error;
  }
};

module.exports = saveBookingData;
