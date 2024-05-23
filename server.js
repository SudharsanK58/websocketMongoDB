const express = require('express');
const mongoose = require('mongoose');
const UserLog = require('./models/userLog');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Start the server and set up Socket.IO
const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const io = socketIo(server);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    const changeStream = UserLog.watch();

    changeStream.on('change', (change) => {
        console.log('Change detected:', change);
        io.sockets.emit('dataChange', change); // Broadcast change to all connected clients
    });
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Route to serve HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
