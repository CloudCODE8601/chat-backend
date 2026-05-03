const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const meetingRoutes = require('./routes/meetingRoutes');
const socketHandler = require('./socket/socketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false
}));
app.use(express.json());

// Preflight handler
app.options(/.*/, cors());

// Routes
app.use('/api', meetingRoutes);

// Socket.IO signaling
socketHandler(io);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
});