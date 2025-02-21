import { writable, type Writable } from 'svelte/store';

interface OrderStore {
    subscribe: Writable<string | null>['subscribe'];
    setCode: (code: string) => void;
    clearCode: () => void;
}

function createOrderStore(): OrderStore {
    // Initialize store with value from localStorage if it exists
    const storedCode = typeof window !== 'undefined' ? localStorage.getItem('orderCode') : null;
    const { subscribe, set } = writable<string | null>(storedCode);

    return {
        subscribe,
        setCode: (code: string) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('orderCode', code);
            }
            set(code);
        },
        clearCode: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('orderCode');
            }
            set(null);
        }
    };
}

export const orderCode = createOrderStore();
