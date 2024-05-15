const socket = io();

// Listen for the roommate request event
socket.on('roommateRequest', (data) => {
    const notification = document.createElement('div');
    notification.className = 'roommate-request-notification';
    notification.innerHTML = `
        <p>${data.from} has invited you to become roommates.</p>
        <button id="accept-roommate">Accept</button>
        <button id="deny-roommate">Deny</button>
    `;

    document.body.appendChild(notification);

    document.getElementById('accept-roommate').addEventListener('click', () => {
        socket.emit('acceptRoommateRequest', { from: data.from, to: data.to });
        document.body.removeChild(notification);
    });

    document.getElementById('deny-roommate').addEventListener('click', () => {
        socket.emit('denyRoommateRequest', { from: data.from, to: data.to });
        document.body.removeChild(notification);
    });
});