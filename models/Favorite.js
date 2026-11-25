const mongoose = require('mongoose');

const favoriteSechema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    commerce: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    }, { timestamps: true });

// Un cliente no puede marcar dos veces el mismo comercio
favoriteSechema.index({ user: 1, commerce: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSechema);