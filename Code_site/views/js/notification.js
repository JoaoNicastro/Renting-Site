document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const notificationCount = document.getElementById('notification-count');

    // Join the user's own room
    socket.on('connect', () => {
        console.log('Connected to socket.io server');
        const userDataDiv = document.getElementById('user-data');
        if (userDataDiv) {
            const username = userDataDiv.getAttribute('data-username');
            if (username) {
                socket.emit('joinUserRoom', { username });
                console.log(`joinUserRoom event emitted for ${username}`);
            } else {
                console.error('Username not found in user-data attribute');
            }
        } else {
            console.error('user-data div not found');
        }
    });

    // Listen for the roommate request event
    socket.on('roommateRequest', (data) => {
        console.log(`Received roommateRequest event from ${data.from}`);
        const notification = document.createElement('div');
        notification.className = 'roommate-request-notification';
        notification.innerHTML = `
            <p>${data.from} has invited you to become roommates.</p>
            <button id="view-request">View</button>
        `;

        document.body.appendChild(notification);

        document.getElementById('view-request').addEventListener('click', () => {
            window.location.href = '/home';
            document.body.removeChild(notification);
        });

        const notificationCount = document.getElementById('notification-count');
        notificationCount.textContent = parseInt(notificationCount.textContent || '0') + 1;
        notificationCount.classList.remove('hidden');
    });
});