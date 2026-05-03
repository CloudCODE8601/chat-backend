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

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false
}));

app.use(express.json());

// Routes
app.use('/api', meetingRoutes);

// Health check (optional but useful for Render)
app.get('/', (req, res) => {
    res.send('Server is running 🚀');
});

// Socket.IO signaling
socketHandler(io);

// Server start
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
});