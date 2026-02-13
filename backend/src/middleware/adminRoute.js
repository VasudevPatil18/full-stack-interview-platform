export const adminRoute = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - no user found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - admin access required" });
    }

    next();
  } catch (error) {
    console.error("Error in adminRoute middleware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
