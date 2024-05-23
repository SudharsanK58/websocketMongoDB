const express = require('express');
const mongoose = require('mongoose');
const UserLog = require('./models/userLog'); // Ensure the correct path to your model
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Home Route
app.get('/', (req, res) => {
    res.send('Hello NODE API');
});

// Route to get all user logs
app.get('/userLogs', async (req, res) => {
    try {
        const userLogs = await UserLog.find({});
        console.log('userLogs:', userLogs); // Debug logging
        res.status(200).json(userLogs);
    } catch (error) {
        console.error('Error fetching user logs:', error); // Detailed error logging
        res.status(500).json({ message: error.message });
    }
});

// Route to insert a test log
app.get('/insertTestLog', async (req, res) => {
    try {
        const testLog = new UserLog({
            email: 'test@example.com',
            page: '/test',
            city: 'Test City',
            region: 'Test Region',
            region_code: 'TR',
            postal: '12345',
            latitude: 0,
            longitude: 0,
            timezone: 'Test/Timezone',
            utc_offset: '+0000',
            org: 'Test Org',
            browser_name: 'Test Browser',
            timestamp: new Date()
        });
        await testLog.save();
        res.status(200).json({ message: 'Test log inserted' });
    } catch (error) {
        console.error('Error inserting test log:', error);
        res.status(500).json({ message: error.message });
    }
});

const mongoUri = process.env.MONGO_URI;

console.log('Connecting to MongoDB with URI:', mongoUri); // Debug logging

mongoose.set('strictQuery', false);

mongoose
    .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => {
            console.log('Node API app is running on port 3000');
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
