self.addEventListener('push', (event) => {
    const data = event.data.json();
    const notificationData = data.payload.notification;
    
    const options = {
        body: notificationData.body,
        icon: notificationData.icon || '/favicon.png',
        vibrate: [200, 100, 200, 100, 200],
        badge: '/badge.png',
        tag: 'order-ready',
        renotify: true,
        requireInteraction: true,
        silent: false,
        sound: '/notification.mp3',  // Añadir sonido específico
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Cerrar' }
        ]
    };

    // Reproducir sonido manualmente
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.log('Error playing sound:', error));

    event.waitUntil(
        self.registration.showNotification('Tu pedido está listo! 🔔', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Enfoca la ventana existente o abre una nueva
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                if (windowClients.length > 0) {
                    return windowClients[0].focus();
                }
                return clients.openWindow('/');
            })
    );
});
