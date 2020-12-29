// const incrementButton = document.querySelector('#increment');

//Elements
const $messages = document.querySelector('#messages');
const $messageForm = document.querySelector('#messageForm');
const $messageInput = document.querySelector('#messageInput');
const $messageBtn = document.querySelector('#messageButton');
const $sendLocationBtn = document.querySelector('#sendLocation');

//Templates
const $messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const $locationTemplate = document.querySelector('#locationTemplate').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const username = new URLSearchParams(location.search).get('username');
const room = new URLSearchParams(location.search).get('room');

const socket = io();

//function
const autoScroll = () => {
    //get new message element
    const $newMessage = $messages.lastElementChild;

    //Calculate height + margin of new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMarginBottom = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMarginBottom;

    //Visible height messages
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    //if position visibleHeight at bottom => scroll else no scroll (ex: when user checking old message then no scroll bot)
    if (containerHeight - newMessageHeight <= scrollOffset + 8) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on('message', (messageObj) => {
    const html = Mustache.render($messageTemplate, {
        username: messageObj.username,
        message: messageObj.text,
        createdAt: moment(messageObj.createAt).format('HH:mm'),
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (urlObj) => {
    console.log(urlObj);
    const html = Mustache.render($locationTemplate, {
        username: urlObj.username,
        url: urlObj.url,
        createdAt: moment(urlObj.createdAt).format('HH:mm'),
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users,
    });

    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    message = e.target.children.message.value;

    $messageBtn.setAttribute('disabled', true);

    socket.emit('sendMessage', message, (error) => {
        $messageBtn.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Delivered');
    });
});

$sendLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not support by your browser');
    }

    $sendLocationBtn.setAttribute('disabled', true);

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        socket.emit('sendLocation', { latitude, longitude }, () => {
            $sendLocationBtn.removeAttribute('disabled');
            console.log('Send success!');
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated ', count);
// });

// incrementButton.addEventListener('click', () => {
//     console.log('Clicked!');
//     socket.emit('increment');
// });
