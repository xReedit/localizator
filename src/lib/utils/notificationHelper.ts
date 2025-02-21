export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.error('Este navegador no soporta notificaciones');
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

export async function subscribeUserToPush(): Promise<PushSubscription | null> {
    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Usar el endpoint local para obtener la clave VAPID
        const response = await fetch('/api/vapid-key');
        const { publicKey } = await response.json();
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        });
        
        return subscription;
    } catch (error) {
        console.error('Error al suscribir:', error);
        return null;
    }
}
