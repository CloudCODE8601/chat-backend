const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.get('/', auth, UserController.getProfile);

router.put(
    '/update-profile',
    auth,
    upload.single('file'),
    UserController.updateProfile
);

router.put('/change-password', auth, UserController.changePassword);

module.exports = router;