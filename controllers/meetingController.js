const { v4: uuidv4 } = require('uuid');
const roomStore = require('../utils/roomStore');

exports.createMeeting = (req, res) => {
    try {
        const meetingId = uuidv4().substring(0, 8); // Short UUID for easier sharing
        const room = roomStore.createRoom(meetingId, {
            hostId: req.body.hostId || null,
            title: req.body.title || 'New Meeting'
        });
        
        res.status(201).json({
            success: true,
            meetingId: room.id,
            message: 'Meeting created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating meeting',
            error: error.message
        });
    }
};

exports.getMeeting = (req, res) => {
    const { id } = req.params;
    const room = roomStore.getRoom(id);
    
    if (room) {
        res.status(200).json({
            success: true,
            meeting: room
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Meeting not found'
        });
    }
};
