// Function to add hours to the time
const getSlotDurationInHrs = (bookingTime, duration) => {
  // Create a new date object from the booking time
  const [hours, minutes, seconds] = bookingTime.split(":").map(Number);

  // Create a new Date object for the booking time
  const bookingDate = new Date();
  bookingDate.setHours(hours, minutes, seconds);

  // Add the duration (in hours)
  bookingDate.setHours(bookingDate.getHours() + duration);

  // Format the updated time back into HH:mm:ss format
  const updatedHours = String(bookingDate.getHours()).padStart(2, "0");
  const updatedMinutes = String(bookingDate.getMinutes()).padStart(2, "0");
  const updatedSeconds = String(bookingDate.getSeconds()).padStart(2, "0");

  return `${updatedHours}:${updatedMinutes}:${updatedSeconds}`;
};

module.exports = getSlotDurationInHrs;
