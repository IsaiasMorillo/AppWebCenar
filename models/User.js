const mongoose = require("mongoose");

const ROLES = ["client", "delivery", "commerce", "admin"];

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ROLES, required: true },

    // Comunes
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hash con bcrypt
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: false }, // se crea inactivo

    // Cliente, delivery y admin
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    photo: { type: String }, // foto de perfil

    // Admin
    idCard: { type: String, trim: true }, // cédula

    // Comercio
    commerceName: { type: String, trim: true },
    logo: { type: String },
    openingTime: { type: String }, // "08:00"
    closingTime: { type: String }, // "22:00"
    commerceType: { type: mongoose.Schema.Types.ObjectId, ref: "CommerceType" },

    // Delivery: disponible u ocupado
    deliveryStatus: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },

    // Tokens (activación de cuenta y reset de contraseña)
    activationToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
  },
  { timestamps: true }
);

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model("User", userSchema);