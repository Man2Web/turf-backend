const db = require("../config/database");

const getAdmins = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM admins");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getAdmins,
};
