const db = require("../../../config/database");

const removeCoupon = async (req, res) => {
  const { adminId, couponId } = req.params;
  try {
    const couponIsAdmin = await db.query(
      "SELECT * FROM court_coupons WHERE id = $1 AND admin_Id = $2",
      [couponId, adminId]
    );
    if (couponIsAdmin.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const removeCouponId = await db.query(
      "DELETE FROM court_coupons WHERE id = $1",
      [couponId]
    );
    if (removeCouponId.rowCount === 0) {
      return res.status(404).json({ message: "Invalid Coupon ID" });
    }
    res.status(200).json({ message: "Coupon Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = removeCoupon;
