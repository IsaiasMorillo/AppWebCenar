const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    itbis: { type: Number, required: true, min: 0, max: 100, default: 18 },
  },
  { timestamps: true }
);

// Devuelve la configuración; si no existe, la crea con valores por defecto
configSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) config = await this.create({});
  return config;
};

module.exports = mongoose.model("Config", configSchema);