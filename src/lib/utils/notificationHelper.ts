export async function requestNotificationPermission(): Promise<boolean> {
    try {
        if (!('Notification' in window)) {
            console.error('Este navegador no soporta notificaciones');
            return false;
        }

        // Solicitar permiso de notificación
        const notificationPermission = await Notification.requestPermission();
        
        // En algunos navegadores móviles, necesitamos verificar permisos de audio
        if ('permissions' in navigator) {
            await Promise.all([
                navigator.permissions.query({ name: 'notifications' }),
                navigator.permissions.query({ name: 'microphone' as PermissionName })
            ]);
        }

        // Intentar reproducir un sonido silencioso para habilitar el audio
        const audio = new Audio('/notification.mp3');
        await audio.play();
        audio.pause();
        audio.currentTime = 0;

        return notificationPermission === 'granted';
    } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
    }
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
