const {
  checkIfUserIsAdminWithId,
} = require("../../models/admin/checkIfUserIsAdminWithId");
const { removeCourtWithId } = require("../../models/admin/removeCourtWithId");

const deleteCourt = async (req, res) => {
  const { courtId, adminId } = req.params;
  try {
    const isAdmin = await checkIfUserIsAdminWithId(adminId);

    if (isAdmin) {
      await removeCourtWithId(courtId, adminId);
      res.status(200).json({ message: "Court successfully removed." });
    } else {
      res.status(403).json({ error: "Not authorized to remove this court." });
    }
  } catch (error) {
    console.error("Error deleting court:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = deleteCourt;
