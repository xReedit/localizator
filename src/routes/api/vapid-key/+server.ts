import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = async () => {
    return json({ publicKey: env.PUBLIC_VAPID_PUBLIC_KEY });
};
