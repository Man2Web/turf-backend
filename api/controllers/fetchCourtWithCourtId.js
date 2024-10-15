const db = require("../config/database");

const fetchCourtWithCourtId = async (req, res) => {
  const { courtId } = req.params;

  let adminId;

  if (!courtId) {
    return res.status(400).json({ message: "Court ID is required" });
  }

  try {
    // get the id of the court.
    const getCourtId = await db.query(
      "SELECT * FROM courts WHERE court_id = $1 AND approved = TRUE",
      [courtId]
    );
    const court__Id = getCourtId.rows[0].id;
    if (!court__Id) {
      return res.status(404).json({ message: "Court not found" });
    }

    const getCourtDataQuery = await db.query(
      `SELECT courts.id, courts.*, 
        jsonb_build_object('city', locations.city, 'country', locations.country, 'location_link', locations.location_link, 'embed_link', locations.embed_link) AS locationData,
        jsonb_build_object('starting_price', venue_price.starting_price, 'max_guests', venue_price.max_guests, 'additional_guests', venue_price.additional_guests, 'price_of_additional_guests', venue_price.price_of_additional_guests, 'advance_pay', venue_price.advance_pay) AS venuePrice,
        jsonb_build_object('parking', amenities.parking, 'drinking_water', amenities.drinking_water, 'first_aid', amenities.first_aid, 'change_room', amenities.change_room, 'shower', amenities.shower) AS amenities,
        jsonb_build_object('badminton_racket', court_includes.badminton_racket, 'bats', court_includes.bats, 'hitting_machines', court_includes.hitting_machines, 'multiple_courts', court_includes.multiple_courts, 'spare_players', court_includes.spare_players, 'instant_racket', court_includes.instant_racket, 'green_turfs', court_includes.green_turfs) AS courtIncludes
      FROM courts
      INNER JOIN locations ON courts.id = locations.court_id
      INNER JOIN venue_price ON courts.id = venue_price.court_id
      INNER JOIN amenities ON courts.id = amenities.court_id
      INNER JOIN court_includes ON courts.id = court_includes.court_id
      WHERE courts.id = $1`,
      [court__Id]
    );
    console.log(getCourtDataQuery.rows);

    // Fetch the court availability time slots
    const timeSlotQuery =
      "SELECT * FROM court_availability WHERE court_id = $1";
    const timeSlotResult = await db.query(timeSlotQuery, [court__Id]);
    const timeSlotsData = timeSlotResult.rows;
    const filteredTimeSlots = timeSlotsData.map(
      ({ id, court_id, ...rest }) => rest
    );

    // console.log(timeSlotsData);

    // Fetch the court images
    const imagesQuery = "SELECT * FROM court_images WHERE court_id = $1";
    const imagesResult = await db.query(imagesQuery, [court__Id]);

    // console.log(imagesResult.rows);

    // Build the court object with all related data
    const courtData = {
      ...getCourtDataQuery.rows[0],
      time_Slots: filteredTimeSlots,
      images: imagesResult.rows,
    };

    // Send back the court data
    res.status(200).json({
      message: "Success",
      court: courtData,
    });
  } catch (error) {
    console.error("Error fetching court:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { fetchCourtWithCourtId };
