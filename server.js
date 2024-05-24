const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["my-custom-header"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Send selected fields from the collection to the client upon connection
    io.on("connection", async (socket) => {
      console.log("A user connected");
      try {
        const db = mongoose.connection.db;
        const allData = await db
          .collection("DeviceLog")
          .find()
          .sort({ timestamp: -1 }) // Sort by timestamp in descending order
          .toArray();

        // Map documents to return only selected fields
        const formattedData = allData.map((doc) => ({
          deviceId: doc.deviceId || "N/A",
          timestamp: doc.timestamp || "N/A",
          StartingTime: doc.StartingTime || "N/A",
          validationTopic: doc.validationTopic || "N/A",
          bleMacAddress: doc.bleMacAddress || "N/A",
          networkConnection: doc.networkConnection || "N/A",
          networkName: doc.networkName || "N/A",
          bleMinor: doc.bleMinor || "N/A",
          bleTxpower:
            doc.bleTxpower !== undefined ? parseInt(doc.bleTxpower) : "N/A",
          bleVersion: doc.bleVersion || "N/A",
          current_temp: doc["current temp"] || "N/A", // Bracket notation for field with space
          firmwareVersion: doc.firmwareVersion || "N/A",
          vehicleNo: doc.vehicleNo || "N/A",
        }));

        socket.emit("initialData", formattedData); // Send formatted data to the client
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    // Listen for changes in the DeviceLog collection
    const changeStream = mongoose.connection.collection("DeviceLog").watch();

    changeStream.on("change", async (change) => {
      console.log("Change detected:", change);
      try {
        const db = mongoose.connection.db;
        const allData = await db
          .collection("DeviceLog")
          .find()
          .sort({ timestamp: -1 }) // Sort by timestamp in descending order
          .toArray();

        // Map documents to return only selected fields
        const formattedData = allData.map((doc) => ({
          deviceId: doc.deviceId || "N/A",
          timestamp: doc.timestamp || "N/A",
          StartingTime: doc.StartingTime || "N/A",
          validationTopic: doc.validationTopic || "N/A",
          bleMacAddress: doc.bleMacAddress || "N/A",
          networkConnection: doc.networkConnection || "N/A",
          networkName: doc.networkName || "N/A",
          bleMinor: doc.bleMinor || "N/A",
          bleTxpower:
            doc.bleTxpower !== undefined ? parseInt(doc.bleTxpower) : "N/A",
          bleVersion: doc.bleVersion || "N/A",
          current_temp: doc["current temp"] || "N/A", // Bracket notation for field with space
          firmwareVersion: doc.firmwareVersion || "N/A",
          vehicleNo: doc.vehicleNo || "N/A",
        }));

        io.emit("initialData", formattedData); // Send formatted data to all connected clients
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

server.listen(3001, () => {
  console.log("WebSocket server is running on port 3001");
});
