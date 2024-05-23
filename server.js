const express = require('express');
const mongoose = require('mongoose');
const UserLog = require('./models/userLog');
const WebsocketData = require('./models/WebsocketData');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Start the server and set up Socket.IO
const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

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
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
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