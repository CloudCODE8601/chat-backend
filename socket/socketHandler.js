const roomStore = require('../utils/roomStore');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // ================= JOIN =================
        socket.on('join-room', ({ meetingId, userId, userName }) => {
            const room = roomStore.getRoom(meetingId);

            if (!room) {
                socket.emit('error', { message: 'Meeting not found' });
                return;
            }

            socket.join(meetingId);

            // store on socket
            socket.userId = userId;
            socket.userName = userName;
            socket.meetingId = meetingId;

            // save participant
            room.participants.push({
                userId,
                userName,
                socketId: socket.id,
            });

            console.log(`User ${userName} (${socket.id}) joined room: ${meetingId}`);

            // 🔥 Send existing users to NEW user (IMPORTANT)
            const existingUsers = room.participants
                .filter(p => p.socketId !== socket.id)
                .map(p => ({
                    socketId: p.socketId,
                    userName: p.userName,
                }));

            socket.emit('existing-users', existingUsers);

            // 🔥 Notify others
            socket.to(meetingId).emit('user-joined', {
                socketId: socket.id,
                userName,
            });
        });

        // ================= OFFER =================
        socket.on('offer', ({ offer, to, userName }) => {
            console.log(`Offer: ${socket.id} → ${to}`);

            io.to(to).emit('offer', {
                offer,
                from: socket.id, // ✅ FIXED
                userName,
            });
        });

        // ================= ANSWER =================
        socket.on('answer', ({ answer, to }) => {
            console.log(`Answer: ${socket.id} → ${to}`);

            io.to(to).emit('answer', {
                answer,
                from: socket.id, // ✅ FIXED
            });
        });

        // ================= ICE =================
        socket.on('ice-candidate', ({ candidate, to }) => {
            io.to(to).emit('ice-candidate', {
                candidate,
                from: socket.id, // ✅ FIXED
            });
        });

        // ================= LEAVE =================
        socket.on('disconnect', () => {
            const { meetingId, userName } = socket;

            if (meetingId) {
                const room = roomStore.getRoom(meetingId);

                if (room) {
                    room.participants = room.participants.filter(
                        p => p.socketId !== socket.id
                    );

                    console.log(`User ${userName} left room: ${meetingId}`);

                    socket.to(meetingId).emit('user-left', {
                        socketId: socket.id, // ✅ FIXED
                    });
                }
            }

            console.log(`User disconnected: ${socket.id}`);
        });
    });
};