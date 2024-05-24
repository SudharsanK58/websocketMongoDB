const mongoose = require("mongoose");

// Define the schema for DeviceLog collection
const deviceLogSchema = new mongoose.Schema({
  deviceId: String,
  StartingTime: Date,
  bleMacAddress: String,
  bleMinor: Number,
  bleTxpower: Number,
  bleVersion: String,
  current_temp: String, // Changed to valid JavaScript variable name
  firmwareVersion: String,
  networkConnection: Number,
  networkName: String,
  timestamp: Date,
  validationTopic: String,
});

// Create and export the DeviceLog model
const DeviceLog = mongoose.model("DeviceLog", deviceLogSchema);

module.exports = DeviceLog;
