const getCourtByUid = require("../getCourtIdByUid");
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
  console.log(req.body);

  try {
    const court_id = await getCourtByUid(courtId);

    const isCourtAdmin = await db.query(
      "SELECT * FROM courts WHERE id = $1 AND admin_id = $2",
      [court_id, adminId]
    );

    if (isCourtAdmin.rows.length === 0) {
      return res.status(404).json({ message: "Invalid request" });
    }

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
      court_id,
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
