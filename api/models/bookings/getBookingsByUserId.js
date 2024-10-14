const db = require("../../config/database");
const checkReview = require("../../controllers/users/checkReview");

const getBookingsByUserId = async (userId, limit, offset) => {
  const today = new Date();
  const todaysDate = today.toISOString().split("T")[0];

  // Query to get today's bookings for the user
  const todaysBookingQuery = `
    SELECT * FROM bookings 
    WHERE user_id = $1 
    AND booking_date = $2
  `;

  // Query to get previous bookings (before today)
  const previousBookingQuery = `
    SELECT * FROM bookings 
    WHERE user_id = $1 
    AND booking_date < $2
    LIMIT $3 OFFSET $4;
  `;

  // Query to get previous bookings count (before today)
  const previousBookingQueryCount = `
    SELECT COUNT(*) FROM bookings 
    WHERE user_id = $1 
    AND booking_date < $2;
  `;

  // Query to get upcoming bookings (after today)
  const upcomingBookingQuery = `
    SELECT * FROM bookings 
    WHERE user_id = $1 
    AND booking_date >= $2
  `;

  // Execute all queries concurrently using Promise.all
  const [
    todaysBookings,
    previousBookings,
    previousBookingsCount,
    upcomingBookings,
  ] = await Promise.all([
    db.query(todaysBookingQuery, [userId, todaysDate]),
    db.query(previousBookingQuery, [userId, todaysDate, limit, offset]),
    db.query(previousBookingQueryCount, [userId, todaysDate]),
    db.query(upcomingBookingQuery, [userId, todaysDate]),
  ]);

  const prevBookingsCount = previousBookingsCount.rows[0].count;

  // Get all unique court IDs and booking detail IDs from today's, previous, and upcoming bookings
  const allCourtIds = [
    ...todaysBookings.rows.map((row) => row.court_id),
    ...previousBookings.rows.map((row) => row.court_id),
    ...upcomingBookings.rows.map((row) => row.court_id),
  ];

  const allBookingDetailIds = [
    ...todaysBookings.rows.map((row) => row.booking_detail_id),
    ...previousBookings.rows.map((row) => row.booking_detail_id),
    ...upcomingBookings.rows.map((row) => row.booking_detail_id),
  ];

  const allReviewsTids = [
    ...previousBookings.rows.map((row) => row.transaction_id),
  ];

  const uniq = [...new Set(allReviewsTids)];

  // Query to check reviews data of the user if exists.
  const reviewsQ = `SELECT * FROM court_reviews WHERE transaction_id = ANY($1::text[])`;
  const reviewsR = await db.query(reviewsQ, [uniq]);

  // Query to get details of all courts in one go
  const detailsQuery = "SELECT * FROM courts WHERE id = ANY($1::int[])";
  const detailsRes = await db.query(detailsQuery, [allCourtIds]);

  // Query to get images of all courts in one go
  const imagesQuery =
    "SELECT * FROM court_images WHERE court_id = ANY($1::int[])";
  const imagesRes = await db.query(imagesQuery, [allCourtIds]);

  // Appending the reviews data into a js object
  const reviewDetailsMap = {};
  previousBookings.rows.forEach((row) => {
    reviewsR.rows.forEach((reviewRow) => {
      if (row.transaction_id == reviewRow.transaction_id) {
        reviewDetailsMap[row.transaction_id] = reviewRow;
      }
    });
  });

  // Query to get details of all booking details in one go
  const bookingDetailsQuery =
    "SELECT * FROM booking_details WHERE id = ANY($1::int[])";
  const bookingDetailsRes = await db.query(bookingDetailsQuery, [
    allBookingDetailIds,
  ]);

  // Create a mapping of court IDs to court details
  const courtDetailsMap = {};
  detailsRes.rows.forEach((court) => {
    courtDetailsMap[court.id] = court;
  });

  // Create a mapping of court IDs to court details
  const imagesDetailMap = {};
  imagesRes.rows.forEach((image) => {
    imagesDetailMap[image.court_id] = image;
  });

  // Create a mapping of booking detail IDs to booking details
  const bookingDetailsMap = {};
  bookingDetailsRes.rows.forEach((detail) => {
    bookingDetailsMap[detail.id] = detail;
  });

  // Attach court details and booking details to today's bookings
  const todaysBookingsWithDetails = todaysBookings.rows.map((booking) => ({
    ...booking,
    courtDetails: courtDetailsMap[booking.court_id] || null,
    bookingDetails: bookingDetailsMap[booking.booking_detail_id] || null,
  }));

  // Attach court details and booking details to previous bookings
  const previousBookingsWithDetails = previousBookings.rows.map((booking) => ({
    ...booking,
    reviewDetails: reviewDetailsMap[booking.transaction_id] || null,
    courtDetails: courtDetailsMap[booking.court_id] || null,
    bookingDetails: bookingDetailsMap[booking.booking_detail_id] || null,
  }));

  // Attach court details and booking details to upcoming bookings
  const upcomingBookingsWithDetails = upcomingBookings.rows.map((booking) => ({
    ...booking,
    courtDetails: courtDetailsMap[booking.court_id] || null,
    bookingDetails: bookingDetailsMap[booking.booking_detail_id] || null,
    imagesData: imagesDetailMap[booking.court_id] || null,
  }));

  // Return the bookings with details
  return {
    todaysBookings: todaysBookingsWithDetails,
    previousBookings: previousBookingsWithDetails,
    upcomingBookings: upcomingBookingsWithDetails,
    totalCount: prevBookingsCount,
  };
};

module.exports = { getBookingsByUserId };
