const { User, Message, Chat } = require('../models');

const socketService = (io) => {
    const onlineUsers = new Map(); // userId -> socketId

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('authenticate', async (userId) => {
            onlineUsers.set(userId, socket.id);
            await User.update({ is_online: true }, { where: { id: userId } });
            io.emit('user_status', { userId, is_online: true });
        });

        socket.on('send_message', async (data) => {
            const { chatId, senderId, receiverId, content } = data;
            const message = await Message.create({ chat_id: chatId, sender_id: senderId, receiver_id: receiverId, content });
            await Chat.update({ last_message_id: message.id }, { where: { id: chatId } });

            const sender = await User.findByPk(
                senderId,
                {
                    attributes: ['id', 'name', 'profile_picture_url', 'is_online', 'last_seen'],
                }
            );

            const messageWithSender = {
                ...message.toJSON(),
                sender
            };
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', messageWithSender);
            }
            socket.emit('message_sent', message);
        });

        socket.on('typing', (data) => {
            const { chatId, userId, receiverId } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', { chatId, userId });
            }
        });

        socket.on('disconnect', async () => {
            let disconnectedUserId;
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            if (disconnectedUserId) {
                await User.update({ is_online: false, last_seen: new Date() }, { where: { id: disconnectedUserId } });
                io.emit('user_status', { userId: disconnectedUserId, is_online: false, last_seen: new Date() });
            }
        });
    });
};

module.exports = socketService;
