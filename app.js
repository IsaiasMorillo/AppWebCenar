const { port, mongoUri, sessionSecret, env } = require("./config/env"); // siempre primero
const path = require("path");
const express = require("express");
const hbs = require("hbs");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const commerceRoutes = require("./routes/commerceRoutes");
const clientRoutes = require("./routes/clientRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const homeByRole = require("./utils/homeByRole");
require("./models/User");
require("./models/CommerceType");
require("./models/Config");
require("./models/Category");
require("./models/Product");
require("./models/Address");
require("./models/Favorite");
require("./models/Order");

const app = express();

// Motor de plantillas (Handlebars). Busca views/layout.hbs automáticamente.
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Parseo de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos (css, js, uploads)
app.use(express.static(path.join(__dirname, "public")));

// Sesiones guardadas en MongoDB
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 horas
  })
);

// Flash + variables disponibles en todas las vistas
app.use(flash());
app.use((req, res, next) => {
  const user = req.session.user || null;
  res.locals.user = user;
  res.locals.isAdmin = user?.role === "admin";
  res.locals.isClient = user?.role === "client";
  res.locals.isCommerce = user?.role === "commerce";
  res.locals.isDelivery = user?.role === "delivery";
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  next();
});

console.log(typeof authRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/commerce", commerceRoutes);
app.use("/client", clientRoutes);
app.use("/delivery", deliveryRoutes);

// Raíz: al home del rol si hay sesión, si no al login
app.get("/", (req, res) => {
  res.redirect(req.session.user ? homeByRole(req.session.user.role) : "/login");
});

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port} (${env})`);
  });
});