import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

  // console.log("token:", token);
  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = { userId: decoded.id, };
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

export default authMiddleware;
