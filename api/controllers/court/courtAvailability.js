const db = require("../../config/database");
const getCourtByUid = require("./getCourtIdByUid");

const courtAvailability = async (req, res) => {
  const { courtId, date } = req.params; // Expecting the date in YYYY-MM-DD format
  //   console.log(date); // Corrected console.log to output the date for debugging

  try {
    const court_id = await getCourtByUid(courtId);

    if (!court_id) {
      return res.status(404).json({ message: "Court Not found" });
    }

    const availabilityQuery =
      "SELECT * FROM bookings WHERE booking_date = $1 AND court_id = $2";
    const availabilityCheck = await db.query(availabilityQuery, [
      date,
      court_id,
    ]);

    if (availabilityCheck.rows.length === 0) {
      // Return here to avoid sending multiple responses
      return res
        .status(200)
        .json({ message: "No slots booked in the mentioned time slot" });
    }

    // const bookedTimeSLots = availabilityCheck.rows.map((slot) => {
    //   return slot.booking_time.map((time) => {
    //     return time;
    //   });
    // });
    const bookedTimeSlots = [];
    availabilityCheck.rows.forEach((slot) => {
      slot.booking_time.forEach((time) => {
        bookedTimeSlots.push(time);
      });
      // bookedTimeSLots.push(slot.booked);
    });

    // If there are bookings, return the booked slots
    return res.status(200).json({
      message: "Fetched the booked slots",
      bookedTimeSlots,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    // Return here to avoid further execution after sending the error response
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = courtAvailability;
