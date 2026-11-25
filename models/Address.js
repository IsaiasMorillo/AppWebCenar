const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: {
        type: String, required: true, trim: true
    },
    description: {
        type: String, required: true, trim: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);