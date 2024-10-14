const db = require("../../config/database");

const updateUserReview = async (req, res) => {
  const { title, description, rating, court_id, user_id, transaction_id } =
    req.body;

  try {
    // Update the review in the database
    const updateReviewQuery = `
      UPDATE court_reviews
      SET title = $1, description = $2, rating = $3
      WHERE court_id = $4 AND transaction_id = $5 AND user_id = $6
      RETURNING *;`; // Return the updated review

    const updateReviewRes = await db.query(updateReviewQuery, [
      title,
      description,
      rating,
      court_id,
      transaction_id,
      user_id,
    ]);

    // If no rows were updated, return a 404
    if (updateReviewRes.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Send the updated review as a response
    res.status(200).json(updateReviewRes.rows[0]); // Respond with the updated review
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateUserReview;
