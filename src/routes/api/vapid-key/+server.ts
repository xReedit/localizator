import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_VAPID_KEY } from '$env/static/public';

export const GET: RequestHandler = async () => {
    return json({ publicKey: PUBLIC_VAPID_KEY });
};
