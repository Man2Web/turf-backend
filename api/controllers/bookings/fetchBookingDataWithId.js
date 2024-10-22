const db = require("../../config/database");

const fetchBookingDataWithId = async (req, res) => {
  const { t_id } = req.params;

  try {
    const bookingDetailsQuery = `
    SELECT bookings.*,
    json_build_object(
      'court_id', courts.court_id,
      'admin_id', courts.admin_id,
      'court_name', courts.court_name,
      'court_type', courts.court_type
    ) AS court_info,
    json_build_object(
      'email', booking_details.email,
      'phone_number', booking_details.phone_number,
      'location', booking_details.location,
      'fname', booking_details.fname,
      'lname', booking_details.lname,
      'city', booking_details.city,
      'pincode', booking_details.pincode,
      'guests', booking_details.guests,
      'add_guests', booking_details.add_guests,
      'payment_type', booking_details.payment_type,
      'pg_type', booking_details.pg_type,
      'bank_id', booking_details.bank_id,
      'state', booking_details.state,
      'pg_tid', booking_details.pg_tid,
      'card_type', booking_details.card_type,
      'country', booking_details.country
    ) AS booking_info,
    json_build_object(
      'city', court_details.city,
      'location_link', court_details.location_link,
      'price', court_details.price,
      'add_price', court_details.add_price,
      'guests', court_details.guests,
      'add_guests', court_details.add_guests,
      'email', court_details.email,
      'phone_number', court_details.phone_number,
      'advance_pay', court_details.advance_pay
    ) as court_details
  FROM bookings
  JOIN booking_details ON bookings.booking_detail_id = booking_details.id
  JOIN courts ON bookings.court_id = courts.id
  JOIN court_details ON courts.id = court_details.court_id
  WHERE bookings.transaction_id = $1 
    `;
    const bookingDetails = await db.query(bookingDetailsQuery, [t_id]);

    if (bookingDetails.rows.length === 0) {
      res.status(404).json({ message: "No Booking Details Found" });
    }

    // Send the successful response with booking details
    res.status(200).json(bookingDetails.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = fetchBookingDataWithId;
