const User = require("../models/User");

module.exports = async (req, res, next) => {

  if (!req.session.user) return res.redirect("/login");

  try {
    const user = await User.findById(req.session.user._id).select("isActive role");

    if (!user || !user.isActive) {
      return req.session.destroy(() => res.redirect("/login"));
    }
    next();
  } catch (error) {
    next(error);
  }
};