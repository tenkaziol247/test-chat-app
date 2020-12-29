//addUser, removeUser, getUser, getUsersInRoom
const users = [];

const addUser = ({ id, username, room }) => {
    //clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!',
        };
    }

    //Check for existing user
    const existingUser = users.find(
        (user) => user.username === username && user.room === room,
    );

    if (existingUser) {
        return {
            error: 'Username is in use!',
        };
    }

    //Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const indexUser = users.findIndex((user) => user.id === id);
    if (indexUser !== -1) {
        return users.splice(indexUser, 1)[0];
    }
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
