require("./config/env"); // carga .env según NODE_ENV
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/database");
const User = require("./models/User");
const Config = require("./models/Config");
const CommerceType = require("./models/CommerceType");

// ---- Cambia estos datos a tu gusto ----
const ADMIN = {
  firstName: "Admin",
  lastName: "Principal",
  idCard: "00100000001",
  email: "admin@appcenar.com",
  username: "admin",
  password: "Admin123*",
};

const TYPES = [
  { name: "Restaurantes", description: "Comida preparada y a domicilio" },
  { name: "Supermercados", description: "Víveres y productos del hogar" },
  { name: "Bebidas", description: "Licores, refrescos y agua" },
  { name: "Café y postres", description: "Cafeterías, panaderías y repostería" },
  { name: "Farmacias", description: "Medicinas y cuidado personal" },
  { name: "Tiendas", description: "Variedad de productos" },
];
// ---------------------------------------

const run = async () => {
  await connectDB();

  // Admin
  const adminExists = await User.findOne({ role: "admin", username: ADMIN.username });
  if (!adminExists) {
    await User.create({
      role: "admin",
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
      idCard: ADMIN.idCard,
      email: ADMIN.email,
      username: ADMIN.username,
      password: await bcrypt.hash(ADMIN.password, 10),
      isActive: true,
    });
    console.log(`Admin creado: ${ADMIN.username} / ${ADMIN.password}`);
  } else {
    console.log("Admin ya existía");
  }

  // Config (ITBIS 18%)
  const config = await Config.getConfig();
  console.log(`Config lista (ITBIS ${config.itbis}%)`);

  // Tipos de comercio
  for (const t of TYPES) {
    const exists = await CommerceType.findOne({ name: t.name });
    if (!exists) {
      await CommerceType.create({ ...t, icon: "/uploads/icons/default.png" });
      console.log(`Tipo creado: ${t.name}`);
    }
  }

  await mongoose.disconnect();
  console.log("Seed terminado");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});