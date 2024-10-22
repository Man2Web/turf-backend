const {
  getBookingsByAdminId,
} = require("../../models/bookings/getBookingsByAdminId");
const {
  checkIfUserIsAdminWithId,
} = require("../../models/checkIfUserIsAdminWithId");

const fetchBookingsWithAdminId = async (req, res) => {
  const { adminId } = req.params;
  const {
    todayBookingSettings,
    upcomingBookingSettings,
    previousBookingSettings,
    limit,
  } = req.query;

  // Check if the user is an admin
  const isAdmin = await checkIfUserIsAdminWithId(adminId);
  if (!isAdmin) {
    return res.status(404).json({ message: "Admin Not Found" });
  }

  // Fetch categorized booking data (today's, previous, upcoming)
  const { todaysBookings, previousBookings, upcomingBookings, countData } =
    await getBookingsByAdminId(
      adminId,
      todayBookingSettings,
      upcomingBookingSettings,
      previousBookingSettings,
      limit
    );

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
    countData,
  });
};

module.exports = { fetchBookingsWithAdminId };
