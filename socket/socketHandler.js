const roomStore = require('../utils/roomStore');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join Meeting
        socket.on('join-room', ({ meetingId, userId, userName }) => {
            const room = roomStore.getRoom(meetingId);
            if (!room) {
                socket.emit('error', { message: 'Meeting not found' });
                return;
            }

            socket.join(meetingId);
            
            // Store user info in socket session
            socket.userId = userId;
            socket.userName = userName;
            socket.meetingId = meetingId;

            // Add participant to roomStore
            if (!room.participants.find(p => p.userId === userId)) {
                room.participants.push({ userId, userName, socketId: socket.id });
            }

            console.log(`User ${userName} (${userId}) joined room: ${meetingId}`);

            // Notify others in the room
            socket.to(meetingId).emit('user-joined', {
                userId,
                userName,
                socketId: socket.id
            });

            // Send current participants to the new user
            const otherParticipants = room.participants.filter(p => p.userId !== userId);
            socket.emit('all-users', otherParticipants);
        });

        // WebRTC Signaling: Offer
        socket.on('offer', ({ offer, to, from, userName }) => {
            console.log(`Sending offer from ${from} to ${to}`);
            io.to(to).emit('offer', { offer, from, userName });
        });

        // WebRTC Signaling: Answer
        socket.on('answer', ({ answer, to, from }) => {
            console.log(`Sending answer from ${from} to ${to}`);
            io.to(to).emit('answer', { answer, from });
        });

        // WebRTC Signaling: ICE Candidate
        socket.on('ice-candidate', ({ candidate, to, from }) => {
            console.log(`Sending ICE candidate from ${from} to ${to}`);
            io.to(to).emit('ice-candidate', { candidate, from });
        });

        // Chat Message
        socket.on('send-message', ({ message, meetingId, userName, userId }) => {
            io.to(meetingId).emit('receive-message', {
                message,
                userName,
                userId,
                timestamp: new Date()
            });
        });

        // Toggle Video/Audio
        socket.on('toggle-media', ({ meetingId, userId, type, status }) => {
            socket.to(meetingId).emit('user-media-toggled', { userId, type, status });
        });

        // Leave Meeting
        socket.on('disconnect', () => {
            const { meetingId, userId, userName } = socket;
            if (meetingId) {
                const room = roomStore.getRoom(meetingId);
                if (room) {
                    room.participants = room.participants.filter(p => p.userId !== userId);
                    console.log(`User ${userName} left room: ${meetingId}`);
                    
                    socket.to(meetingId).emit('user-left', { userId, userName });

                    // Clean up room if empty
                    if (room.participants.length === 0) {
                        // Keep for a bit or delete immediately
                        // roomStore.deleteRoom(meetingId);
                    }
                }
            }
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
