const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// =====================
// MODELS
// =====================

const FriendRequest = sequelize.define('FriendRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    tableName: 'friend_requests',
    underscored: true
});

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
}, {
    tableName: 'friendships',
    underscored: true
});

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
}, {
    tableName: 'chats',
    underscored: true,
    timestamps: true
});

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'sent',
        allowNull: false
    }
}, {
    tableName: 'messages',
    underscored: true,
    timestamps: true
});

// =====================
// ASSOCIATIONS
// =====================

// ---------------------
// FRIEND REQUEST
// ---------------------
User.hasMany(FriendRequest, {
    as: 'SentRequests',
    foreignKey: 'sender_id'
});

User.hasMany(FriendRequest, {
    as: 'ReceivedRequests',
    foreignKey: 'receiver_id'
});

FriendRequest.belongsTo(User, {
    as: 'Sender',
    foreignKey: 'sender_id'
});

FriendRequest.belongsTo(User, {
    as: 'Receiver',
    foreignKey: 'receiver_id'
});

// ---------------------
// FRIENDSHIP (FIXED)
// ---------------------
Friendship.belongsTo(User, {
    as: 'User1',
    foreignKey: 'user1_id'
});

Friendship.belongsTo(User, {
    as: 'User2',
    foreignKey: 'user2_id'
});

User.hasMany(Friendship, {
    foreignKey: 'user1_id'
});

User.hasMany(Friendship, {
    foreignKey: 'user2_id'
});

// ---------------------
// CHAT
// ---------------------
Chat.belongsTo(User, {
    as: 'User1',
    foreignKey: 'user1_id'
});

Chat.belongsTo(User, {
    as: 'User2',
    foreignKey: 'user2_id'
});

Chat.belongsTo(Message, {
    as: 'LastMessage',
    foreignKey: 'last_message_id',
    constraints: false
});

// ---------------------
// MESSAGE
// ---------------------
Message.belongsTo(Chat, {
    foreignKey: 'chat_id'
});

Message.belongsTo(User, {
    as: 'Sender',
    foreignKey: 'sender_id'
});

Message.belongsTo(User, {
    as: 'Receiver',
    foreignKey: 'receiver_id'
});

// =====================
// EXPORTS
// =====================
module.exports = {
    User,
    FriendRequest,
    Friendship,
    Chat,
    Message,
    sequelize
};