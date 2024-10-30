const {
  getBookingsByUserId,
} = require("../../models/bookings/getBookingsByUserId");
const {
  checkUserExistsWithId,
} = require("../../models/users/checkUserExistsWithId");

const fetchBookingsWithUserId = async (req, res) => {
  const { userId } = req.params;
  const { limit, offset } = req.query;

  // Check if the user is an admin
  const userExists = await checkUserExistsWithId(userId);

  if (userExists.length === 0) {
    return res.status(404).json({ message: "User Not Found" });
  }

  // Fetch categorized booking data (today's, previous, upcoming)
  const { previousBookings, upcomingBookings, totalCount } =
    await getBookingsByUserId(userId, limit, offset);

  // Check if there are no bookings in any of the categories
  if (
    previousBookings.length === 0 &&
    upcomingBookings.length === 0 &&
    totalCount === 0
  ) {
    return res.status(201).json({ message: "No Booking Data found" });
  }

  // Return the categorized booking data
  return res.status(200).json({
    message: "Booking Data found",
    previousBookings,
    upcomingBookings,
    totalCount,
  });
};

module.exports = fetchBookingsWithUserId;
