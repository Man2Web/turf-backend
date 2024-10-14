const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express();

router.post("/", authMiddleware, (req, res) => {
  try {
    console.log(req.body);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
