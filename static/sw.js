self.addEventListener('push', (event) => {
    try {
        const data = event.data.json();
        const notificationData = data.notification;

        // No podemos usar AudioContext en service workers, usamos la notificación nativa
        const options = {
            body: notificationData.body || 'Tu pedido está listo',
            icon: notificationData.icon || '/favicon.png',
            vibrate: notificationData.vibrate || [200, 100, 200, 100, 200],
            badge: '/badge.png',
            tag: 'order-ready',
            renotify: true,
            requireInteraction: true,
            silent: false,  // Esto permite el sonido por defecto del sistema
            actions: [
                { action: 'open', title: 'Abrir' },
                { action: 'close', title: 'Cerrar' }
            ],
            sound: '/notification.mp3'  // En algunos navegadores esto funcionará
        };

        event.waitUntil(
            self.registration.showNotification(
                notificationData.title || 'Notificación de Pedido',
                options
            )
        );
    } catch (error) {
        console.error('Error processing push notification:', error);
        
        // Fallback en caso de error
        event.waitUntil(
            self.registration.showNotification('Notificación de Pedido', {
                body: 'Hay una actualización de tu pedido',
                icon: '/favicon.png',
                vibrate: [200, 100, 200],
                requireInteraction: true,
                silent: false
            })
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
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

// Asegurarnos de que el service worker se mantiene activo
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
