import { env } from '$env/dynamic/public';

export interface OrderStatus {
    idsede: number;
    idorg: number;
    idpedido: number;
    nom_marca: string;
    fecha_hora: string;  // Asegurarnos que es string para parsear la fecha
    fecha_hora_listo?: string;
    tiempo_transcurrido?: number;  // Tiempo en minutos
    estado: string
    estado_show: string
    table_number?: string;
}

export interface Room {
    idorg: number;
    idsede: number;
    roomName: string;
}

export function extractRoomsFromOrders(orders: OrderStatus[]): Room[] {
    // Usar Set para eliminar duplicados
    const uniqueRooms = new Set<string>();
    
    // Extraer las combinaciones únicas de idorg y idsede
    orders.forEach(order => {
        const roomName = `room_${order.idorg}_${order.idsede}`;
        uniqueRooms.add(roomName);
    });

    // Convertir a array de objetos Room
    return Array.from(uniqueRooms).map(roomName => {
        const [, idorg, idsede] = roomName.split('_');
        return {
            idorg: parseInt(idorg),
            idsede: parseInt(idsede),
            roomName
        };
    });
}

export async function checkOrderStatus(orderCode: string): Promise<{ data: OrderStatus[] } | null> {
    try {
        console.log('orderCode', orderCode);
        const response = await fetch(`${env.PUBLIC_URL_API_RESTOBAR}/holding/get-pedido-by-order-code?order_code=${orderCode}`);
        if (!response.ok) {
            throw new Error('Error al obtener el estado del pedido');
        }
        const data = await response.json();
        
        if (data.data) {
            // Encontrar si algún pedido tiene número de mesa
            const existingTableNumber = data.data.find((order: OrderStatus) => order.table_number)?.table_number;

            // Si existe un número de mesa, asignarlo a los pedidos que no lo tengan
            if (existingTableNumber) {
                const ordersWithoutTable = data.data
                    .filter((order: OrderStatus) => !order.table_number)
                    .map((order: OrderStatus) => order.idpedido)
                    .join(',');

                if (ordersWithoutTable) {
                    // Enviar el número de mesa para los nuevos pedidos
                    const rooms = extractRoomsFromOrders(data.data);
                    sendTableNumber(ordersWithoutTable, existingTableNumber, rooms, orderCode);
                }
            }

            // Calcular tiempo transcurrido para cada pedido
            data.data = data.data.map((order: OrderStatus) => {
                const fechaPedido = new Date(order.fecha_hora);
                const ahora = new Date();

                if (order.estado === '0') {
                    // Si está en preparación, calcular tiempo desde el inicio
                    const diferencia = ahora.getTime() - fechaPedido.getTime();
                    order.tiempo_transcurrido = Math.floor(diferencia / 1000 / 60);
                } else if (order.fecha_hora_listo) {
                    // Si tiene fecha de finalización, calcular tiempo total de preparación
                    const fechaListo = new Date(order.fecha_hora_listo);
                    const diferencia = fechaListo.getTime() - fechaPedido.getTime();
                    order.tiempo_transcurrido = Math.floor(diferencia / 1000 / 60);
                }
                return order;
            });
        }
        
        return data;
    } catch (error) {
        console.error('Error checking order status:', error);
        return null;
    }
}

// grabar la suscripcion en la base de datos	
export async function saveSubscription(subscription: PushSubscription, orderCode: string): Promise<boolean> {
    try {
        const dataSend = {
            order_code: orderCode,
            key_suscripcion_push: subscription
        }
        const response = await fetch(`${env.PUBLIC_URL_API_RESTOBAR}/holding/set-suscription-push-cliente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataSend)
        });
        return response.ok;
    } catch (error) {
        console.error('Error saving subscription:', error);
        return false;
    }
}

// enviar numero de mesa donde esta ubicado el cliente
export function sendTableNumber(idpedidos: string, table_number: string, rooms: any, orderCode: string): void {
    const dataSend = {
        order_code: orderCode,
        idpedidos: idpedidos,
        table_number: table_number,
        rooms: rooms
    }
    
    fetch(`${env.PUBLIC_URL_API_RESTOBAR}/holding/set-table-number`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataSend)
    }).catch(error => {
        console.error('Error sending table number:', error);
    });
}
