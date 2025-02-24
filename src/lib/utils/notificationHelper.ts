export async function checkNotificationPermission(): Promise<boolean> {
    return Notification.permission === 'granted';
}

export async function requestNotificationPermission(): Promise<boolean> {
    try {
        if (!('Notification' in window)) {
            console.error('Este navegador no soporta notificaciones');
            return false;
        }

        // Verificar si ya tenemos permiso
        if (await checkNotificationPermission()) {
            return true;
        }

        const notificationPermission = await Notification.requestPermission();
        return notificationPermission === 'granted';
    } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
    }
}

export async function subscribeUserToPush(): Promise<PushSubscription | null> {
    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Verificar si ya existe una suscripción
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            return existingSubscription;
        }
        
        // Si no existe, crear nueva suscripción
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
