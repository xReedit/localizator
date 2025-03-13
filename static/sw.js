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
            icon: '/icon-192.png',  // Ícono grande para notificaciones
            badge: '/badge-96.png',  // Badge para la barra de notificaciones
            vibrate: notificationData.vibrate || [200, 100, 200, 100, 200],
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
                icon: '/icon-192.png',
                badge: '/badge-96.png',
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
    
    const urlToOpen = new URL('/', self.location.origin).href;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Si hay una ventana abierta, enfócala y actualiza
                for (const client of windowClients) {
                    if (client.url === urlToOpen) {
                        return client.focus().then(client => {
                            client.postMessage({ type: 'CHECK_STATUS' });
                            return client;
                        });
                    }
                }
                // Si no hay ventana abierta, abre una nueva
                return clients.openWindow(urlToOpen);
            })
    );
});

// Asegurarnos de que el service worker se mantiene activo
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
