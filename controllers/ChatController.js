const { Chat, Message, User, Friendship } = require('../models');
const { Op } = require('sequelize');

const ChatController = {
    startChat: async (req, res) => {
        try {
            const { friend_id } = req.body;

            let chat = await Chat.findOne({
                where: {
                    [Op.or]: [
                        { user1_id: req.user.id, user2_id: friend_id },
                        { user1_id: friend_id, user2_id: req.user.id }
                    ]
                }
            });

            if (!chat) {
                chat = await Chat.create({
                    user1_id: req.user.id,
                    user2_id: friend_id
                });

                await Friendship.update(
                    { chat_id: chat.id },
                    {
                        where: {
                            [Op.or]: [
                                { user1_id: myId, user2_id: friend_id },
                                { user1_id: friend_id, user2_id: myId }
                            ]
                        }
                    }
                );
            }

            res.json(chat);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getChats: async (req, res) => {
        try {
            const chats = await Chat.findAll({
                where: {
                    [Op.or]: [{ user1_id: req.user.id }, { user2_id: req.user.id }]
                },
                include: [
                    { model: User, as: 'User1', attributes: ['id', 'name', 'profile_picture_url', 'is_online', 'last_seen'] },
                    { model: User, as: 'User2', attributes: ['id', 'name', 'profile_picture_url', 'is_online', 'last_seen'] },
                    { model: Message, as: 'LastMessage' }
                ],
                order: [['updated_at', 'DESC']]
            });
            res.json(chats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getMessages: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const messages = await Message.findAndCountAll({
                where: { chat_id: chatId },
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = ChatController;