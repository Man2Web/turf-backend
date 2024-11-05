const jwt = require("jsonwebtoken");
const checkUserWithIdAndEmail = require("../../models/users/checkUserWithIdAndEmail");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email } = decoded;
    const checkUser = await checkUserWithIdAndEmail(userId, email);
    if (checkUser.length === 0) {
      return res.status(401).json({ message: "Access Denied" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
