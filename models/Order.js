const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
    name: {
        type: String, required: true},
    price: {
        type: Number, required: true},
        image: {
        type: String},
        }, {_id: false}
    );

    const orderSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    commerce: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    delivery: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", default: null},
    
    address: {
        name: {
            type: String, required: true},
        description: { 
            type: String, required: true},
    },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },

    subtotal: { type: Number, required: true},
    itbis: { type: Number, required: true},
    total: { type: Number, required: true},

    status: {
        type: String, 
        enum: ['pending', 'in_progress', 'completed'], 
        default: 'pending'
    },
    }, 
{ timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);