const rooms = new Map();

const createRoom = (id, data) => {
    rooms.set(id, {
        id,
        createdAt: new Date(),
        participants: [],
        ...data
    });
    return rooms.get(id);
};

const getRoom = (id) => rooms.get(id);

const deleteRoom = (id) => rooms.delete(id);

module.exports = {
    createRoom,
    getRoom,
    deleteRoom,
    rooms
};
