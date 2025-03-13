import { writable, type Writable } from 'svelte/store';

interface TableData {
    number: string;
    timestamp: number;
}

interface TableStore {
    subscribe: Writable<string>['subscribe'];
    setTableNumber: (number: string) => void;
    clearTableNumber: () => void;
}

const EXPIRATION_TIME = 3 * 60 * 60 * 1000; // 3 horas en milisegundos

function isTableDataValid(data: TableData): boolean {
    const now = Date.now();
    return (now - data.timestamp) < EXPIRATION_TIME;
}

function createTableStore(): TableStore {
    let storedTableData: TableData | null = null;

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('tableData');
        if (stored) {
            storedTableData = JSON.parse(stored);
            if (storedTableData && !isTableDataValid(storedTableData)) {
                localStorage.removeItem('tableData');
                storedTableData = null;
            }
        }
    }

    const { subscribe, set } = writable<string>(storedTableData?.number || '');

    return {
        subscribe,
        setTableNumber: (number: string) => {
            if (typeof window !== 'undefined') {
                const tableData: TableData = {
                    number,
                    timestamp: Date.now()
                };
                localStorage.setItem('tableData', JSON.stringify(tableData));
            }
            set(number);
        },
        clearTableNumber: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('tableData');
            }
            set('');
        }
    };
}

export const tableStore = createTableStore();

// Verificar expiración periódicamente
if (typeof window !== 'undefined') {
    setInterval(() => {
        const stored = localStorage.getItem('tableData');
        if (stored) {
            const data: TableData = JSON.parse(stored);
            if (!isTableDataValid(data)) {
                tableStore.clearTableNumber();
            }
        }
    }, 60000); // Verificar cada minuto
}
