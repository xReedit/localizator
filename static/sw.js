self.addEventListener('push', (event) => {
    const data = event.data.json();
    const options = {
        body: data.message,
        icon: '/icon.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        tag: 'order-notification',
        actions: [
            { action: 'open', title: 'Abrir pedido' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Estado del Pedido', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'open') {
        clients.openWindow('/');
    }
});
