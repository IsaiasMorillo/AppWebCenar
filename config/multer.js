const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUpload = (folder) => {
  const dir = path.join(__dirname, "..", "public", "uploads", folder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Solo se permiten imágenes"));
  };

  return multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2 MB
};

module.exports = {
  uploadUser: createUpload("users"),
  uploadLogo: createUpload("logos"),
  uploadProduct: createUpload("products"),
  uploadIcon: createUpload("icons"),
};