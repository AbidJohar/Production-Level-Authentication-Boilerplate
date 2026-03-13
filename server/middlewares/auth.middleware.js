import jwt from "jsonwebtoken";
 
const authMiddleware = (req, res, next) => {


  const token = req.cookies?.accessToken;
    console.log("token:", token);
    

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: no access token.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACESSTOKEN_SECRET);
    req.user = { userId: decoded.id };
    next();
  } catch (err) {
     console.log("Token Error:",err);
    // Distinguish between expired and outright invalid so logs are useful.
    // Both return 401 — the frontend interceptor will silently refresh on either.
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Access token expired.",
      });
    }

    return res.status(401).json({
      status: "error",
      message: "Invalid access token.",
    });
  }
};

export default authMiddleware;