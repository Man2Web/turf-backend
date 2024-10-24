const getCourtByUid = require("../getCourtIdByUid");
const db = require("../../../config/database");

const getCourtCoupons = async (req, res) => {
  const { courtId } = req.params;
  try {
    const court_Id = await getCourtByUid(courtId);
    if (!court_Id) {
      return res.status(404).json({ message: "Invalid Request" });
    }

    const courtCouponsQuery = `
        SELECT coupon_code, coupon_label, percentage, amount, coupon_type, 
        min_amount FROM court_coupons WHERE court_id = $1 
        AND start_time <= NOW() AND end_time >= NOW() AND status = TRUE`;

    const courtCouponsRes = await db.query(courtCouponsQuery, [court_Id]);
    if (courtCouponsRes.rows.length === 0) {
      return res.status(404).json({ message: "No Coupons Found" });
    }
    res
      .status(200)
      .json({ message: "Coupons Data Found", coupons: courtCouponsRes.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getCourtCoupons;
