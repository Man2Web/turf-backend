const db = require("../../config/database");

const approveCourtWithId = async (req, res) => {
  const { courtId } = req.params;
  const { status } = req.body;

  try {
    const approveCourtQ = `UPDATE courts SET approved = ${
      status ? "TRUE" : "FALSE"
    } WHERE id = $1`;
    const approveCourtR = await db.query(approveCourtQ, [courtId]);

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
