import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// En producción, deberías guardar esto en una base de datos
const subscriptions = new Map<string, PushSubscription>();

export const POST: RequestHandler = async ({ request }) => {
    const { orderCode, subscription } = await request.json();
    
    subscriptions.set(orderCode, subscription);
    
    return json({ success: true });
};
