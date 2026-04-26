const express = require('express');
const FriendController = require('../controllers/FriendController');
const auth = require('../middleware/auth');
const router = express.Router();

// Search users
router.get('/search', auth, FriendController.searchUsers);

// Get friends list
router.get('/', auth, FriendController.getFriends);

// Get pending friend requests
router.get('/requests/pending', auth, FriendController.getPendingRequests);

// Send friend request
router.post('/request/send', auth, FriendController.sendFriendRequest);

// Accept friend request
router.post('/request/accept', auth, FriendController.acceptFriendRequest);

// Reject friend request
router.post('/request/reject', auth, FriendController.rejectFriendRequest);

// Check if users are friends
router.get('/check/:userId', auth, FriendController.checkFriendship);

module.exports = router;