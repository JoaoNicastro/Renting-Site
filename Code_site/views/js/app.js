const activity = document.querySelector('.activity')
const msgInput = document.querySelector('input')

socket.on('connect', () => {
    // Emit 'joinChat' after the socket connection is established
    // and after 'username' and 'chatWithUserId' are expected to be defined
    socket.emit('joinChat', { userId: username, chatWithUserId: chatWithUserId });
});

function sendMessage(e) {
    e.preventDefault()
    if (msgInput.value.trim()) {
        socket.emit('message', { text: msgInput.value, username: username, chatWithUserId: chatWithUserId });

        scrollToBottom();

        msgInput.value = ""
    }
    msgInput.focus()
}

document.querySelector('form').addEventListener('submit', sendMessage)

// Listen for messages 
socket.on("message", (data) => {
    // Ensure 'data' is being logged to see its structure
    console.log(data); 

    const li = document.createElement('li');
    li.classList.add('message');

    const timeString = new Date(data.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false  // Adjust based on preference for 24-hour or 12-hour clock
    });

    if (data.username === username) {
        li.classList.add('sent');
        li.innerHTML = `
        <span class="sent">${data.text}</span>
        <span class="time">${timeString}</span>
        `
    } else {
        li.classList.add('received');
        li.innerHTML = `
        <span class="received">${data.text}</span>
        <span class="time">${timeString}</span>
        `
        scrollToBottom();
    }

    document.querySelector('ul').appendChild(li);
});

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', { username: username, chatWithUserId: chatWithUserId })
})

let activityTimer
socket.on("activity", (name) => {
    console.log(name)
    activity.textContent = `${name} is typing...`

    // Clear after 3 seconds 
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})

socket.on('loadMessages', (messages) => {
    messages.forEach(message => {
        displayMessage(message);
    });
    const messagesContainer = document.querySelector('#messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if(messages.length > 0) {
        const lastMessageId = messages[messages.length - 1].id;
        socket.emit('readMessages', {
            username: username,
            chatWithUserId: chatWithUserId,
            lastReadMessageId: lastMessageId
        });
    }
});

function displayMessage(message) {
    const messagesContainer = document.querySelector('#messages-container ul'); // Ensure you select the <ul> within #messages-container
    const messageElement = document.createElement('li');
    messageElement.classList.add('message'); // Apply common message styling

    messageElement.setAttribute('data-message-id', message.id);  // Ensure each message has an ID attribute

    const timeString = new Date(message.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Determine alignment by comparing message sender with current user
    if (message.from_username === username) {
        messageElement.classList.add('sent');
        messageElement.innerHTML = `
        <span class="sent">${message.text}</span>
        <span class="time">${timeString}</span>
        `
    } else {
        messageElement.classList.add('received');
        messageElement.innerHTML = `
        <span class="received">${message.text}</span>
        <span class="time">${timeString}</span>
        `
    }

    messagesContainer.appendChild(messageElement);
}

function scrollToBottom() {
    setTimeout(() => {
        const messagesContainer = document.querySelector('#messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100); // A delay of 0-100 milliseconds can be sufficient
}