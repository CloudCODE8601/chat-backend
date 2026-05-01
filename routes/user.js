const express = require('express');
const auth = require('../middleware/auth');
const UserController = require('../controllers/UserController');
const router = express.Router();

    router.get('/', auth, UserController.updateProfile);
    router.put('/update-profile', auth, UserController.updateProfile);
    router.put('/change-password', auth, UserController.changePassword);

module.exports = router;