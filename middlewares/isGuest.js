const homeByRole = require("../utils/homeByRole");

module.exports = (req, res, next) => {
    if (req.session.userId) return res.redirect(homeByRole(req.session.user.role));
    next();
};