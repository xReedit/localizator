<script lang="ts">
    import { onMount } from 'svelte';
    import { orderCode } from '$lib/stores/orderStore';
    import { generateOrderCode } from '$lib/utils/codeGenerator';
    import { checkOrderStatus, extractRoomsFromOrders, saveSubscription, sendTableNumber, type OrderStatus, type Room } from '$lib/services/orderService';
    import { checkNotificationPermission, requestNotificationPermission, subscribeUserToPush } from '$lib/utils/notificationHelper';
    import { tableStore } from '$lib/stores/tableStore';

    let mounted = false;
    let notificationsEnabled = false;
    let setupError = '';
    let suscripcionString = '';
    let listOrders: OrderStatus[] = [];
    let orderList: any = [];
    let rooms: Room[] = [];
    let statusError = '';    
    let tableNumber = '';
    let isEditingTable = false;

    async function checkStatus() {
        if ($orderCode) {
            try {
                const dataRptList: any = await checkOrderStatus($orderCode);
                orderList = dataRptList.data;                
                listOrders = dataRptList.data;
                rooms = extractRoomsFromOrders(listOrders);
                console.log('Rooms para Socket.IO:', rooms);
                if (!listOrders) {
                    statusError = 'No se pudo obtener el estado del pedido';
                }
            } catch (error) {
                statusError = 'Error al verificar el estado';
                console.error(error);
            }
        }
    }

    function formatTiempoTranscurrido(minutos: number): string {
        if (minutos < 60) {
            return `${minutos} min`;
        }
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas}h ${minutosRestantes}min`;
    }

    async function setupNotifications() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setupError = 'Tu navegador no soporta notificaciones push';
            return;
        }

        try {
            // Registrar el service worker si no está registrado
            let swRegistration;
            const existingRegistration = await navigator.serviceWorker.getRegistration();
            
            if (!existingRegistration) {
                swRegistration = await navigator.serviceWorker.register('/sw.js');
            } else {
                swRegistration = existingRegistration;
            }

            // Verificar o solicitar permisos
            const hasPermission = await checkNotificationPermission();
            const permissionGranted = hasPermission || await requestNotificationPermission();
            
            if (permissionGranted) {
                const subscription = await subscribeUserToPush();
                if (subscription) {
                    notificationsEnabled = true;
                    setupError = '';
                    suscripcionString = JSON.stringify(subscription);
                    if ($orderCode) {
                        saveSubscription(subscription, $orderCode);
                    } else {
                        console.error('Order code is null');
                    }
                }
            } else {
                setupError = 'Necesitamos tu permiso para enviar notificaciones';
            }
        } catch (error) {
            console.error('Error:', error);
            setupError = 'Error al configurar las notificaciones';
        }
    }

    onMount(() => {
        mounted = true;
        (async () => {
            if (!$orderCode) {
                const newCode = generateOrderCode();
                orderCode.setCode(newCode);
            }
            
            await checkStatus();
            
            const hasPermission = await checkNotificationPermission();
            if (hasPermission) {
                await setupNotifications();
            }
        })();

        // Configurar verificación periódica del estado
        const intervalId = setInterval(checkStatus, 30000); // Cada 30 segundos

        return () => {
            clearInterval(intervalId);
        };
    });

    function setTableNumber() {
        if (!tableNumber.trim()) return;
        
        const idpedidos = orderList.map((order: any) => order.idpedido).join(',');
        
        if ($orderCode) {
            sendTableNumber(idpedidos, tableNumber, rooms, $orderCode);
            tableStore.setTableNumber(tableNumber);
            tableNumber = '';
            isEditingTable = false;
        } else {
            console.error('Order code is null');
        }
    }

    function startEditingTable() {
        tableNumber = $tableStore;
        isEditingTable = true;
    }

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(suscripcionString);
            alert('Copiado al portapapeles!');
        } catch (err) {
            console.error('Error al copiar:', err);
            alert('Error al copiar al portapapeles');
        }
    }
</script>

<style>
    .contend-number-table {
        display: flex;
        border-radius: 5px;
        border: 1px solid #c5c5c5;
        background: #ffffff;
    }
</style>

{#if mounted}
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4 text-center">Localizador de Pedidos</h1>
        
        
        {#if $orderCode}
            <div class="bg-green-100 p-4 rounded-lg text-center" style="max-width: 450px; margin: 0 auto;">
                <h2 class="text-xl mb-2">Tu código de localización es:</h2>
                <p class="text-4xl font-bold">{$orderCode}</p>                
                {#if listOrders?.length == 0}                    
                    <p class="text-sm mt-2">Por favor comparte este código con el personal del restaurante</p>
                {:else}                    
                    <br>
                    <div>
                        <p>Por favor, especifique el número de mesa si desea que su pedido sea entregado en su ubicación. De lo contrario, puede acercarse a recibir su pedido cuando esté listo.</p>
                        {#if !$tableStore && !isEditingTable}
                            <div class="flex flex-row gap-1">
                                <input 
                                    type="text" 
                                    class="w-full mt-2 p-2 border rounded bg-white" 
                                    placeholder="Número de mesa" 
                                    bind:value={tableNumber} 
                                />
                                <button 
                                    on:click={setTableNumber}
                                    class="mt-2 w-25 bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Enviar
                                </button>
                            </div>
                        {:else}
                            <div class="flex items-center gap-2 mt-2">
                                {#if isEditingTable}
                                    <div class="flex flex-row gap-1 w-full">
                                        <input 
                                            type="text" 
                                            class="w-full p-2 border rounded bg-white" 
                                            placeholder="Número de mesa" 
                                            bind:value={tableNumber}
                                        />
                                        <button 
                                            on:click={setTableNumber}
                                            class="w-25 bg-blue-500 text-white px-4 py-2 rounded"
                                        >
                                            Actualizar
                                        </button>
                                    </div>
                                {:else}
                                    <div class="contend-number-table w-100">
                                        <p class="flex-1 p-2">
                                            <span class="font-semibold">Ubicación:</span> {$tableStore}
                                        </p>
                                        <button 
                                            on:click={startEditingTable}
                                            class="p-2 text-blue-600 hover:text-blue-800"
                                            title="Editar mesa"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    </div>


                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
                
                {#if listOrders?.length > 0}
                    <div class="mt-4 overflow-x-auto text-sm" style="font-size: 12px;">
                        <table class="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-4 py-2 text-left">Marca</th>
                                    <th class="px-4 py-2 text-left">Tiempo</th>
                                    <th class="px-4 py-2 text-left">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                            {#each listOrders as order}
                                <tr class="border-t">
                                    <td class="px-4 py-2">{order.nom_marca}</td>                                    
                                    <td class="px-4 py-2">
                                        {#if order.tiempo_transcurrido !== undefined}
                                            <span class={order.estado === '0' ? 
                                                (order.tiempo_transcurrido > 25 ? 'text-red-600' : 'text-green-600') : 
                                                'text-gray-600'}>
                                                {#if order.estado === '0'}
                                                    {formatTiempoTranscurrido(order.tiempo_transcurrido)}
                                                {:else}
                                                    Tiempo total: {formatTiempoTranscurrido(order.tiempo_transcurrido)}
                                                {/if}
                                            </span>
                                        {/if}
                                    </td>
                                    <td class="px-4 py-2">
                                        <span class={order.estado === '0' ? 'text-black' : 
                                                    order.estado === '1' ? 'text-red-600' : 
                                                    (order.estado === '2' || order.estado === '3') ? 'text-green-600 font-bold' : ''}>
                                            {order.estado_show}
                                        </span>
                                    </td>
                                </tr>
                            {/each}
                            </tbody>
                        </table>
                    </div>
                {:else if statusError}
                    <p class="mt-2 text-red-600 text-center">{statusError}</p>
                {/if}


                <div>
                    <button 
                        class="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded"
                        on:click={checkStatus}
                    >
                        Actualizar Estado
                    </button>
                    
                    {#if notificationsEnabled}
                        <p class="mt-2 text-green-600 text-center">
                            ✓ Recibirás una notificación cuando tu pedido esté listo
                        </p>
                    {:else}
                        {#if setupError}
                            <p class="mt-2 text-red-600 text-center">{setupError}</p>
                        {/if}
                        <button 
                            class="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded"
                            on:click={setupNotifications}
                        >
                            Activar notificaciones
                        </button>
                    {/if}
                </div>

            </div>
            <div class="mt-4">    
</div>
        {:else}
            <p>Generando código...</p>
        {/if}
    </div>
{/if}
