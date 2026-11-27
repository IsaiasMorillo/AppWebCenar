const fs = require("fs");
const path = require("path");

module.exports = (publicPath) => {
  if (!publicPath || publicPath.endsWith("default.png")) return;
  fs.unlink(path.join(__dirname, "..", "public", publicPath), () => {});
};