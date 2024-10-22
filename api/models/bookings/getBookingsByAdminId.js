const db = require("../../config/database");

const getBookingsByAdminId = async (
  adminId,
  todayBookingSettings,
  upcomingBookingSettings,
  previousBookingSettings,
  limit
) => {
  // const today = new Date();
  // const todaysDate = today.toISOString().split("T")[0]; // Get the current date in 'YYYY-MM-DD' format

  // Query to get today's bookings
  const todaysBookingQuery = `
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
    ) as court_details,
    (
      SELECT COUNT(*) 
      FROM bookings
      JOIN booking_details ON bookings.booking_detail_id = booking_details.id
      JOIN courts ON bookings.court_id = courts.id
      JOIN court_details ON courts.id = court_details.court_id
      WHERE bookings.admin_id = $1 
      AND bookings.booking_date = NOW()
    ) AS total_count
  FROM bookings
  JOIN booking_details ON bookings.booking_detail_id = booking_details.id
  JOIN courts ON bookings.court_id = courts.id
  JOIN court_details ON courts.id = court_details.court_id
  WHERE bookings.admin_id = $1 
  AND bookings.booking_date = NOW()
  LIMIT $2 OFFSET $3
`;

  // Query to get previous bookings (before today)
  const previousBookingQuery = `
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
    ) as court_details,
    (
      SELECT COUNT(*) 
      FROM bookings
      JOIN booking_details ON bookings.booking_detail_id = booking_details.id
      JOIN courts ON bookings.court_id = courts.id
      JOIN court_details ON courts.id = court_details.court_id
      WHERE bookings.admin_id = $1 
      AND bookings.booking_date < NOW()
    ) AS total_count
  FROM bookings
  JOIN booking_details ON bookings.booking_detail_id = booking_details.id
  JOIN courts ON bookings.court_id = courts.id
  JOIN court_details ON courts.id = court_details.court_id
  WHERE bookings.admin_id = $1 
  AND bookings.booking_date < NOW()
  LIMIT $2 OFFSET $3
`;

  // Query to get upcoming bookings (after today)
  const upcomingBookingQuery = `
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
    ) as court_details,
    (
      SELECT COUNT(*) 
      FROM bookings
      JOIN booking_details ON bookings.booking_detail_id = booking_details.id
      JOIN courts ON bookings.court_id = courts.id
      JOIN court_details ON courts.id = court_details.court_id
      WHERE bookings.admin_id = $1 
      AND bookings.booking_date > NOW()
    ) AS total_count
  FROM bookings
  JOIN booking_details ON bookings.booking_detail_id = booking_details.id
  JOIN courts ON bookings.court_id = courts.id
  JOIN court_details ON courts.id = court_details.court_id
  WHERE bookings.admin_id = $1 
  AND bookings.booking_date > NOW()
  LIMIT $2 OFFSET $3  
  `;

  // Execute all queries concurrently using Promise.all
  const [todaysBookings, previousBookings, upcomingBookings] =
    await Promise.all([
      db.query(todaysBookingQuery, [adminId, limit, todayBookingSettings]),
      db.query(previousBookingQuery, [adminId, limit, previousBookingSettings]),
      db.query(upcomingBookingQuery, [adminId, limit, upcomingBookingSettings]),
    ]);

  return {
    todaysBookings: todaysBookings.rows,
    previousBookings: previousBookings.rows,
    upcomingBookings: upcomingBookings.rows,
    countData: {
      todaysBookingsCount: todaysBookings.rows[0]?.total_count || 0,
      previousBookingsCount: previousBookings.rows[0]?.total_count || 0,
      upcomingBookingsCount: upcomingBookings.rows[0]?.total_count || 0,
    },
  };
};

module.exports = { getBookingsByAdminId };
