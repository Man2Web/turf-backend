const db = require("../config/database");
const convertCourtData = require("../services/convertCourtData");

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
      `SELECT courts.*, court_details.*,
          json_build_object(
            'court_id', courts.court_id,           -- corrected from courts.court_id to courts.id
            'admin_id', courts.admin_id,
            'court_name', courts.court_name,
            'court_type', courts.court_type
          ) AS court_info
       FROM courts 
       JOIN court_details ON court_details.court_id = courts.id 
       WHERE courts.id = $1`,
      [court__Id]
    );

    const convertedCourtData = convertCourtData(getCourtDataQuery.rows[0]);

    // Send back the court data
    res.status(200).json({
      message: "Success",
      courtData: convertedCourtData,
    });
  } catch (error) {
    console.error("Error fetching court:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { fetchCourtWithCourtId };
