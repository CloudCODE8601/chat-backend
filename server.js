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
app.use('/api/friend', require('./routes/friend'));

// Socket.IO
socketService(io);

const PORT = process.env.PORT || 3000;

// ✅ Connect DB (non-blocking)
sequelize.sync().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// server.listen(PORT, () => {
//     console.log(`🚀 Server running`);
// });