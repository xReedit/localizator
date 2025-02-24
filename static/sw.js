self.addEventListener('push', (event) => {
    try {
        const data = event.data.json();
        const notificationData = data.payload.notification;
        
        // Crear el contexto de audio al recibir la notificación
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar el sonido
        oscillator.frequency.value = 440; // Frecuencia en Hz
        gainNode.gain.value = 0.5; // Volumen
        
        const options = {
            body: notificationData.body || 'Tu pedido está listo',
            icon: notificationData.icon || '/favicon.png',
            vibrate: notificationData.vibrate || [200, 100, 200, 100, 200],
            badge: '/badge.png',
            tag: 'order-ready',
            renotify: true,
            requireInteraction: true,
            silent: false,
            actions: [
                { action: 'open', title: 'Abrir' },
                { action: 'close', title: 'Cerrar' }
            ]
        };

        // Reproducir el sonido
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, 1000); // Duración del sonido en milisegundos

        event.waitUntil(
            self.registration.showNotification(
                notificationData.title || 'Notificación de Pedido',
                options
            )
        );
    } catch (error) {
        console.error('Error processing push notification:', error);
        
        // Fallback en caso de error al procesar el payload
        event.waitUntil(
            self.registration.showNotification('Notificación de Pedido', {
                body: 'Hay una actualización de tu pedido',
                icon: '/favicon.png',
                vibrate: [200, 100, 200],
                requireInteraction: true
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
