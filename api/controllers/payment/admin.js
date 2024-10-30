const db = require("../../config/database");
const getCourtByUid = require("../court/getCourtIdByUid");

const admin = async (req, res) => {
  try {
    const {
      userDetails,
      selectedDate,
      selectedSlots,
      amount,
      courtId,
      transactionId,
      user_id,
      courtDuration,
    } = req.body;

    const court_Id = await getCourtByUid(courtId);

    // Insert user details into booking_details table
    const userDetailsQuery = `
        INSERT INTO booking_details (fName, lName, phone_number, email, guests, add_guests, payment_type, pg_tid, card_type, bank_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id;
    `;

    const userDetailsValues = [
      userDetails.fName,
      userDetails.lName,
      userDetails.phonenumber || "DBU",
      userDetails.email || "DBU",
      userDetails.numberOfGuests,
      userDetails.additionalNumberOfGuests,
      null,
      null,
      null,
      null,
    ];

    const result = await db.query(userDetailsQuery, userDetailsValues);
    const bookingDetailsId = result.rows[0].id;

    // Fetch court details
    const courtQuery = "SELECT * FROM courts WHERE id = $1";
    const courtResult = await db.query(courtQuery, [court_Id]);
    const court = courtResult.rows[0];

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    // Check if the userId matches the adminId (the owner of the court)
    if (Number(user_id) !== Number(court.admin_id)) {
      return res.status(403).json({
        message: "User is not authorized to book this court",
      });
    }
    const timeSlotsArr = [];
    // Insert each selected slot into the bookings table
    for (const slot of selectedSlots) {
      const timeInHHMMSS = `${slot.time}:00`; // Append ':00' to convert to 'HH:MM:SS'
      timeSlotsArr.push(timeInHHMMSS);
    }
    const bookingQuery = `
      INSERT INTO bookings (admin_id, court_id, booking_date, booking_time, user_id, transaction_id, booking_detail_id, amount_paid, payment_mode, duration, pay_required, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `;

    const bookingValues = [
      Number(court.admin_id),
      court_Id,
      selectedDate,
      timeSlotsArr,
      Number(user_id),
      transactionId,
      bookingDetailsId,
      Number(amount),
      false, // Assuming false represents cash payment
      courtDuration,
      0,
      true, // set the status to true
    ];

    await db.query(bookingQuery, bookingValues);
    return res
      .status(200)
      .json({ message: "Booking Successful", transaction_id: transactionId });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Booking Failed" });
  }
};

module.exports = admin;
