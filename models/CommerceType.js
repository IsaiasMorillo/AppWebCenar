const mongoose = require("mongoose");

const commerceTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, required: true }, // ruta del archivo subido con Multer
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommerceType", commerceTypeSchema);