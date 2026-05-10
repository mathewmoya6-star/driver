module.exports = function roles(allowed = []) {
  return (req, res, next) => {
    const role = req.profile?.role;

    if (!role) {
      return res.status(403).json({ error: "No role assigned" });
    }

    if (!allowed.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
