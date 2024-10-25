const db = require("../../config/database");

const getBookingsByUserId = async (userId, limit, offset) => {
  // const today = new Date();
  // const todaysDate = today.toISOString().split("T")[0];

  // Query to get today's bookings
  const upcomingBookingQuery = `
  SELECT bookings.*,
    json_build_object(
      'court_id', courts.court_id,
      'admin_id', courts.admin_id,
      'featured', courts.featured,
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
      'images', court_details.images,
      'advance_pay', court_details.advance_pay
    ) as court_details,
    (
      SELECT COUNT(*) 
      FROM bookings
      JOIN booking_details ON bookings.booking_detail_id = booking_details.id
      JOIN courts ON bookings.court_id = courts.id
      JOIN court_details ON courts.id = court_details.court_id
      WHERE bookings.user_id = $1 
      AND bookings.booking_date >= CURRENT_DATE
    ) AS total_count
  FROM bookings
  JOIN booking_details ON bookings.booking_detail_id = booking_details.id
  JOIN courts ON bookings.court_id = courts.id
  JOIN court_details ON courts.id = court_details.court_id
  WHERE bookings.user_id = $1 
  AND bookings.booking_date >= CURRENT_DATE
`;

  // Query to get previous bookings (before today)
  const previousBookingQuery = `
  SELECT bookings.*,
    json_build_object(
      'court_id', courts.court_id,
      'admin_id', courts.admin_id,
      'featured', courts.featured,
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
      'advance_pay', court_details.advance_pay,
      'images', court_details.images
    ) as court_details,
    CASE WHEN court_reviews.transaction_id IS NOT NULL THEN
      json_build_object(
        'title', court_reviews.title,
        'description', court_reviews.description,
        'rating', court_reviews.rating,
        'status', court_reviews.status,
        'transaction_id', court_reviews.transaction_id
      ) ELSE NULL END as court_reviews,
    (
      SELECT COUNT(*) 
      FROM bookings
      JOIN booking_details ON bookings.booking_detail_id = booking_details.id
      JOIN courts ON bookings.court_id = courts.id
      JOIN court_details ON courts.id = court_details.court_id
      WHERE bookings.user_id = $1 
      AND bookings.booking_date < CURRENT_DATE
    ) AS total_count
  FROM bookings
  JOIN booking_details ON bookings.booking_detail_id = booking_details.id
  JOIN courts ON bookings.court_id = courts.id
  JOIN court_details ON courts.id = court_details.court_id
  LEFT JOIN court_reviews ON bookings.transaction_id = court_reviews.transaction_id
  WHERE bookings.user_id = $1 
  AND bookings.booking_date < CURRENT_DATE
  LIMIT $2 OFFSET $3
`;

  // Execute all queries concurrently using Promise.all
  const [
    // todaysBookings,
    previousBookings,
    upcomingBookings,
  ] = await Promise.all([
    // db.query(todaysBookingQuery, [userId, todaysDate]),
    db.query(previousBookingQuery, [userId, limit, offset]),
    db.query(upcomingBookingQuery, [userId]),
  ]);

  // Return the bookings with details
  return {
    // todaysBookings: todaysBookingsWithDetails,
    previousBookings: previousBookings.rows,
    upcomingBookings: upcomingBookings.rows,
    totalCount: previousBookings.rows[0]?.total_count || 0,
  };
};

module.exports = { getBookingsByUserId };
