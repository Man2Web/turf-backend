const db = require("../../config/database");

const getCourtByUid = async (uuid) => {
  try {
    const getCourtId = await db.query(
      "SELECT * FROM courts WHERE court_id = $1 AND approved = TRUE",
      [uuid]
    );
    return getCourtId.rows[0].id;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = getCourtByUid;
