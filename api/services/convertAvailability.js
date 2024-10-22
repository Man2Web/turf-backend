const convertAvailability = (data) => {
  try {
    const availabilityArray = [];

    // Define a mapping of days to their corresponding indices
    const dayMap = {
      sunday: 0, // Sunday is now 0
      monday: 1, // Monday is now 1
      tuesday: 2, // Tuesday is now 2
      wednesday: 3, // Wednesday is now 3
      thursday: 4, // Thursday is now 4
      friday: 5, // Friday is now 5
      saturday: 6, // Saturday is now 6
    };

    // Iterate through each day's availability
    for (const day in data) {
      const { duration, startTime, endTime } = data[day];

      // Extract the duration in hours and convert to a number
      const durationHours = parseInt(duration.split(" ")[0], 10); // Extracts the numeric part

      // Push the data into the availabilityArray
      availabilityArray.push([dayMap[day], durationHours, startTime, endTime]);
    }

    // console.log(availabilityArray); // Output the final array
    return availabilityArray; // Return the final array
  } catch (error) {
    console.error(error);
  }
};

module.exports = convertAvailability;
