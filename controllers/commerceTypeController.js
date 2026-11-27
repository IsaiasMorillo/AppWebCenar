const commerceTypeService = require("../services/commerceTypeService");
const handle = require("../utils/handle");

const BASE = "/admin/commerce-types";

exports.list = handle("/admin", async (req, res) => {
  res.render("admin/list-commerce-types", {
    title: "Tipos de comercio",
    types: await commerceTypeService.listWithCount(),
  });
});

exports.getCreate = (req, res) => {
  res.render("admin/commerce-type-form", { title: "Crear tipo de comercio", isEdit: false });
};

exports.postCreate = handle(`${BASE}/create`, async (req, res) => {
  await commerceTypeService.create(req.body, req.file);
  req.flash("success", "Tipo de comercio creado");
  res.redirect(BASE);
});

exports.getEdit = handle(BASE, async (req, res) => {
  const type = await commerceTypeService.getById(req.params.id);
  if (!type) return res.redirect(BASE);
  res.render("admin/commerce-type-form", { title: "Editar tipo de comercio", isEdit: true, type });
});

exports.postEdit = handle(BASE, async (req, res) => {
  await commerceTypeService.update(req.params.id, req.body, req.file);
  req.flash("success", "Tipo de comercio actualizado");
  res.redirect(BASE);
});

exports.getDelete = handle(BASE, async (req, res) => {
  const type = await commerceTypeService.getById(req.params.id);
  if (!type) return res.redirect(BASE);
  res.render("admin/commerce-type-delete", { title: "Eliminar tipo de comercio", type });
});

exports.postDelete = handle(BASE, async (req, res) => {
  if (await commerceTypeService.remove(req.params.id)) {
    req.flash("success", "Tipo de comercio eliminado");
  }
  res.redirect(BASE);
});