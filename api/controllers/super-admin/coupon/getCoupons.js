const db = require("../../../config/database");

const superAdminCoupons = async (req, res) => {
  const { adminId } = req.params;
  try {
    const getCouponsQuery = await db.query(
      ` SELECT * FROM court_coupons
        WHERE court_coupons.admin_id = $1
        AND start_time <= NOW()
        AND end_time >= NOW()
      `,
      [adminId]
    );
    if (getCouponsQuery.rows.length === 0) {
      return res.status(404).json({ message: "No Coupons Data found" });
    }
    res.status(200).json({
      message: "Coupons Data found",
      couponsData: getCouponsQuery.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = superAdminCoupons;
