const db = require("../config/database");

const removeCourtWithId = async (courtId, userId) => {
    try {
        const removeQuery = "DELETE FROM courts WHERE id = $1 AND user_id = $2 RETURNING *";
        const result = await db.query(removeQuery, [courtId, userId]);
        
        // Optionally, check if any rows were deleted
        if (result.rowCount === 0) {
            console.log("No court found with the given ID for this user.");
        } else {
            console.log("Court successfully removed:", result.rows);
        }

    } catch (error) {
        console.error("Error removing court:", error);
        throw error;
    }
}

module.exports = { removeCourtWithId }
