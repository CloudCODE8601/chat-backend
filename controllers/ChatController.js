const { Chat, Message, User } = require('../models');
const { Op } = require('sequelize');

const ChatController = {
    // ======================
    // GET CHAT LIST (WHATSAPP STYLE)
    // ======================
    getChats: async (req, res) => {
        try {
            const userId = req.user.id;

            const chats = await Chat.findAll({
                where: {
                    [Op.or]: [
                        { user1_id: userId },
                        { user2_id: userId }
                    ]
                },

                include: [
                    {
                        model: User,
                        as: 'User1',
                        attributes: ['id', 'name', 'profile_picture_url', 'is_online', 'last_seen']
                    },
                    {
                        model: User,
                        as: 'User2',
                        attributes: ['id', 'name', 'profile_picture_url', 'is_online', 'last_seen']
                    },
                    {
                        model: Message,
                        as: 'LastMessage',
                        required: false,
                        attributes: ['id', 'content', 'createdAt', 'status']
                    }
                ],

                order: [
                    ['updatedAt', 'DESC']
                ]
            });

            // 🔥 FORMAT RESPONSE LIKE WHATSAPP
            const formatted = chats.map(chat => {
                const chatJson = chat.toJSON();

                return {
                    id: chatJson.id,
                    user1: chatJson.User1,
                    user2: chatJson.User2,
                    lastMessage: chatJson.LastMessage || null,
                    updatedAt: chatJson.updatedAt
                };
            });

            res.json(formatted);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    // ======================
    // GET MESSAGES (FIXED PAGINATION)
    // ======================
    getMessages: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const offset = (page - 1) * limit;

            const messages = await Message.findAndCountAll({
                where: { chat_id: chatId },

                order: [
                    ['createdAt', 'DESC'] // ✅ FIXED (was created_at)
                ],

                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                total: messages.count,
                page: parseInt(page),
                messages: messages.rows
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = ChatController;