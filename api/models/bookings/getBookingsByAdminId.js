const db = require("../../config/database");

const getBookingsByAdminId = async (adminId) => {
  const today = new Date();
  const todaysDate = today.toISOString().split("T")[0]; // Get the current date in 'YYYY-MM-DD' format

  // Query to get today's bookings
  const todaysBookingQuery = `
    SELECT * FROM bookings 
    WHERE admin_id = $1 
    AND booking_date = $2
  `;

  // Query to get previous bookings (before today)
  const previousBookingQuery = `
    SELECT * FROM bookings 
    WHERE admin_id = $1 
    AND booking_date < $2
  `;

  // Query to get upcoming bookings (after today)
  const upcomingBookingQuery = `
    SELECT * FROM bookings 
    WHERE admin_id = $1 
    AND booking_date > $2
  `;

  // Execute all queries concurrently using Promise.all
  const [todaysBookings, previousBookings, upcomingBookings] =
    await Promise.all([
      db.query(todaysBookingQuery, [adminId, todaysDate]),
      db.query(previousBookingQuery, [adminId, todaysDate]),
      db.query(upcomingBookingQuery, [adminId, todaysDate]),
    ]);

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

  // Query to get details of all courts in one go
  const detailsQuery = "SELECT * FROM courts WHERE id = ANY($1::int[])"; // Assuming court_id is an integer
  const detailsRes = await db.query(detailsQuery, [allCourtIds]);

  // Query to get details of all booking details in one go
  const bookingDetailsQuery =
    "SELECT * FROM booking_details WHERE id = ANY($1::int[])"; // Assuming booking_detail_id is an integer
  const bookingDetailsRes = await db.query(bookingDetailsQuery, [
    allBookingDetailIds,
  ]);

  // Mapping the court location
  const locationDetailsMap = {};
  const locationDetailsQuery =
    "SELECT * FROM locations WHERE id = ANY($1::int[])";
  const locationDetailsRes = await db.query(locationDetailsQuery, [
    allBookingDetailIds,
  ]);
  locationDetailsRes.rows.forEach((location) => {
    locationDetailsMap[location.court_id] = location;
  });

  // Create a mapping of court IDs to court details
  const courtDetailsMap = {};
  detailsRes.rows.forEach((court) => {
    console.log(court);
    courtDetailsMap[court.id] = court; // Assuming court has an 'id' field
  });

  // Create a mapping of booking detail IDs to booking details
  const bookingDetailsMap = {};
  bookingDetailsRes.rows.forEach((detail) => {
    bookingDetailsMap[detail.id] = detail; // Assuming detail has an 'id' field
  });

  // Attach court details and booking details to today's bookings
  const todaysBookingsWithDetails = todaysBookings.rows.map((booking) => ({
    ...booking,
    courtDetails: courtDetailsMap[booking.court_id] || null, // Attach court details or null if not found
    bookingDetails: bookingDetailsMap[booking.booking_detail_id] || null, // Attach booking details or null if not found
    locationDetails: locationDetailsMap[booking.court_id] || null,
  }));

  // Attach court details and booking details to previous bookings
  const previousBookingsWithDetails = previousBookings.rows.map((booking) => ({
    ...booking,
    courtDetails: courtDetailsMap[booking.court_id] || null, // Attach court details or null if not found
    bookingDetails: bookingDetailsMap[booking.booking_detail_id] || null, // Attach booking details or null if not found
    locationDetails: locationDetailsMap[booking.court_id] || null,
  }));

  // Attach court details and booking details to upcoming bookings
  const upcomingBookingsWithDetails = upcomingBookings.rows.map((booking) => ({
    ...booking,
    courtDetails: courtDetailsMap[booking.court_id] || null, // Attach court details or null if not found
    bookingDetails: bookingDetailsMap[booking.booking_detail_id] || null, // Attach booking details or null if not found
    locationDetails: locationDetailsMap[booking.court_id] || null,
  }));
  console.log(todaysBookingsWithDetails);
  // Return the bookings if needed
  return {
    todaysBookings: todaysBookingsWithDetails,
    previousBookings: previousBookingsWithDetails,
    upcomingBookings: [...todaysBookingsWithDetails],
    upcomingBookingsWithDetails,
  };
};

module.exports = { getBookingsByAdminId };
