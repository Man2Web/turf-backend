const db = require("../../config/database");

const fetchBookingDataWithId = async (req, res) => {
  const { t_id } = req.params;

  try {
    // Check if the booking exists
    const bookingExistsQuery = `
      SELECT * FROM bookings WHERE transaction_id = $1
    `;
    const bookingExistsRes = await db.query(bookingExistsQuery, [t_id]);

    console.log(bookingExistsRes.rows);

    if (bookingExistsRes.rows.length === 0) {
      return res.status(404).json({ message: "No Booking Data found" });
    }

    // Destructure court_id and booking_detail_id
    const { court_id, booking_detail_id } = bookingExistsRes.rows[0];

    // Get court information
    const getCourtInfoQuery = `
      SELECT * FROM courts WHERE id = $1
    `;
    const getCourtInfoRes = await db.query(getCourtInfoQuery, [court_id]);

    // Get booking details information
    const getBookingInfoQuery = `
      SELECT * FROM booking_details WHERE id = $1
    `;
    const getBookingInfoRes = await db.query(getBookingInfoQuery, [
      booking_detail_id,
    ]);

    // Get location information (assuming location is tied to court)
    const getLocationInfoQuery = `
      SELECT * FROM locations WHERE court_id = $1
    `;
    const getLocationInfoRes = await db.query(getLocationInfoQuery, [court_id]);

    // Prepare booking details response
    const bookingDetails = {
      booking: bookingExistsRes.rows,
      courtDetails: getCourtInfoRes.rows[0],
      bookingDetails: getBookingInfoRes.rows[0],
      locationDetails: getLocationInfoRes.rows[0],
    };

    // Send the successful response with booking details
    res.status(200).json(bookingDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = fetchBookingDataWithId;
