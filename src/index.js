const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const {
    generateMessage,
    generateLocationMessage,
} = require('./utils/messages');

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require('./utils/users');

const app = express();

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));
app.use(express.json());

//setup raw http
const server = http.createServer(app);
const io = socketio(server);

// let count = 0;

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', `Welcome!`));
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                generateMessage('Admin', `${user.username} has joined!`),
            );
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profunity is not allowed!');
        }

        io.to(user.room).emit(
            'message',
            generateMessage(user.username, message),
        );
        callback();
    });

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit(
            'locationMessage',
            generateLocationMessage(
                user.username,
                `https://google.com/maps?q=${latitude},${longitude}`,
            ),
        );
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                generateMessage('Admin', `${user.username} has left`),
            );
            socket.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });

    // socket.emit('countUpdated', count);
    // socket.on('increment', () => {
    //     count++;
    //     //cái này là gửi 1 user (user hiện tại);
    //     // socket.emit('countUpdated', count);
    //     //cái này là gửi cho toàn bộ user đều nhìn thấy
    //     io.emit('countUpdated', count);
    // });
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
});
