const db = require("../../../config/database");

const getCoupons = async (req, res) => {
  const { adminId } = req.params;

  try {
    const getCouponsQuery = await db.query(
      `
            SELECT court_coupons.*,
            json_build_object(
                'court_id', courts.court_id,
                'admin_id', courts.admin_id,
                'court_name', courts.court_name,
                'court_type', courts.court_type
            ) AS court_info
            FROM court_coupons
            JOIN courts ON courts.id = court_coupons.court_id
            WHERE court_coupons.admin_id = $1
            AND start_time <= NOW()
            AND end_time >= NOW()
        `,
      [adminId]
    );
    if (getCouponsQuery.rows.length === 0) {
      return res.status(404).json({ message: "No Coupons Data found" });
    }
    res
      .status(200)
      .json({
        message: "Coupons Data found",
        couponsData: getCouponsQuery.rows,
      });
    console.log();
  } catch (error) {
    console.log(error);
  }
};

module.exports = getCoupons;
