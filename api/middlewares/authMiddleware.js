const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log(req.headers.authorization);

  const token = req.header("Authorization");
  if (!token) {
    // const token = jwt.sign(
    //   { id: "random", username: "username" },
    //   process.env.JWT_SECRET,
    //   {
    //     expiresIn: "24h",
    //   }
    // );
    // res.json({
    //   message: "Login successful",
    //   token,
    //   user: {
    //     id: "random",
    //     username: "username",
    //   },
    // });
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
