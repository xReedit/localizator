import webPush from 'web-push';
import { PRIVATE_VAPID_KEY } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';

// Configura las credenciales VAPID
webPush.setVapidDetails(
    'mailto:tu@email.com', // Reemplaza con tu email
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
);

export async function sendPushNotification(subscription: webPush.PushSubscription, message: string) {
    try {
        await webPush.sendNotification(
            subscription,
            JSON.stringify({
                message,
                timestamp: new Date().getTime()
            })
        );
        return true;
    } catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
}
