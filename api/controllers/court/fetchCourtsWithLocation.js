const db = require("../../config/database");
const convertCourtData = require("../../services/convertCourtData");
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

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }

  try {
    const formattedCourtName = courtName ? `%${courtName}%` : null; // Ensure it's either a wildcard string or null

    const filteringQuery = `
    SELECT 
    court_details.*, 
        json_build_object(
          'court_id', courts.court_id,
          'admin_id', courts.admin_id,
          'court_name', courts.court_name,
          'court_type', courts.court_type
        ) AS court_info,
        (
          SELECT COUNT(*) 
          FROM court_details 
          JOIN courts ON courts.id = court_details.court_id
          WHERE city = $1 
          AND ($2::VARCHAR IS NULL OR courts.court_type = $2::VARCHAR)   -- Cast to VARCHAR
          AND ($3::VARCHAR IS NULL OR LOWER(courts.court_name) LIKE LOWER($3::VARCHAR))  -- Cast to VARCHAR
          AND ($4::BIGINT IS NULL OR price >= $4::BIGINT)                       -- Cast to BIGINT
          AND ($5::BIGINT IS NULL OR price <= $5::bigint)                       -- Cast to BIGINT
          AND ($6::BIGINT IS NULL OR guests >= $6::bigint)                      -- Cast to BIGINT
          AND ($7::BIGINT IS NULL OR guests = $7::bigint)                       -- Cast to BIGINT
        ) AS total_count
      FROM court_details 
      JOIN courts ON courts.id = court_details.court_id
      WHERE city = $1 
      AND ($2::VARCHAR IS NULL OR courts.court_type = $2::VARCHAR)   -- Cast to VARCHAR
      AND ($3::VARCHAR IS NULL OR LOWER(courts.court_name) LIKE LOWER($3::VARCHAR))    -- Cast to VARCHAR
      AND ($4::BIGINT IS NULL OR price >= $4::BIGINT)                         -- Cast to BIGINT
      AND ($5::BIGINT IS NULL OR price <= $5::bigint)                         -- Cast to BIGINT
      AND ($6::BIGINT IS NULL OR guests >= $6::bigint)                        -- Cast to BIGINT
      AND ($7::BIGINT IS NULL OR guests = $7::bigint)                         -- Cast to BIGINT
      LIMIT $8::integer OFFSET $9::integer;                           -- Cast to INTEGER
    `;

    const courtsData = await db.query(filteringQuery, [
      location,
      sportType || null, // If sportType is undefined or empty, it should be null
      formattedCourtName, // Directly use formattedCourtName, it’s already handled above
      Number(minPrice) || null,
      Number(maxPrice) || null,
      Number(minGuest) || null,
      Number(maxGuest) || null,
      parseInt(limit), // Pagination limit as integer
      parseInt(offset), // Pagination offset as integer
    ]);

    if (courtsData.rows.length === 0) {
      res.status(404).json({ message: "No Courts found" });
    }

    const updatedCourtsData = courtsData.rows.map((court) => {
      return convertCourtData(court);
    });

    const totalDataCount = courtsData.rows[0]?.total_count || 0;

    res.status(200).json({
      message: "Success",
      updatedCourtsData,
      pagination: {
        totalCount: totalDataCount,
      },
    });
  } catch (error) {
    console.error("Error in transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { fetchCourtsWithLocation };
