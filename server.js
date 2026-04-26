const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const socketService = require('./services/socket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    }
});

app.use(cors());
app.use(express.json());

// ✅ Root route (important for Render health check)
app.get('/', (req, res) => {
    res.send('🚀 Server is running');
});

// ✅ Optional test route
app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO
socketService(io);

const PORT = process.env.PORT || 3000;

// ✅ Connect DB (non-blocking)
sequelize.sync()
    .then(() => console.log("✅ Database connected"))
    .catch(err => console.error("❌ Database error:", err));

// ✅ ALWAYS start server (critical fix)
server.listen(PORT, () => {
    const baseURL = `http://localhost:${PORT}`;

    console.log(`🚀 Server running on ${baseURL}`);
    console.log(`📌 Auth API: ${baseURL}/api/auth`);
    console.log(`📌 Chat API: ${baseURL}/api/chat`);
    console.log(`🔌 Socket.IO: ${baseURL}`);
});