const isAdmin = (req, res, next) => {
  const raw = process.env.ADMIN_EMAILS || "";
  const admins = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!req.user?.email) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (!admins.includes(String(req.user.email).toLowerCase())) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

module.exports = { isAdmin };

