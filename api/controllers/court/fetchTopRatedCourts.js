const db = require("../../config/database");
const convertCourtData = require("../../services/convertCourtData");

const fetchTopRatedCourts = async (req, res) => {
  const { location } = req.params;
  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }

  try {
    const filteringQuery = `
    SELECT 
        court_details.*, 
        json_build_object(
            'court_id', courts.court_id,
            'admin_id', courts.admin_id,
            'court_name', courts.court_name,
            'court_type', courts.court_type,
            'featured', courts.featured
        ) AS court_info,
        jsonb_build_object(
            'coupon_code', court_coupons.coupon_code,
            'coupon_label', court_coupons.coupon_label,
            'created_at', court_coupons.created_at,
            'percentage', court_coupons.percentage,
            'amount', court_coupons.amount,
            'start_time', court_coupons.start_time,
            'end_time', court_coupons.end_time,
            'admin_id', court_coupons.admin_id,
            'coupon_type', court_coupons.coupon_type,
            'min_amount', court_coupons.min_amount,
            'status', court_coupons.status
        ) AS coupon_data
    FROM court_details 
    JOIN courts ON courts.id = court_details.court_id
    LEFT JOIN court_coupons ON courts.id = court_coupons.court_id
    WHERE city = $1 AND APPROVED = TRUE
    AND EXISTS (
        SELECT 1 FROM court_reviews
        WHERE court_reviews.court_id = courts.id
        GROUP BY court_reviews.court_id
        HAVING AVG(court_reviews.rating) > 3
    )
    LIMIT 10;
`;

    const courtsData = await db.query(filteringQuery, [location]);
    const updatedCourtsData = courtsData.rows.map((court) => {
      return convertCourtData(court);
    });
    res.status(200).json({
      message: "Success",
      updatedCourtsData,
    });
  } catch (error) {
    console.error("Error in transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = fetchTopRatedCourts;
