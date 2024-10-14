const db = require("../../config/database");
const getCurrentDay = require("../../services/getCurrentDay");

const fetchCourtsWithLocation = async (req, res) => {
  const { location } = req.params;
  const {
    courtName,
    minPrice,
    maxPrice,
    minGuest,
    maxGuest,
    amenities,
    sportType,
    limit,
    offset,
  } = req.query;

  // console.log(req.body);

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }

  const courtIdsData = [];

  const courtsData = [];
  let totalRowsCount;

  await db.query("BEGIN");

  try {
    if (courtName) {
      const formattedCourtName = `%${courtName}%`;

      let getCourtByLocationResult;
      let checkCountR;

      const getCourtByLocationQueryWithType = `
        SELECT * FROM courts 
        JOIN locations ON courts.id = locations.court_id 
        WHERE LOWER(courts.court_name) LIKE LOWER($1) 
        AND courts.court_type = $2 
        AND locations.city = $3 
        LIMIT $4 OFFSET $5
      `;

      const getCourtByLocationQuery = `
        SELECT * FROM courts 
        JOIN locations ON courts.id = locations.court_id 
        WHERE LOWER(courts.court_name) LIKE LOWER($1) 
        AND locations.city = $2 
        LIMIT $3 OFFSET $4
      `;

      const checkCountQWithType = `
        SELECT * FROM courts 
        JOIN locations ON courts.id = locations.court_id 
        WHERE LOWER(courts.court_name) LIKE LOWER($1) 
        AND courts.court_type = $2 
        AND locations.city = $3
      `;

      const checkCountQ = `
        SELECT * FROM courts 
        JOIN locations ON courts.id = locations.court_id 
        WHERE LOWER(courts.court_name) LIKE LOWER($1) 
        AND locations.city = $2
      `;

      if (sportType) {
        getCourtByLocationResult = await db.query(
          getCourtByLocationQueryWithType,
          [
            formattedCourtName,
            sportType,
            location,
            parseInt(limit), // pagination limit
            parseInt(offset), // pagination offset
          ]
        );

        checkCountR = await db.query(checkCountQWithType, [
          formattedCourtName,
          sportType,
          location,
        ]);

        totalRowsCount = checkCountR.rows.length;
      } else {
        getCourtByLocationResult = await db.query(getCourtByLocationQuery, [
          formattedCourtName,
          location,
          parseInt(limit), // pagination limit
          parseInt(offset), // pagination offset
        ]);

        checkCountR = await db.query(checkCountQ, [
          formattedCourtName,
          location,
        ]);

        totalRowsCount = checkCountR.rows.length;
      }

      // console.log(getCourtByLocationResult.rows);

      if (getCourtByLocationResult.rows.length === 0) {
        return res.status(404).json({ message: "No Courts Found" });
      }

      // Collect court IDs
      for (const court of getCourtByLocationResult.rows) {
        courtIdsData.push(court.court_id);
      }

      let getCourtsDataQuery;

      if (sportType) {
        getCourtsDataQueryWithType =
          "SELECT * FROM courts WHERE id = $1 AND court_type = $2";
      } else {
        getCourtsDataQuery = "SELECT * FROM courts WHERE id = $1";
      }

      for (const courtId of courtIdsData) {
        if (courtId) {
          try {
            const getCourtsDataResult = await db.query(getCourtsDataQuery, [
              courtId,
            ]);
            // Getting court data
            let courtData = getCourtsDataResult.rows[0];

            // Getting location data
            const getLocationQuery =
              "SELECT * FROM locations WHERE court_id = $1";
            const getLocationRes = await db.query(getLocationQuery, [courtId]);
            const locationData = getLocationRes.rows[0] || {};

            const getDurationQuery = `
              SELECT * FROM court_availability WHERE court_id = $1 AND day_of_week = $2
            `;

            const getDurationRes = await db.query(getDurationQuery, [
              courtId,
              getCurrentDay(),
            ]);

            const courtAvailabilityData = getDurationRes.rows[0] || {};

            // Prepare the pricing query
            let getPricingQuery = `SELECT * FROM venue_price WHERE court_id = $1`;
            const queryParams = [courtId];

            // Add conditions based on minPrice and maxPrice
            if (minPrice) {
              getPricingQuery += ` AND starting_price >= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(minPrice));
            }
            if (maxPrice) {
              getPricingQuery += ` AND starting_price <= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(maxPrice));
            }
            if (minGuest) {
              getPricingQuery += ` AND max_guests >= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(minGuest));
            }
            if (maxGuest) {
              getPricingQuery += ` AND max_guests <= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(maxGuest));
            }

            const getPricingRes = await db.query(getPricingQuery, queryParams);

            if (amenities) {
              const { parking, drinkingWater, firstAid, changeRoom, shower } =
                amenities;

              const amenitiesQuery = `SELECT * FROM amenities WHERE court_id = $1`;
              const amenitiesRes = await db.query(amenitiesQuery, [
                getPricingRes.rows[0]?.court_id,
              ]);
            }

            // Store the first row or an empty object if none found
            const courtPriceData = getPricingRes.rows[0] || {};

            if (Object.keys(courtPriceData).length > 0) {
              // Getting images data for the specific court
              const getImagesQuery =
                "SELECT * FROM court_images WHERE court_id = $1";
              const getImagesRes = await db.query(getImagesQuery, [courtId]);
              const courtImagesData = getImagesRes.rows || [];

              // Get images specific to this court
              // const courtImagesData = getImagesRes.rows[0] || []; // Use all images, or an empty array if none
              // console.log(courtData);
              // Combine all data into courtData
              courtData = {
                ...courtData,
                locationData,
                courtPriceData,
                courtImagesData,
                courtAvailabilityData,
              };

              courtsData.push(courtData);
            }
          } catch (error) {
            console.error(
              `Error fetching data for court ID ${courtId}:`,
              error
            );
          }
        }
      }

      // console.log(courtsData);
      await db.query("COMMIT");
    } else {
      let getCourtByLocationResult;

      if (sportType) {
        const getCourtByLocationQuery = `
        SELECT * FROM courts 
        JOIN locations ON courts.id = locations.court_id
        WHERE locations.city = $1 AND courts.court_type = $2 
        LIMIT $3 OFFSET $4
      `;

        getCourtByLocationResult = await db.query(getCourtByLocationQuery, [
          location, // $1: city
          sportType, // $2: court type
          parseInt(limit), // $3: limit
          parseInt(offset), // $4: offset
        ]);
      } else {
        // const getCourtByLocationQuery = `
        //   SELECT * FROM locations WHERE city = $1 LIMIT $2 OFFSET $3
        // `;
        const getCourtByLocationQuery = `
        SELECT * FROM courts 
        JOIN locations ON courts.id = locations.court_id
        WHERE courts.approved = TRUE AND locations.city = $1 
        LIMIT $2 OFFSET $3
      `;
        getCourtByLocationResult = await db.query(getCourtByLocationQuery, [
          location,
          parseInt(limit),
          parseInt(offset),
        ]);
      }

      const checkCountQ = `
      SELECT * FROM locations WHERE city = $1
    `;
      const checkCountR = await db.query(checkCountQ, [location]);

      totalRowsCount = checkCountR.rows.length;

      for (const court of getCourtByLocationResult.rows) {
        courtIdsData.push(court.court_id);
      }

      const getCourtsDataQuery = "SELECT * FROM courts WHERE id = $1";

      for (const courtId of courtIdsData) {
        if (courtId) {
          try {
            const getCourtsDataResult = await db.query(getCourtsDataQuery, [
              courtId,
            ]);
            let courtData = getCourtsDataResult.rows[0];

            const getLocationQuery =
              "SELECT * FROM locations WHERE court_id = $1";
            const getLocationRes = await db.query(getLocationQuery, [courtId]);
            const locationData = getLocationRes.rows[0] || {};

            const getDurationQuery = `
            SELECT * FROM court_availability WHERE court_id = $1 AND day_of_week = $2
          `;

            const getDurationRes = await db.query(getDurationQuery, [
              courtId,
              getCurrentDay(),
            ]);

            const courtAvailabilityData = getDurationRes.rows[0] || {};

            let getPricingQuery = `SELECT * FROM venue_price WHERE court_id = $1`;
            const queryParams = [courtId];

            if (minPrice) {
              getPricingQuery += ` AND starting_price >= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(minPrice));
            }
            if (maxPrice) {
              getPricingQuery += ` AND starting_price <= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(maxPrice));
            }
            if (minGuest) {
              getPricingQuery += ` AND max_guests >= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(minGuest));
            }
            if (maxGuest) {
              getPricingQuery += ` AND max_guests <= $${
                queryParams.length + 1
              }`;
              queryParams.push(parseFloat(maxGuest));
            }

            const getPricingRes = await db.query(getPricingQuery, queryParams);

            const courtPriceData = getPricingRes.rows[0] || {};

            if (Object.keys(courtPriceData).length > 0) {
              const getImagesQuery =
                "SELECT * FROM court_images WHERE court_id = $1";
              const getImagesRes = await db.query(getImagesQuery, [courtId]);
              const courtImagesData = getImagesRes.rows || [];

              courtData = {
                ...courtData,
                locationData,
                courtPriceData,
                courtImagesData,
                courtAvailabilityData,
              };

              courtsData.push(courtData);
            }
          } catch (error) {
            console.error(
              `Error fetching data for court ID ${courtId}:`,
              error
            );
          }
        }
      }

      await db.query("COMMIT");
    }

    courtsData.sort((a, b) => b.featured - a.featured);

    res.status(200).json({
      message: "Success",
      courtsData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        currentPage: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        nextOffset: parseInt(offset) + parseInt(limit),
        prevOffset: Math.max(0, parseInt(offset) - parseInt(limit)),
        totalCount: totalRowsCount,
      },
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { fetchCourtsWithLocation };
