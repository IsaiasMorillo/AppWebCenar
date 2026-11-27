const mongoose = require("mongoose");
const commerceProfileService = require("../services/commerceProfileService");
const categoryService = require("../services/categoryService");
const handle = require("../utils/handle");

const CATEGORIES = "/commerce/categories";
const commerceId = (req) => new mongoose.Types.ObjectId(req.session.user._id);

// ---------- Perfil ----------
exports.getProfile = handle("/commerce", async (req, res) => {
  const commerce = await commerceProfileService.getProfile(req.session.user._id);
  res.render("commerce/profile", { title: "Perfil del comercio", commerce });
});

exports.postProfile = handle("/commerce/profile", async (req, res) => {
  await commerceProfileService.updateProfile(req.session.user._id, req.body, req.file);
  req.flash("success", "Perfil actualizado");
  res.redirect("/commerce/profile");
});

// ---------- Categorías ----------
exports.listCategories = handle("/commerce", async (req, res) => {
  res.render("commerce/list-categories", {
    title: "Categorías",
    categories: await categoryService.listWithCount(commerceId(req)),
  });
});

exports.getCreateCategory = (req, res) => {
  res.render("commerce/category-form", { title: "Crear categoría", isEdit: false });
};

exports.postCreateCategory = handle(`${CATEGORIES}/create`, async (req, res) => {
  await categoryService.create(commerceId(req), req.body);
  req.flash("success", "Categoría creada");
  res.redirect(CATEGORIES);
});

exports.getEditCategory = handle(CATEGORIES, async (req, res) => {
  const category = await categoryService.getById(req.params.id, commerceId(req));
  if (!category) return res.redirect(CATEGORIES);
  res.render("commerce/category-form", { title: "Editar categoría", isEdit: true, category });
});

exports.postEditCategory = handle(CATEGORIES, async (req, res) => {
  await categoryService.update(req.params.id, commerceId(req), req.body);
  req.flash("success", "Categoría actualizada");
  res.redirect(CATEGORIES);
});

exports.getDeleteCategory = handle(CATEGORIES, async (req, res) => {
  const category = await categoryService.getById(req.params.id, commerceId(req));
  if (!category) return res.redirect(CATEGORIES);
  res.render("commerce/category-delete", { title: "Eliminar categoría", category });
});

exports.postDeleteCategory = handle(CATEGORIES, async (req, res) => {
  if (await categoryService.remove(req.params.id, commerceId(req))) {
    req.flash("success", "Categoría eliminada");
  }
  res.redirect(CATEGORIES);
});