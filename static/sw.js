self.addEventListener('push', (event) => {
    try {
        const data = event.data.json();
        console.log('Push data received:', data); // Para debugging

        // Intentar obtener los datos de notificación de diferentes estructuras posibles
        const notificationData = data.notification || data.payload?.notification || {
            title: data.title || data.payload?.title,
            body: data.message || data.payload?.message || data.body || data.payload?.body
        };

        if (!notificationData) {
            throw new Error('No notification data found in payload');
        }

        const options = {
            body: notificationData.body || 'Tu pedido está listo',
            icon: notificationData.icon || '/favicon.png',
            vibrate: notificationData.vibrate || [200, 100, 200, 100, 200],
            badge: '/badge.png',
            tag: 'order-ready',
            renotify: true,
            requireInteraction: true,
            silent: false,
            data: {
                // Guardar datos adicionales si los hay
                timestamp: new Date().getTime(),
                originalData: data
            },
            actions: [
                { action: 'open', title: 'Abrir' },
                { action: 'close', title: 'Cerrar' }
            ]
        };

        // Para debugging
        console.log('Notification options:', {
            title: notificationData.title || 'Notificación de Pedido',
            options: options
        });

        event.waitUntil(
            self.registration.showNotification(
                notificationData.title || 'Notificación de Pedido',
                options
            )
        );
    } catch (error) {
        console.error('Error processing push notification:', error);
        console.error('Raw data:', event.data ? event.data.text() : 'No data');
        
        // Fallback con datos del error para debugging
        event.waitUntil(
            self.registration.showNotification('Notificación de Pedido', {
                body: 'Hay una actualización de tu pedido',
                icon: '/favicon.png',
                vibrate: [200, 100, 200],
                requireInteraction: true,
                silent: false,
                data: {
                    error: error.message,
                    timestamp: new Date().getTime()
                }
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
