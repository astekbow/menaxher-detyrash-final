const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId;            // ↔  përdoret te routes
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
