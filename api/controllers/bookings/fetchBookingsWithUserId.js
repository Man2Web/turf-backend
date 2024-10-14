const {
  getBookingsByAdminId,
} = require("../../models/bookings/getBookingsByAdminId");
const {
  getBookingsByUserId,
} = require("../../models/bookings/getBookingsByUserId");
const {
  checkIfUserIsAdminWithId,
} = require("../../models/checkIfUserIsAdminWithId");

const fetchBookingsWithUserId = async (req, res) => {
  const { adminId } = req.params;

  // Check if the user is an admin
  const isAdmin = await checkIfUserIsAdminWithId(adminId);
  if (!isAdmin) {
    return res.status(404).json({ message: "Admin Not Found" });
  }

  // Fetch categorized booking data (today's, previous, upcoming)
  const { todaysBookings, previousBookings, upcomingBookings } =
    await getBookingsByUserId(adminId);

  // Check if there are no bookings in any of the categories
  if (
    todaysBookings.length === 0 &&
    previousBookings.length === 0 &&
    upcomingBookings.length === 0
  ) {
    return res.status(201).json({ message: "No Booking Date found" });
  }

  // Return the categorized booking data
  return res.status(200).json({
    message: "Booking Data found",
    todaysBookings,
    previousBookings,
    upcomingBookings,
  });
};

module.exports = { fetchBookingsWithUserId };
