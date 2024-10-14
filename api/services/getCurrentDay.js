const getCurrentDay = () => {
  const date = new Date();
  const weekday = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return weekday[date.getDay()];
};

module.exports = getCurrentDay;
