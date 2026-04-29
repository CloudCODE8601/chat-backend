const { User, FriendRequest, Friendship } = require('../models');
const { Op } = require('sequelize');

const FriendController = {
    // Search users by name or email
    searchUsers: async (req, res) => {
        try {
            const { query } = req.query;
            const users = await User.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { email: { [Op.iLike]: `%${query}%` } }
                    ],
                    id: { [Op.ne]: req.user.id } // Exclude current user
                },
                attributes: ['id', 'name', 'email', 'profile_picture_url', 'is_online', 'last_seen'],
                limit: 10
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Send friend request
    sendFriendRequest: async (req, res) => {
        try {
            const { receiverId } = req.body, senderId = req.user.id;

            if (senderId == receiverId)
                return res.status(400).json({ message: 'Invalid request' });

            if (await Friendship.findOne({
                where: {
                    user1_id: [senderId, receiverId],
                    user2_id: [senderId, receiverId]
                }
            })) {
                return res.status(400).json({ message: 'Already friends' });
            }

            if (await FriendRequest.findOne({
                where: {
                    sender_id: [senderId, receiverId],
                    receiver_id: [senderId, receiverId],
                    status: 'pending'
                }
            })) {
                return res.status(400).json({ message: 'Request already pending' });
            }

            res.status(201).json(
                await FriendRequest.create({
                    sender_id: senderId,
                    receiver_id: receiverId,
                    status: 'pending'
                })
            );

        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    // Get pending friend requests
    getPendingRequests: async (req, res) => {
        try {
            const requests = await FriendRequest.findAll({
                where: {
                    receiver_id: req.user.id,
                    status: 'pending'
                },
                include: [
                    { model: User, as: 'Sender', attributes: ['id', 'name', 'email', 'profile_picture_url'] }
                ]
            });
            res.json(requests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Accept friend request
    acceptFriendRequest: async (req, res) => {
        try {
            const { requestId } = req.body;
            const friendRequest = await FriendRequest.findByPk(requestId);

            if (!friendRequest) {
                return res.status(404).json({ message: 'Friend request not found' });
            }

            if (friendRequest.receiver_id !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            // Update request status
            await friendRequest.update({ status: 'accepted' });

            // Create friendship
            const friendship = await Friendship.create({
                user1_id: friendRequest.sender_id,
                user2_id: friendRequest.receiver_id
            });

            res.json({ message: 'Friend request accepted', friendship });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Reject friend request
    rejectFriendRequest: async (req, res) => {
        try {
            const { requestId } = req.body;
            const friendRequest = await FriendRequest.findByPk(requestId);

            if (!friendRequest) {
                return res.status(404).json({ message: 'Friend request not found' });
            }

            if (friendRequest.receiver_id !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            await friendRequest.update({ status: 'rejected' });
            res.json({ message: 'Friend request rejected' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get friends list
    getFriends: async (req, res) => {
        try {
            const friends = await Friendship.findAll({
                where: {
                    [Op.or]: [
                        { user1_id: req.user.id },
                        { user2_id: req.user.id }
                    ]
                },
                include: [
                    { model: User, as: 'User1', attributes: ['id', 'name', 'email', 'profile_picture_url', 'is_online', 'last_seen'] },
                    { model: User, as: 'User2', attributes: ['id', 'name', 'email', 'profile_picture_url', 'is_online', 'last_seen'] }
                ]
            });

            const friendList = friends.map(f => ({
                ...(f.user1_id === req.user.id
                    ? f.User2
                    : f.User1
                ).toJSON(),
                chat_id: f.chat_id
            }));

            res.json(friendList);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Check if users are friends
    checkFriendship: async (req, res) => {
        try {
            const { userId } = req.params;
            const friendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { user1_id: req.user.id, user2_id: userId },
                        { user1_id: userId, user2_id: req.user.id }
                    ]
                }
            });

            res.json({ isFriend: !!friendship });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = FriendController