const formatTime = (time) => {
  if (time) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert to 12-hour format
    return `${formattedHour}:${minutes} ${suffix}`;
  }
  return "0:00 AM";
};

module.exports = formatTime;
