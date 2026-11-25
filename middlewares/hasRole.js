const homeByRole = require("../utils/homeByRole");

module.exports = (...roles) => (req, res, next) => {
    if(!roles.includes(req.session.user.role)) {
        return res.redirect(homeByRole(req.session.user.role));
    }
    next();
};