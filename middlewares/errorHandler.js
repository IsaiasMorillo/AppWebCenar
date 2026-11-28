const multer = require("multer");
const homeByRole = require("../utils/homeByRole");

const fallback = (req) => (req.session?.user ? homeByRole(req.session.user.role) : "/login");

// 404
exports.notFound = (req, res) => {
  res.status(404).render("error", {
    title: "Página no encontrada",
    code: 404,
    message: "La página que buscas no existe.",
    back: fallback(req),
  });
};

// Errores de Express (4 parámetros: Express los reconoce así)
exports.errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Errores de subida de archivos
  const isUploadError =
    err instanceof multer.MulterError || err.message === "Solo se permiten imágenes";

  if (isUploadError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "La imagen no puede pesar más de 2 MB"
        : err.message === "Solo se permiten imágenes"
        ? "Solo se permiten archivos de imagen"
        : "No se pudo subir el archivo";

    req.flash("errors", message);
    return res.redirect(req.get("Referer") || fallback(req));
  }

  console.error(err);
  res.status(500).render("error", {
    title: "Error del servidor",
    code: 500,
    message: "Ocurrió un error inesperado. Intenta de nuevo.",
    back: fallback(req),
  });
};