const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const UserLog = require('./models/userLog');
const WebsocketData = require('./models/WebsocketData');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

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
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  }
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');

  // Send all data from the collection to the client upon connection
  io.on('connection', async (socket) => {
    console.log('A user connected');
    try {
      const allData = await WebsocketData.find();
      socket.emit('initialData', allData); // Send all data to the client
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  const changeStream = WebsocketData.watch();

  // Send updated data to the client whenever a change occurs in the collection
  changeStream.on('change', async (change) => {
    console.log('Change detected:', change);
    try {
      const allData = await WebsocketData.find();
      io.emit('initialData', allData); // Send updated data to all connected clients
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

server.listen(3000, () => {
  console.log('WebSocket server is running on port 3000');
});
// Route to serve HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// CRUD APIs for websocketdata collection
app.post('/websocketdata', async (req, res) => {
    try {
        const newData = new WebsocketData(req.body);
        await newData.save();
        io.sockets.emit('websocketDataChange', { operationType: 'insert', fullDocument: newData });
        res.status(201).json(newData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/websocketdata', async (req, res) => {
    try {
        const data = await WebsocketData.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/websocketdata/:id', async (req, res) => {
    try {
        const updatedData = await WebsocketData.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedData) return res.status(404).json({ message: 'Data not found' });
        io.sockets.emit('websocketDataChange', { operationType: 'update', documentKey: { _id: req.params.id }, updateDescription: { updatedFields: req.body } });
        res.status(200).json(updatedData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/websocketdata/:id', async (req, res) => {
    try {
        const deletedData = await WebsocketData.findByIdAndDelete(req.params.id);
        if (!deletedData) return res.status(404).json({ message: 'Data not found' });
        io.sockets.emit('websocketDataChange', { operationType: 'delete', documentKey: { _id: req.params.id } });
        res.status(200).json({ message: 'Data deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});