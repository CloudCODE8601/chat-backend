// controllers\UserController.js
const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const UserController = {

    getProfile: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: [
                    'id',
                    'name',
                    'email',
                    'profile_picture_url',
                    'is_online',
                    'last_seen'
                ]
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name } = req.body;

            let profile_picture_url = req.body.profile_picture_url;

            if (req.file) {
                profile_picture_url = `/uploads/${req.file.filename}`;
            }

            await User.update(
                { name, profile_picture_url },
                { where: { id: userId } }
            );

            const user = await User.findByPk(userId, {
                attributes: [
                    'id',
                    'name',
                    'email',
                    'profile_picture_url'
                ]
            });

            res.json(user);

        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    message: 'All fields required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: 'Password must be at least 6 characters'
                });
            }

            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isMatch = await bcrypt.compare(
                oldPassword,
                user.password_hash
            );

            if (!isMatch) {
                return res.status(400).json({
                    message: 'Old password incorrect'
                });
            }

            const hashed = await bcrypt.hash(newPassword, 10);

            await user.update({ password_hash: hashed });

            res.json({ message: 'Password updated' });

        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
};

module.exports = UserController;