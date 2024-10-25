const db = require("../../config/database");
const getCourtByUid = require("../court/getCourtIdByUid");

const approveCourtWithId = async (req, res) => {
  const { courtId } = req.params;
  const { status } = req.body;

  try {
    const getCourtID = await db.query(
      "SELECT id FROM courts WHERE court_id = $1",
      [courtId]
    );
    const court_Id = getCourtID.rows[0].id;
    if (!court_Id) {
      return res.status(404).json({ message: "Invalid Court ID" });
    }

    const approveCourtQ = `UPDATE courts SET approved = ${
      status ? "TRUE" : "FALSE"
    } WHERE id = $1`;
    const approveCourtR = await db.query(approveCourtQ, [court_Id]);

    // Check if the court was found and updated
    if (approveCourtR.rowCount > 0) {
      status
        ? res.json({
            message: "Court approved successfully",
          })
        : res.json({
            message: "Court access revoked successfully",
          });
    } else {
      res.status(404).json({
        message: "Court not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Could not update the approval status of the court",
      error: error.message,
    });
  }
};

module.exports = approveCourtWithId;
