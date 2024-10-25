const db = require("../../../config/database");

const addCoupon = async (req, res) => {
  const {
    courtId,
    adminId,
    couponCode,
    label,
    couponType,
    minCartValue,
    percentage,
    amount,
    startTime,
    endTime,
  } = req.body;
  try {
    const isSuperAdmin = await db.query(
      "SELECT super_admin FROM users WHERE id = $1",
      [adminId]
    );
    if (isSuperAdmin.rows[0].super_admin) {
      const addCouponQuery = `
          INSERT INTO court_coupons
          (court_id, coupon_code, coupon_label,
          percentage, amount, start_time, end_time,
          admin_Id, coupon_type, min_amount)
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id;
        `;
      const addCouponResult = await db.query(addCouponQuery, [
        null,
        couponCode,
        label,
        percentage || 0,
        amount,
        startTime,
        endTime,
        adminId,
        Number(couponType) === 0 ? true : false,
        minCartValue || 0,
      ]);
      // If coupon was successfully added
      if (addCouponResult.rows.length > 0) {
        return res.status(200).json({ message: "Coupon Added Successfully" });
      } else {
        return res.status(400).json({ message: "Error Adding Coupon" });
      }
    } else {
      return res.status(404).json({ message: "Invalid Request" });
    }
  } catch (error) {
    console.error(error);

    // Handle duplicate coupon code error (unique constraint violation)
    if (error.code === "23505") {
      return res.status(406).json({ message: "Coupon Code Already Exists" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = addCoupon;
