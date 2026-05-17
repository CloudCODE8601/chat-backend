const { User, Message, Chat } = require('../models');
const { Op } = require('sequelize');

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

            // default
            let status = 'sent';

            // receiver online?
            const receiverSocketId = onlineUsers.get(receiverId);

            // if (receiverSocketId) {
            //     status = 'delivered';
            // }

            // create message
            const message = await Message.create({ chat_id: chatId, sender_id: senderId, receiver_id: receiverId, content, status });

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

            // send receiver
            if (receiverSocketId) {

                io.to(receiverSocketId).emit('receive_message', messageWithSender);
            }

            // sender
            socket.emit('message_sent', messageWithSender);
        });

        socket.on('mark_delivered', async (data) => {

            const { senderId, messageId, receiverId } = data;

            await Message.update({ status: 'delivered' }, { where: { id: messageId } });

            const senderSocketId = onlineUsers.get(senderId);

            if (senderSocketId) {
                io.to(senderSocketId).emit('messages_delivered', { senderId, messageId, receiverId });
            }
        });

        socket.on('mark_all_delivered', async (data) => {

            const { items, receiverId } = data;

            await Message.update({ status: 'delivered' },
                {
                    where: {
                        chat_id: { [Op.in]: items.map(i => i.chatId) },
                        status: 'sent',
                        receiverId: receiverId,
                    }
                }
            );

            items.forEach(i => {
                const s = onlineUsers.get(i.senderId);

                if (s) {
                    io.to(s).emit('messages_all_delivered', { chatId: i.chatId });
                }
            });
        });

        socket.on('mark_seen', async (data) => {

            const { messageId, senderId, receiverId } = data;

            await Message.update({ status: 'seen' }, { where: { id: messageId } });

            // notify sender
            const senderSocketId = onlineUsers.get(senderId);

            if (senderSocketId) {
                io.to(senderSocketId).emit('message_seen', { messageId, senderId, receiverId });
            }

        });

        socket.on('mark_all_seen', async (data) => {

            const { senderId, chatId, receiverId } = data;

            await Message.update({ status: 'seen' }, { where: { chat_id: chatId, receiver_id: receiverId } });

            // notify sender
            const senderSocketId = onlineUsers.get(senderId);

            if (senderSocketId) {
                io.to(senderSocketId).emit('message_all_seen', { chatId });
            }

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
                const lastSeen = new Date();
                await User.update({ is_online: false, last_seen: lastSeen }, { where: { id: disconnectedUserId } });
                io.emit('user_status', { userId: disconnectedUserId, is_online: false, last_seen: lastSeen });
            }
        });
    });
};

module.exports = socketService;
