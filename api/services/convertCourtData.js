const convertCourtData = (data, courtName) => {
  // Extract relevant data
  const {
    // court_id,
    images,
    email,
    phone_number,
    city,
    location_link,
    embedded_link,
    price,
    guests,
    add_guests,
    availability,
    add_price,
    rules,
    overview,
    includes,
    amenities,
    advance_pay,
  } = data;

  // Build the court object
  const court = {
    court_id: data.court_info.court_id,
    court_name: data.court_info.court_name, // Assuming court_name is same as id for this example
    admin_id: data.court_info.admin_id, // Assuming court_name is same as id for this example
    court_type: "Badminton", // Replace this with the actual court type if available
    venue_overview: overview,
    rules_of_venue: rules,
    email,
    phone_number,
    approved: data.court_info.approved || false, // Assuming all courts are approved, replace accordingly
    location: {
      country: "India", // Set the country as required
      city,
      location_link,
      embedded_link,
    },
    pricing: {
      starting_price: price,
      guests,
      additional_guests: add_guests,
      price_of_additional_guests: add_price,
      advance_pay,
    },
    includes,
    amenities,
    availability,
    images,
  };
  //   console.log(court);
  return court;
};

module.exports = convertCourtData;
