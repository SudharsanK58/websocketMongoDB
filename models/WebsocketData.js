const mongoose = require('mongoose');

const WebsocketDataSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    ticketId: { type: String, required: true },
    status: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('WebsocketData', WebsocketDataSchema);
