const Config = require("../models/Config");

exports.get = async () => (await Config.getConfig()).toObject();

exports.updateItbis = async (itbis) => {
  const config = await Config.getConfig();
  config.itbis = Number(itbis);
  await config.save();
  return config;
};