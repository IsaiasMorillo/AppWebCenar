const { validationResult } = require("express-validator");
const fs = require("fs");

const removeUploaded = (req) => {
  const files = req.file ? [req.file] : [];
  files.forEach((f) => fs.unlink(f.path, () => {}));
};

module.exports = (redirectTo) => (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  removeUploaded(req);
  req.flash("errors", result.array().map((e) => e.msg));
  const target = typeof redirectTo === "function" ? redirectTo(req) : redirectTo;
  res.redirect(target);
};