self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    // Extraer la información de notificación del payload
    const notificationData = data.payload.notification;
    
    const options = {
        body: notificationData.body,
        icon: notificationData.icon || '/favicon.png',
        vibrate: notificationData.vibrate,
        lang: notificationData.lang || 'es',
        tag: 'order-ready',
        renotify: true,
        requireInteraction: true,
        silent: false
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
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
