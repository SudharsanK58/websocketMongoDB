const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
    email: { type: String, required: true },
    page: { type: String, required: true },
    city: { type: String, default: null },
    region: { type: String, default: null },
    region_code: { type: String, default: null },
    postal: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    timezone: { type: String, default: null },
    utc_offset: { type: String, default: null },
    org: { type: String, default: null },
    browser_name: { type: String, required: true },
    timestamp: { type: Date, required: true }
});

const UserLog = mongoose.model('UserLog', userLogSchema, 'userLogs');

module.exports = UserLog;
