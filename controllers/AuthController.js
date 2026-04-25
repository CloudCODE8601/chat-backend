const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const AuthController = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const password_hash = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password_hash });

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ user, token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.json({ user, token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = AuthController;
